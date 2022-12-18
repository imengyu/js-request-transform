/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 数据模型转换层
 *
 * 功能介绍：
 *    这是一个为前端使用的数据模型转换层。
 *    可将后端返回的数据进行统一转换，成为前端方便使用的数据，同时，也会将前端的数据反向转换，变成后端可接受的数据。
 *    省去了手动适配后端数据的麻烦，前端不需要频繁修改界面相关的代码了。
 *
 * Author: imengyu
 * Date: 2021/10/13
 *
 * Copyright (c) 2021 imengyu.top. Licensed under the MIT License.
 * See License.txt in the project root for license information.
 */

import { ConvertItemOptions, ConvertPolicy, DataConverter } from "./DataConverter";
import { KeyValue, simpleClone } from "./DataUtils";

/**
 * 内置转换类型定义
 * * undefined 相当于黑名单，永远都会转换为 `undefined` 。
 * * null 强制转换为 `null` 。
 * * string 转换为字符串。
 * * number 转换为数字类型。
 * * boolean 转换为布尔值类型。
 * * object 转换为对象。
 *    可以指定 `clientSideChildDataModel` 或者 `serverSideChildDataModel` 来指定此对象要强制转为那个数据模型。
 *    如果源对象是空数组，则转换为 `null`，其他类型无法转换。
 * * array 转换为数组，源对象必须是数组类型。
 *    可以指定 `clientSideChildDataModel` 或者 `serverSideChildDataModel` 来指定此数组的每个子条目要强制转为那个数据模型。
 * * date 转换为 `Date`。
 *    * 如果输入是字符串，则会尝试使用日期格式进行转换。
 *    * 如果输入是数值时间戳，则会使用 `new Date(time)` 进行转换。
 * * json 转换为JSON数组。
 * * dayjs 转换为dayjs对象。
 */
export type DataConvertInnernType = 'undefined'|'null'|'string'|'number'|'boolean'|'object'|'array'|'date'|'json'|'dayjs';

/**
 * 数据转换方法定义
 */
export interface DataConvertItem {

  /**
   * 指定当前key服务端的数据类型
   */
  serverSide?: string;
  serverSideDateFormat?: string;
  /**
   * 当 serverSide 为 array/object 时，子项目要转换成的类型
   */
  // eslint-disable-next-line no-use-before-define
  serverSideChildDataModel?: (new () => DataModel)|string;
  /**
   * 指定当前key前端的数据类型
   */
  clientSide?: string;
  clientSideDateFormat?: string;
  /**
   * 当 clientSide 为 array/object 时，子项目要转换成的类型
   */
  // eslint-disable-next-line no-use-before-define
  clientSideChildDataModel?: (new () => DataModel)|string;
  /**
   * 自定义前端至服务端转换函数，指定此函数后 serverSide 属性无效
   */
  customToServerFn?: (source: unknown, item: DataConvertItem, options: ConvertItemOptions) => unknown;
  /**
   * 自定义服务端至前端转换函数，指定此函数后 clientSide 属性无效
   */
  customToClientFn?: (source: unknown, item: DataConvertItem, options: ConvertItemOptions) => unknown;
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
   * 从本地端转换后的后处理回调
   */
  public _afterSolveClient: ((data: KeyValue) => void) | null = null;
  /**
   * 数据字段转换表。key类中的为属性名称，值是转换信息。
   */
  public _convertTable : { [index: string]: DataConvertItem }  = {};
  /**
   * 字段的名称映射表(服务端至客户端)，左边是服务端名称，右边是客户端名称
   */
  public _nameMapperServer : { [index: string]: string }  = {};
  /**
   * 字段的名称映射表(客户端至服务端)，左边是客户端名称，右边是名称服务端
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
   * 如果从服务端数据返回的是一个基本数据类型，那么可以在这里获取源数据
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
   * 获取模型数据为纯JSON
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
      };
      for (const key in data) {
        if (!key.startsWith('_') && !this._blackList.toClient.includes(key)) {
          const convert = this._convertTable[key];
          const clientKey = this._nameMapperServer[key] || key;
          if (convert)
            this.set(clientKey, DataConverter.convertDataItem(
              data[key], 
              (nameKeySup ? '' : (nameKeySup + ".")) + key,
              convert,
              options,
            ));
          else
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

        const convert = this._convertTable[key];
        const serverKey = this._nameMapperClient[key] || key;
        if (convert)
          data[serverKey] = DataConverter.convertDataItem(
            thisData,
            (nameKeySup ? '' : (nameKeySup + ".")) + key,
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
    if (typeof value !== 'undefined')
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
