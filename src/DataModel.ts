/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { KeyValue, simpleClone } from "./DataUtils";

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
   * 当 serverSide 为 array/object 时，子项目要转换成的类型
   */
  // eslint-disable-next-line no-use-before-define
  serverSideChildDataModel?: (new () => DataModel)|string;
  /**
   * 指定当前key转为前端时的数据类型
   */
  clientSide?: string;
  /**
   * 当前key类型是dayjs时，自定义日期格式
   */
  clientSideDateFormat?: string;
  /**
   * 当 clientSide 为 array/object 时，子项目要转换成的类型
   */
  // eslint-disable-next-line no-use-before-define
  clientSideChildDataModel?: (new () => DataModel)|string;
  /**
   * 自定义前端至服务端转换函数，指定此函数后 serverSide 属性无效
   */
  customToServerFn?: DataConvertCustomFn;
  /**
   * 自定义服务端至前端转换函数，指定此函数后 clientSide 属性无效
   */
  customToClientFn?: DataConvertCustomFn;
}

/**
 * 双向数据模型实体类。
 * 该类提供了双向的数据转换。
 * 请继承此类定义自己的数据模型并设置转换相关设置。
 */
export class DataModel implements KeyValue {

  [index: string]: unknown;
  
  /**
   * 设置是否 子字段参数为空，则不传值至服务器
   */
  public _dontSendToServerIfEmpty = false;
  /**
   * 从服务端转换后的后处理回调
   */
  public _afterSolveServer: (() => void) | null = null;
  /**
   * 从本地端转换后的后处理回调。data 是最终转为服务器端的数据，可自由修改。
   */
  public _afterSolveClient: ((data: KeyValue) => void) | null = null;
  /**
   * 统一设置默认的日期格式
   */
  public _defaultDateFormat = '';
  /**
   * 数据字段转换表。key类中的为属性名称，值是转换信息。
   */
  public _convertTable : { [index: string]: DataConvertItem }  = {};
  /**
   * 自定义字段转换类型，这在对象的属性个数不确定时很有用。此函数返回的类型优先级比 _convertTable 高。
   */
  public _convertKeyType: ((key: string, direction: ConverterDataDirection) => DataConvertItem) | null = null;
  /**
   * 字段的名称映射表(服务端至客户端)，左边是服务端名称，右边是客户端名称。
   * * 效果：服务端字段是 a ，客户端转换 a 之后会把它 赋值到名称为 b 的属性。
   */
  public _nameMapperServer : { [index: string]: string }  = {};
  /**
   * 字段的名称映射表(客户端至服务端)，左边是客户端名称，右边是名称服务端.
   * * 效果：客户端字段是 a ，转换 a 到服务端数据之后会把它 赋值到名称为 b 的属性。
   */
  public _nameMapperClient : { [index: string]: string }  = {};
  /**
   * 转换策略
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
  private _isList = false;
  private _list: Array<unknown>|null = null;
  private _valueType: boolean|number|string|null = null;

  /**
   * 如果从服务端数据返回的是一个数组，那么可以在这里获取源数组
   */
  public getList<T>() : Array<T>|undefined|null {
    return this._list as Array<T>;
  }
  /**
   * 如果从服务端数据返回的是一个基本数据类型，那么可以在这里获取源数据。
   */
  public getValueType() : boolean|number|string|null {
    return this._valueType;
  }
  /**
   * 获取模型数据是否是一个数组
   * @returns
   */
  public isList() : boolean {
    return this._isList;
  }

  /**
   * 获取上次创建的服务端原始数据
   * @returns
   */
  public getLastServerSideData() : KeyValue|null {
    return simpleClone(this._lastServerSideData) as KeyValue;
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
  /**
   * 从服务端数据创建前端使用的数据模型
   * @param data 服务端数据
   * @returns
   */
  public fromServerSide(data : KeyValue|null|undefined, nameKeySup?: string) : DataModel {
    this._lastServerSideData = data || null;
    if (typeof data === 'undefined' || data === null) {
      this._isList = false;
      return this;
    }
    if (typeof data === 'boolean' || typeof data === 'string' || typeof data === 'number') {
      this._valueType = data; //基本类型数据保存至valueType
      this._isList = false;
    } else if (data instanceof Array) {
      this._list = data; //数组数据保存至list
      this._isList = true;
    } else {
      this._isList = false;
      const options : ConvertItemOptions = {
        policy: this._convertPolicy,
        direction: 'client',
        defaultDateFormat: this._defaultDateFormat,
      };
      for (const key in data) {
        if (!key.startsWith('_') && !this._blackList.toClient.includes(key)) {
          const convert = this._convertKeyType?.(key, 'client') || this._convertTable[key];
          const clientKey = this._nameMapperServer[key] || key;
          if (convert)
            this.set(clientKey, DataConverter.convertDataItem(
              data[key], 
              (nameKeySup ? (nameKeySup + "."): '') + key,
              convert,
              options,
            ));
          else
            this.set(clientKey, data[key]); //直接拷贝
        }
      }
      //字段检查提供
      if (this._convertPolicy.endsWith('required')) {
        for (const key in this._convertTable) {
          const convertItem = this._convertTable[key];
          if (
            convertItem.clientSide !== 'undefined' 
            && convertItem.clientSide !== 'null'
          ) {
            const clientKey = this._nameMapperServer[key] || key;
            const clientValue = this[clientKey];
            if (typeof clientValue === 'undefined' || clientValue === null)
              throw new Error(`Convert ${key} faild: Key ${key} is required but not provide.`);
          }
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
    for (const key in this) {
      if (!key.startsWith('_') && !this._blackList.toServer.includes(key)) {
        const thisData = (this as unknown as KeyValue)[key];
        if (typeof thisData === 'undefined')
          continue;
        if (typeof thisData === 'function')
          continue;
        if (this._dontSendToServerIfEmpty && (thisData === '' || thisData == null))
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
        else
          data[serverKey] = thisData; //直接拷贝
      }
    }
    this._afterSolveClient && this._afterSolveClient(data);
    return data;
  }
  /**
   * 克隆一份
   * @param classCreator
   * @returns
   */
  public clone<T extends DataModel>(classCreator: new() => T) : T {
    return new classCreator().fromServerSide(this.getLastServerSideData()) as T;
  }
  /**
   * 在实例上设置或增加属性
   * @param key 键
   * @param value 值
   */
  public set(key: string, value: unknown) : void {
    (this as KeyValue)[key] = value;
  }
  /**
   * 在实例上获取属性的值
   * @param key 键
   * @param defaultValue 默认值
   * @returns
   */
  public get(key: string, defaultValue?: unknown) :unknown  {
    return (this as KeyValue)[key] || defaultValue;
  }
}
