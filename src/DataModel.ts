/**
 * 功能介绍：
 *    数据模型转换层。
 *
 * Author: imengyu
 * Date: 2021/10/13
 *
 * Copyright (c) 2021 imengyu.top. Licensed under the MIT License.
 * See License.txt in the project root for license information.
 */

import { ConverterDataDirection, ConvertItemOptions, ConvertPolicy, DataConverter } from "./DataConverter";
import { DataObjectUtils, KeyValue, logError, logWarn, throwError } from "./DataUtils";

export type DataConvertCustomFn = (
  /**
   * 源数据
   */
  source: unknown,
  /**
   * 当前转换表条目
   */
  item: DataConvertItem,
  /**
   * 其他参数
   */
  options: ConvertItemOptions,
) => unknown;

/**
 * 数据转换方法定义
 */
export interface DataConvertItem {
  /**
   * 指定当前key转为服务端的数据类型
   */
  serverSide?: string;
  /**
   * 当前key类型是dayjs时，自定义日期格式
   */
  serverSideDateFormat?: string;
  /**
   * 指定当前key是否是必填，逻辑如图同 _convertPolicy 设置为 `*-required` 时。
   * 
   * * 此必填仅限制本地至服务端。
   * 
   * 以下几种情况会触发必填检查失败：
   * 
   * * 字段未提供（字段===undefined）
   * * 字段是 null
   */
  serverSideRequired?: boolean;
  /**
   * 当 serverSide 为 array/object 时，子项目要转换成的类型，通常可用于递归对象转换。
   * 
   * 例如：
   * ```js
   * this._convertTable = {
      //myObjectProp 会递归调用 MyDataModel 转换为服务端数据
      myObjectProp: { 
        serverSide: 'object',
        serverSideChildDataModel: MyDataModel
      },
      //myObjectArrayProp 会递归调用数组中的每个 MyDataModel 转换为服务端数据
      myObjectArrayProp: { 
        serverSide: 'array',
        serverSideChildDataModel: MyDataModel
      },
    };
   * ```
   */
  // eslint-disable-next-line no-use-before-define
  serverSideChildDataModel?: (new () => DataModel)|string;
  /**
   * 指定当前key转为前端时的数据类型
   */
  clientSide?: string;
  /**
   * 指定当前key是否是必填，逻辑如图同 _convertPolicy 设置为 `*-required` 时。
   * 
   * * 此必填仅限制服务端至本地。
   * 
   * 以下几种情况会触发必填检查失败：
   * 
   * * 字段未提供（字段===undefined）
   * * 字段是 null
   */
  clientSideRequired?: boolean;
  /**
   * 当前key类型是dayjs时，自定义日期格式
   */
  clientSideDateFormat?: string;
  /**
   * 当 clientSide 为 array/object 时，子项目要转换成的类型，通常可用于递归对象转换。
   * 
   * 例如：
   * ```js
   * this._convertTable = {
      //myObjectProp 类型是 MyDataModel
      myObjectProp: { 
        clientSide: 'object',
        clientSideChildDataModel: MyDataModel
      },
      //myObjectArrayProp 类型是 MyDataModel[]
      myObjectArrayProp: { 
        clientSide: 'array',
        clientSideChildDataModel: MyDataModel
      },
    };
   * ```
   */
  // eslint-disable-next-line no-use-before-define
  clientSideChildDataModel?: (new () => DataModel)|string;
  /**
   * 自定义前端至服务端转换函数，指定此函数后 serverSide 属性无效。
   * 
   * 例如：
   * ```js
    this._convertTable = {
      state: { 
        customToServerFn: (v) => {
          switch(v) {
            case 0: return '未支付';
            case 1: return '已支付';
            case 2: return '订单过期';
            case 3: return '订单关闭';
          }
          return '';
        },
      },
    };
   * ```
   */
  customToServerFn?: DataConvertCustomFn;
  /**
   * 自定义服务端至前端转换函数，指定此函数后 clientSide 属性无效。
   * 
   * 例如：
   * ```js
    this._convertTable = {
      state: { 
        customToClientFn: (v) => {
          switch(v) {
            case 0: return '未支付';
            case 1: return '已支付';
            case 2: return '订单过期';
            case 3: return '订单关闭';
          }
          return '';
        },
      },
    };
   * ```
   */
  customToClientFn?: DataConvertCustomFn;
}

/**
 * 双向数据模型实体类。
 * 该类提供了双向的数据转换。
 * 请继承此类定义自己的数据模型并设置转换相关设置。
 */
export class DataModel<T extends DataModel = any> implements KeyValue {

  //对象配置
  //=========================================

  //索引未定义的类型时，推断为 unknow
  [index: string]: unknown;

  private _classCreator: new() => T;
  private _classDebugName = '';

  /**
   * 创建实例
   * @param classCreator 传入当前类的实例
   * @param classDebugName 标记当前类，用于调试
   */
  public constructor(classCreator: new() => T, classDebugName = '') {
    this._classCreator = classCreator;
    this._classDebugName = classDebugName;
  }
  
  /**
   * 设置是否 子字段为空，则不传值至服务器
   * 
   * 空的情况：
   * * 字段值是 null
   * * 字段值是 undefined
   */
  public _dontSendToServerIfEmpty = false;
  /**
   * 设置是否子字段为空字符串，则不传值至服务器。
   */
  public _dontSendToServerIfEmptyString = false;
  /**
   * 从服务端转换后的后处理回调。
   * 
   * 如果实在遇到了特殊的转换，_convertTable无法满足你，你还可以在此回调中自由当前处理数据。
   * 
   * 此回调将在转换最后一个步骤调用，即 _convertTable 中的转换完成之后。
   * 
   * 例如：
   * ```js
   * this._afterSolveServer = () => {
      this.key = this.id;
      if (this.avatar_text) 
        this.avatar = this.avatar_text;
    }
   * ```
   */
  public _afterSolveServer: (() => void) | null = null;
  /**
   * 从本地端转换后的后处理回调。
   * 
   * 如果实在遇到了特殊的转换，_convertTable无法满足你，你还可以在此回调中自由当前处理数据。
   * 
   * 此回调将在转换最后一个步骤调用，即 _convertTable 中的转换完成之后。
   * 
   * 回调中的参数 data 是准备提交服务器端的数据，你可在回调中自由修改，你做出的修改也会被提交至服务端。
   * 
   * 例如：
   * ```js
    this._afterSolveClient = (data) => {
      if (data.type !== 1) 
        data.threshold = '';
      if (data.type !== 1 && data.type !== 2) 
        data.amount = '';
      if (data.type !== 3) 
        data.discount = '';
      if (data.validity_rule !== 2) 
        data.validity_days = '';
      if (data.validity_rule !== 1) {
        data.validity_start_time = '';
        data.validity_end_time = '';
      }
      if (data.release_restrict !== 0) 
        data.release_count = 0;
      if (data.receive_restrict !== 0) 
        data.receive_count = 0;
    };
   * ```
   */
  public _afterSolveClient: ((data: KeyValue) => void) | null = null;
  /**
   * 统一设置默认的日期格式。当 _convertTable 中未指定日期格式时，使用此日期格式。
   */
  public _defaultDateFormat = '';
  /**
   * 数据字段转换表。key类中的为属性名称，值是转换信息。
   */
  public _convertTable : { [index: string]: DataConvertItem }  = {};
  /**
   * 自定义字段转换类型，这在对象的属性个数不确定时很有用。此函数返回的类型优先级比 _convertTable 高。
   * 
   * 参数：
   * * key 当前准备转换的键名称
   * * direction 当前准备转换的方向
   * 
   * 例如：
   * ```js
    this._convertKeyType = (key, direction) => {
      //例如 open_state load_state 等等都将使用下面的转换
      if (key.endsWith('state')) {
        return {
          clientSide: 'boolean',
          serverState: 'number',
        };
      }
    }
   * ```
   */
  public _convertKeyType: ((key: string, direction: ConverterDataDirection) => DataConvertItem|undefined) | null = null;
  /**
   * 字段的名称映射表(服务端至客户端)，左边是服务端名称，右边是客户端名称。
   * * 效果：服务端字段是 a ，客户端转换之后会把它 赋值到名称为 b 的属性。
   * * 注：在转换表 convertTable 中使用的字段名称是 b 而不是 a。
   */
  public _nameMapperServer : { [index: string]: string }  = {};
  /**
   * 字段的名称映射表(客户端至服务端)，左边是客户端名称，右边是名称服务端.
   * * 效果：客户端字段是 a ，转换 a 到服务端数据之后会把它 赋值到名称为 b 的属性。
   * * 注：在转换表 convertTable 中使用的字段名称是 a 而不是 b。
   */
  public _nameMapperClient : { [index: string]: string }  = {};
  /**
   * 转换策略
   * * default 默认模式（松散模式）：对于在转换表中定义的字段，进行转换，如果转换失败不会给出警告，未在表中定义的字段数据按原样返回。
   * * strict-required 全部严格模式：在转换表中的字段，进行转换，如果未定义或者转换失败，则抛出异常。未在表中定义的数据会被忽略，不会写入结果。
   * * strict-provided 仅提供字段严格模式：在转换表中的字段同 strict-required，未在表中定义的字段数据按原样返回。
   * * warning 仅警告：同 default，但会在转换失败时给出警告。
   * * warning-required 警告：同 strict-required，但会在转换失败时给出警告而不是异常。
   * * warning-provided 警告：同 strict-provided，但会在转换失败时给出警告而不是异常。
   */
  public _convertPolicy : ConvertPolicy = 'default';
  /**
   * 字段黑名单表。黑名单中的字段不会被转换也不会被拷贝至目标中。
   * 分为：到服务器的黑名单与到前端的黑名单
   */
  public _blackList : {
    toServer: Array<string>
    toClient: Array<string>
  } = {
    toServer: [],
    toClient: [],
  };

  public _lastServerSideData : KeyValue|null = null;

  //获取数据方法
  //=========================================

  /**
   * 获取上次创建的服务端原始数据
   * @returns
   */
  public getLastServerSideData() : KeyValue|null {
    return DataObjectUtils.simpleClone(this._lastServerSideData) as KeyValue;
  }
  /**
   * 获取模型数据为纯JSON（不包括隐藏属性，函数等）。
   * @returns
   */
  public keyValue() : KeyValue {
    const loopObject = (obj: Record<string, unknown>|Array<unknown>) => {
      if (obj instanceof Array) {
        const result = [] as Array<unknown>;
        obj.forEach(element => {
          if (typeof element === 'boolean' || typeof element === 'string' || typeof element === 'number')
            result.push(element);
          else if (typeof element === 'object')
            result.push(loopObject(element as KeyValue));
        });
        return result;
      } else {
        const result = {} as KeyValue;
        for (const key in obj) {
          if (!key.startsWith('_') && Object.prototype.hasOwnProperty.call(obj, key)) {
            const element = obj[key];
            if (typeof element === 'boolean' || typeof element === 'string' || typeof element === 'number')
              result[key] = element;
            else if (typeof element === 'object')
              result[key] = loopObject(element as KeyValue) as KeyValue;
          }
        }
        return result;
      }
    };
    return loopObject(this as unknown as KeyValue) as KeyValue;
  }
  /**
   * 获取上次创建的服务端原始数据
   * @returns
   */
  public rawData() : KeyValue|null {
    return this.getLastServerSideData();
  }

  //转换入口
  //=========================================

  /**
   * 从服务端数据创建前端使用的数据模型
   * @param data 服务端数据
   * @returns
   */
  public fromServerSide(data : KeyValue|null|undefined, nameKeySup?: string) : DataModel {
    this._lastServerSideData = data || null;

    if (typeof data === 'undefined' || data === null || typeof data === 'boolean' || typeof data === 'string' || typeof data === 'number') {

      //null与undefined，基本类型数据，不能转换
      if (this._convertPolicy.startsWith('strict'))
        throwError(`Try to convert a ${data === null ? 'null' : typeof data} to ${this._classDebugName}.`);
      else if (this._convertPolicy.startsWith('warning'))
        logWarn(`Try to convert a ${data === null ? 'null' : typeof data} to ${this._classDebugName}, a empty object was returned.`);
      return this;

    } else if (data instanceof Array) {

      //数组数据，不能转换
      if (this._convertPolicy.startsWith('strict'))
        throwError(`Try to convert a array to ${this._classDebugName}. If you want to conver a array to DataModel, please use transformArrayDataModel function.`);
      else if (this._convertPolicy.startsWith('warning'))
        logWarn(`Try to convert a array to ${this._classDebugName}, a empty object was returned. If you want to conver a array to DataModel, please use transformArrayDataModel function.`);
      return this;

    } else {
      const options : ConvertItemOptions = {
        policy: this._convertPolicy,
        direction: 'client',
        defaultDateFormat: this._defaultDateFormat,
      };
      
      //字段检查提供
      const isRequiredMode = this._convertPolicy.endsWith('required');
      for (const key in this._convertTable) {
        const convertItem = this._convertTable[key];
        if (
          (isRequiredMode || convertItem.clientSideRequired)
          && convertItem.clientSide !== 'undefined' 
          && convertItem.clientSide !== 'null'
        ) {
          //转换映射字段名称
          let serverKey = key;
          for (const serverMapperKey in this._nameMapperServer) {
            if (this._nameMapperServer[serverMapperKey] === key) {
              serverKey = serverMapperKey;
              break;
            }
          }
          //判空
          const clientValue = data[serverKey];
          if (typeof clientValue === 'undefined' || clientValue === null)
            throw new Error(`Convert ${key} faild: Key ${key} is required but not provide.`);
        }
      }
      //转换
      for (const key in data) {
        if (!this._blackList.toClient.includes(key)) {
          //转换映射字段名称
          let clientKey = key;
          for (const serverMapperKey in this._nameMapperServer) {
            if (this._nameMapperServer[serverMapperKey] === key) {
              clientKey = serverMapperKey;
              break;
            }
          }
          const convert = this._convertKeyType?.(clientKey, 'client') || this._convertTable[clientKey];
          if (convert)
            this.set(clientKey, DataConverter.convertDataItem(
              data[clientKey], 
              (nameKeySup ? (nameKeySup + "."): '') + key,
              convert,
              options,
            ));
          else if(!isRequiredMode)
            this.set(clientKey, data[key]); //直接拷贝
        }
      }
    }

    this._afterSolveServer && this._afterSolveServer();
    return this;
  }
  /**
   * 转换当前数据模型为服务端格式
   * @returns 返回服务端格式数据
   */
  public toServerSide(nameKeySup?: string) : KeyValue {
    const data = {} as KeyValue;
    const options : ConvertItemOptions = {
      policy: this._convertPolicy,
      direction: 'server',
      defaultDateFormat: this._defaultDateFormat,
    };
    
    //字段检查提供
    const isRequiredMode = this._convertPolicy.endsWith('required');
    for (const key in this._convertTable) {
      const convertItem = this._convertTable[key];
      if (
        (isRequiredMode || convertItem.serverSideRequired)
        && convertItem.serverSide !== 'undefined' 
        && convertItem.serverSide !== 'null'
      ) {
        const clientValue = this[key];
        if (typeof clientValue === 'undefined' || clientValue === null)
          throw new Error(`Convert ${key} faild: Key ${key} is required but not provide.`);
      }
    }
    //转换
    for (const key in this) {
      if (!key.startsWith('_') && !this._blackList.toServer.includes(key)) {
        const thisData = (this as unknown as KeyValue)[key];
        if (typeof thisData === 'undefined' || typeof thisData === 'function')
          continue;
        if (this._dontSendToServerIfEmpty && (thisData === null || thisData === undefined))
          continue;
        if (this._dontSendToServerIfEmptyString && (thisData === ''))
          continue;

        const convert = this._convertKeyType?.(key, 'server') || this._convertTable[key];
        const serverKey = this._nameMapperClient[key] || key;
        if (convert)
          data[serverKey] = DataConverter.convertDataItem(
            thisData,
            (nameKeySup ? (nameKeySup + ".") : '') + key,
            convert,
            options
          );
        else if(!isRequiredMode)
          data[serverKey] = thisData; //直接拷贝
      }
    }
    this._afterSolveClient && this._afterSolveClient(data);
    return data;
  }

  //克隆方法
  //=========================================

  /**
   * 克隆一份
   * @param classCreator
   * @returns
   */
  public clone() : T {
    return new this._classCreator().fromServerSide(this.getLastServerSideData()) as T;
  }

  //值获取、设置方法
  //=========================================

  /**
   * 在实例上通过字符串设置或增加对象中的属性。
   * 
   * 访问路径支持：
   * * 支持点 “.” 表示子级属性。
   * * 支持数组 “[x]” 表示数组的第 x 个数据。
   * 
   * 例如：a.listData[0].title
   * 
   * @param keyName 访问路径
   * @param value 值
   * @returns 返回设置之前的值
   */
  public set<U>(keyName: string, value: U) : U {
    return DataObjectUtils.accessObjectByString(this, keyName, true, value) as U;
  }
  /**
   * 在实例上获取属性。
   * 
   * 访问路径支持：
   * * 支持点 “.” 表示子级属性。
   * * 支持数组 “[x]” 表示数组的第 x 个数据。
   * 
   * 例如：a.listData[0].title
   * 
   * @param keyName 访问路径
   * @param defaultValue 默认值
   * @returns 如果访问对象找到属性，则返回属性，否则返回默认值 defaultValue 。
   */
  public get<U>(keyName: string, defaultValue?: U) : U|undefined  {
    return DataObjectUtils.accessObjectByString(this, keyName, false) as U || defaultValue;
  }
}
