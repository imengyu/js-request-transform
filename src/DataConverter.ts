import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { DataConvertItem, DataModel } from './DataModel';
import { formatDate, isVaildDate, KeyValue, logError, logWarn, simpleClone, toNumberStr } from './DataUtils';

dayjs.extend(utc)
dayjs.extend(timezone)

/**
 * 转换核心层
 *
 * 功能介绍：
 *    本文件提供了转换核心功能。
 *
 * Author: imengyu
 * Date: 2022/12/18
 *
 * Copyright (c) 2021 imengyu.top. Licensed under the MIT License.
 * See License.txt in the project root for license information.
 */

//转换器数组
const converterArray = new Map<string, ConverterConfig[]>();

export type ConverterDataDirection = 'server'|'client';

export type ConverterHandlerResult = {
  result?: unknown;
  success: boolean;
  convertFailMessage?: string|Error;
};
export type ConverterHandler = (
  /**
   * 源数据
   */
  source: unknown,
  /**
   * 当前处理数据的完整键值，用于调试
   */
  key: string,
  /**
   * 转换类型
   */
  type: string,
  /**
   * 子数据的类型
   */
  childDataModel : (new () => DataModel)|string|null|undefined,
  /**
   * 当前字段的日期格式，可能为空，为空时可使用 options.defaultDateFormat
   */
  dateFormat: string|undefined,
  /**
   * 其他附加属性
   */
  options: ConvertItemOptions,
) => ConverterHandlerResult;

export interface ConverterConfig {
  /**
   * 唯一键值，用于取消注册，不提供的话则无法移除。
   */
  key?: string;
  /**
   * 当前转换器所接受的源数据类型
   */
  targetType: string;

  /**
   * 当转换策略是必填时，此回调用于自定义类型检测是否提供。
   * @param source 源数据
   * @returns 返回为 undefined 时表示无错误，其他情况表示错误信息
   */
  preRequireCheckd?: (
    source: unknown,
  ) => string|Error|undefined;

  /**
   * 转换器主体函数
   */
  converter: ConverterHandler;
}

let setDayJsTimeZone = '';

/**
 * 设置 dayjs 默认时区
 * 参考 https://dayjs.gitee.io/docs/zh-CN/plugin/timezone
 * @param timezone 
 */
function configDayJsTimeZone(timezone: string) {
  setDayJsTimeZone = timezone;
  dayjs.tz.setDefault(timezone);
}
function parseDayjs(source: string, format?: string) {
  const dayJs = setDayJsTimeZone ?
    dayjs(source, format).tz(setDayJsTimeZone) :
    dayjs(source, format);
  return dayJs;
}

/**
 * 注册一个自定义数据转换器
 * @param config 转换器
 */
function registerConverter(config: ConverterConfig) {
  let array = converterArray.get(config.targetType);
  if (!array) {
    array = [];
    converterArray.set(config.targetType, array)
  }
  if (!array.includes(config))
    array.push(config);
  else
    logWarn(`Converter ${config.targetType}-${config.key} already registered!`);
}
/**
 * 取消注册指定的数据转换器
 * @param key 转换器注册时提供的key
 * @param targetType 转换器目标类型
 */
function unregisterConverter(key: string, targetType: string) {
  let array = converterArray.get(targetType);
  if (!array)
    return;
  const index = array.findIndex(k => k.key === key);
  if (index >= 0)
    array.splice(index, 1);
}

//默认的转换器
//==============================

function makeSuccessConvertResult(res: unknown) {
  return {
    success: true,
    result: res,
  } as ConverterHandlerResult;
}
function makeFailConvertResult(error?: string|Error) {
  return {
    success: false,
    convertFailMessage: error,
  } as ConverterHandlerResult;
}

registerConverter({
  targetType: 'array',
  key: 'DefaultArray',
  preRequireCheckd(source) {
    if (typeof source === 'undefined')
      return 'Empty';
    if (typeof source === 'string' && (source === '' ))
      return 'Empty';
    return undefined;
  },
  converter(source, key, type, childDataModel, dateFormat, options) {
    //尝试转换JSON字符串
    if (typeof source === 'string') {
      try {
        source = JSON.parse(source);
      } catch (e) {
        return makeFailConvertResult(e as Error);
      }
    }
    if (typeof source === 'object' && source instanceof Array) {
      const result = [] as unknown[];
      for (let i = 0, c = source.length; i < c; i++) {
        let item : unknown = null;
        if (options.direction === 'server')
        {
          if (source[i] instanceof DataModel)
            item = (source[i] as DataModel).toServerSide(`${key}[${i}]`);
          else if (childDataModel === 'string')
            item = convertInnernType(source[i], `${key}[${i}]`, undefined, dateFormat, childDataModel, options);
          else
            item = source[i];
        }
        else
        {
          if (typeof childDataModel === 'function')
            item = new childDataModel().fromServerSide(source[i], `${key}[${i}]`);
          else if (typeof childDataModel === 'string')
            item = convertInnernType(source[i], `${key}[${i}]`, undefined, dateFormat, childDataModel, options);
          else
            item = source[i];
        }
        result.push(item);
      }
      return makeSuccessConvertResult(result);
    }
    else {
      return makeFailConvertResult();
    }
  },
});
registerConverter({
  targetType: 'object',
  key: 'DefaultObject',
  preRequireCheckd(source) {
    if (typeof source === 'undefined')
      return 'Empty';
    if (typeof source === 'string' && source === '')
      return 'Empty';
    return undefined;
  },
  converter(source, key, type, childDataModel, dateFormat, options)  {
    //尝试转换JSON字符串
    if (typeof source === 'string') {
      try {
        source = JSON.parse(source);
      } catch (e) {
        return makeFailConvertResult(e as Error);
      }
    }
    if (typeof source === 'object') {
      //数组无法转换
      if (source instanceof Array)
        return makeFailConvertResult('Need object type, unexpected array type.');
      //转换
      if (options.direction === 'server') {
        if (source === null)
          return makeSuccessConvertResult(null);
        if (source instanceof DataModel)
          return makeSuccessConvertResult((source as DataModel).toServerSide(key));
        else
          return makeSuccessConvertResult(simpleClone(source));
      } else {
        if (source === null)
          return makeSuccessConvertResult(null);
        if (typeof childDataModel === 'function')
          return makeSuccessConvertResult(new childDataModel().fromServerSide(source as KeyValue, key));
        else
          return makeSuccessConvertResult(simpleClone(source));
      }
    }
    else
      return makeFailConvertResult();
  },
});
registerConverter({
  targetType: 'boolean',
  key: 'DefaultBoolean',
  converter(source, key, type, childDataModel, dateFormat, options)  {
    if (typeof source === 'string')
      return makeSuccessConvertResult(source.toLowerCase() === 'true' || source === "1");
    else if (typeof source === 'boolean')
      return makeSuccessConvertResult(source);
    else if (typeof source === 'number')
      return makeSuccessConvertResult(source > 0);
    else {
      if (options.direction === 'client' && options.policy.startsWith('strict'))
        return makeFailConvertResult('Not a boolean');
      else
        return makeSuccessConvertResult(source != null);
    }
  },
});
registerConverter({
  targetType: 'string',
  key: 'DefaultString',
  converter(source, key, type, childDataModel, dateFormat, options)  {
    if (options.direction === 'client' && options.policy.startsWith('strict') && typeof source !== 'string')
      return makeFailConvertResult('Not a string');

    if (typeof source === 'string')
      return makeSuccessConvertResult(source);
    else if (typeof source === 'number')
      return makeSuccessConvertResult(toNumberStr(source, 16));
    else if (typeof source === 'bigint')
      return makeSuccessConvertResult(source.toString());
    else if (typeof source === 'object' && dayjs.isDayjs(source))
      return makeSuccessConvertResult(source.format(dateFormat || options.defaultDateFormat));
    else if (typeof source === 'object' && source instanceof Date)
      return makeSuccessConvertResult(formatDate(source, dateFormat || options.defaultDateFormat));
    else if (typeof source === 'object')
      return makeSuccessConvertResult(JSON.stringify(source));
    else if (source === null)
      return makeSuccessConvertResult(null);
    else
      return makeSuccessConvertResult('' + source);
  },
});
registerConverter({
  targetType: 'number',
  key: 'DefaultNumber',
  converter(source, key, type, childDataModel, dateFormat, options)  {
    if (typeof source === 'object' && dayjs.isDayjs(source))
      return makeSuccessConvertResult(source.toDate().getTime());
    else if (typeof source === 'object' && source instanceof Date)
      return makeSuccessConvertResult(source.getTime());
    else if (typeof source === 'number')
      return makeSuccessConvertResult(source);
    else if (source === null) {
      return makeFailConvertResult('Number should not be null');
    }
    else if (typeof source === 'string') {
      const f = parseFloat(source as string);
      if (!isNaN(f)) //nan 表示转换失败
        return makeSuccessConvertResult(f);
    }
    return makeFailConvertResult();
  },
});
registerConverter({
  targetType: 'dayjs',
  key: 'DefaultDayjs',
  converter(source, key, type, childDataModel, dateFormat, options)  {
    if (typeof source === 'string')
      return makeSuccessConvertResult(source === '' ? null : parseDayjs(source, dateFormat || options.defaultDateFormat));
    else if (typeof source === 'number')
      return makeSuccessConvertResult(dayjs(new Date(source)));
    else if (typeof source === 'undefined')
      return makeSuccessConvertResult(undefined);
    else if (source === null)
      return makeSuccessConvertResult(null);
    else
     return makeFailConvertResult();
  },
});
registerConverter({
  targetType: 'date',
  key: 'DefaultDate',
  converter(source, key, type, childDataModel, dateFormat, options)  {
    if (typeof source === 'string' || typeof source === 'number') {
      const date = new Date(source);
      if (isVaildDate(date))
        return makeSuccessConvertResult(date);
      else
        return makeFailConvertResult('Invalid date');
    } else if (source === null)
      return makeSuccessConvertResult(null);
    else
      return makeFailConvertResult();
  },
});
registerConverter({
  targetType: 'json',
  key: 'DefaultJson',
  converter(source, key, type, childDataModel, dateFormat, options)  {
    if (typeof source === 'string')  {
      const a = JSON.parse(source);
      return {
        success: true,
        result: a,
      };
    }
    else if (typeof source === 'object')
      return {
        success: true,
        result: source,
      };
    else
      return { success: false };
  },
});
registerConverter({
  targetType: 'undefined',
  key: 'DefaultUndefined',
  converter()  {
    return makeSuccessConvertResult(undefined);
  },
});
registerConverter({
  targetType: 'null',
  key: 'DefaultNull',
  converter()  {
    return makeSuccessConvertResult(null);
  },
});

//转换器主体
//========================================

/**
 * 转换模式
 * * default 默认模式（松散模式）：对于在转换表中定义的字段，进行转换，如果转换失败不会给出警告，未在表中定义的字段数据按原样返回。
 * * strict-required 全部严格模式：在转换表中的字段，进行转换，如果未定义或者转换失败，则抛出异常。未在表中定义的数据会被忽略，不会写入结果。
 * * strict-provided 仅提供字段严格模式：在转换表中的字段同 strict-required，未在表中定义的字段数据按原样返回。
 * * warning 仅警告：同 default，但会在转换失败时给出警告。
 * * warning-required 警告：同 strict-required，但会在转换失败时给出警告而不是异常。
 * * warning-provided 警告：同 strict-provided，但会在转换失败时给出警告而不是异常。
 */
export type ConvertPolicy = 
  |'default'
  |'warning'
  |'strict-required'
  |'strict-provided'
  |'warning-required'
  |'warning-provided';

export interface ConvertItemOptions {
  /**
   * 当前模型的转换方向
   */
  direction: ConverterDataDirection;
  /**
   * 当前模型的默认日期格式
   */
  defaultDateFormat: string,
  /**
   * 当前模型的转换策略
   */
  policy: ConvertPolicy;
}

//转换主函数
function convertInnernType(
  source: unknown, 
  key: string, 
  childDataModel: (new () => DataModel)|string|undefined, 
  dateFormat: string|undefined, 
  type: string, 
  options: ConvertItemOptions
) : unknown {

  const warn = options.policy.startsWith('warning');
  const strict = options.policy.startsWith('strict');

  //判空
  if (strict && !type)
    throw new Error(`Convert ${key} faild: Must privide ${options.direction}Side.`);

  //获取转换器
  let array = type ? converterArray.get(type) : null;
  if (!array) {
    if (strict)
      throw new Error(`Convert ${key} faild: No converter was found for type ${type}.`);
    if (warn && type !== '') 
      logWarn(`Convert ${key} faild: No converter was found for type ${type}, raw data returned.`);
    return source;
  }

  const needCheckRequired = options.policy.endsWith('required');

  //转换
  const convertFailMessages = [];
  for (const convert of array) {

    //判空
    if (needCheckRequired && convert.preRequireCheckd) {
      const error = convert.preRequireCheckd(source);
      if (error) {
        if (strict)
          throw new Error(`Convert ${key} faild: Key ${key} is required but not provide.`);
        if (warn)
          logWarn(`Convert ${key} warn: Key ${key} is required but not provide.`);
      }
    }

    //转换
    const result = convert.converter(
      source, 
      key,
      type,
      childDataModel,
      dateFormat,
      options,
    );
    if (result.success)
      return result.result;
    else if (result.convertFailMessage)
      convertFailMessages.push(result.convertFailMessage);
  }

  if (strict) {
    logError(`Convert ${key} faild: All converter was failed for type ${type}: ${convertFailMessages.join(',')}. Source: `, source);
    throw new Error(`Convert ${key} faild: All converter was failed for type ${type}.`);
  }
  if (warn)
    logWarn(`Convert ${key} faild: All converter was failed for type ${type}: ${convertFailMessages.join(',')}. Source: `, source);
  return undefined;
}
function convertDataItem(source: unknown, key: string, item: DataConvertItem, options: ConvertItemOptions) : unknown {
  if (options.direction === 'server') 
  {
    if (typeof item.customToServerFn === 'function')
      return item.customToServerFn(source, item, options);
    else if (item.serverSide)
      return convertInnernType(source, key, item.serverSideChildDataModel, item.serverSideDateFormat, item.serverSide, options);
  } 
  else
  {
    if (typeof item.customToClientFn === 'function')
      return item.customToClientFn(source, item, options);
    else if (item.clientSide)
      return convertInnernType(source, key, item.clientSideChildDataModel, item.clientSideDateFormat, item.clientSide, options);
  }
  return undefined;
}

/**
 * 数据转换器
 */
export const DataConverter = {
  registerConverter,
  unregisterConverter,
  configDayJsTimeZone,
  convertDataItem,
  convertInnernType,
  makeSuccessConvertResult,
  makeFailConvertResult,
};