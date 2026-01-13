import { ChildDataModel, DataConvertItem, DataModel, DataModelConvertOptions, FastTemplateDataModelDefine } from './DataModel';
import { DataDateUtils, DataErrorFormatUtils, DataObjectUtils, DataStringUtils, KeyValue, logError, logWarn } from './DataUtils';
import { DATA_MODEL_ERROR_NO_CONVERTER, DATA_MODEL_ERROR_PRINT_SOURCE, DATA_MODEL_ERROR_REQUIRED_KEY_NULL } from './DataErrorFormat';
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

export const CONVERTER_ADD_DEFAULT = 'addDefaultValue';

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
  childDataModel : ChildDataModel|undefined,
  /**
   * 当前字段的日期格式，可能为空，为空时可使用 options.defaultDateFormat
   */
  dateFormat: string|undefined,
  /**
   * 是否有必填标志
   */
  required: boolean,
  /**
   * 自定义参数
   */
  params: Record<string, unknown>|undefined,
  /**
   * 其他附加属性
   */
  options: ConvertItemOptions,
  /**
   * 调试用键值路径
   */
  debugKey: string,
  /**
   * 调试用模型名称
   */
  debugName: string,
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

/**
 * 快速模板类
 */
export class FastTemplateDataModel extends DataModel {
  public constructor(define: FastTemplateDataModelDefine, prevDebugKey: string, fastSetValues?: KeyValue) {
    super(undefined, 'FastTemplate');
    this._convertTable = define.convertTable;
    this._classPrevDebugKey = prevDebugKey;
    if (define.convertKeyType)
      this._convertKeyType = define.convertKeyType;
    if (define.convertPolicy)
      this._convertPolicy = define.convertPolicy;
    if (define.nameMapperClient)
      this._nameMapperClient = define.nameMapperClient;
    if (define.nameMapperServer)
      this._nameMapperServer = define.nameMapperServer;
    if (fastSetValues) {
      for (const key in fastSetValues)
        this[key] = fastSetValues[key];
    }
  }
}

type ConvertItemCustomOptions = Partial<Omit<ConvertItemOptions, 'direction'>>;

let convertItemCustomOptions : ConvertItemCustomOptions = {};

/**
 * 配置转换项自定义参数
 * @param options 
 */
function configConvertItemCustomOptions(options: ConvertItemCustomOptions) {
  convertItemCustomOptions = options;
}
function getConvertItemCustomOptions() {
  return convertItemCustomOptions
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

function convertArrayOrObjectItemSolver(
  source: unknown,
  i: number|string,
  key: string,
  childDataModel : ChildDataModel|undefined,
  dateFormat: string|undefined,
  required: boolean,
  params: Record<string, unknown>|undefined,
  options: ConvertItemOptions,
  debugKey: string,
  debugName: string,
) {
  let item : unknown = null;
  if (options.direction === 'server')
  {
    if (typeof source === 'object' && source instanceof DataModel)
      item = (source as DataModel).toServerSide(options.userOptions, `${key}[${i}]`);
    else if (typeof childDataModel === 'string')
      item = convertInnernType(source, `${key}[${i}]`, undefined, dateFormat, childDataModel, required, params, options, `${debugKey}[${i}]`, debugName);
    else if (typeof childDataModel === 'object')
      item = new FastTemplateDataModel(childDataModel, `${debugKey}[${i}]`, source as KeyValue).toServerSide(options.userOptions, `${key}[${i}]`);
    else
      item = source;
  }
  else
  {
    if (typeof childDataModel === 'function')
      item = new childDataModel().fromServerSide(source as KeyValue, options.userOptions, `${key}[${i}]`);
    else if (typeof childDataModel === 'string')
      item = convertInnernType(source, `${key}[${i}]`, undefined, dateFormat, childDataModel, required, params, options, `${debugKey}[${i}]`, debugName);
    else if (typeof childDataModel === 'object')
      item = new FastTemplateDataModel(childDataModel, `${debugKey}[${i}]`).fromServerSide(source as KeyValue, options.userOptions, `${key}[${i}]`);
    else
      item = source;
  }
  return item;
}

//map
registerConverter({
  targetType: 'map',
  key: 'DefaultMap',
  preRequireCheckd(source) {
    if (typeof source === 'undefined')
      return 'Empty';
    if (typeof source === 'string' && (source === '' ))
      return 'Empty';
    return undefined;
  },
  converter(source, key, type, childDataModel, dateFormat, required, params, options, debugKey, debugName) {
    //尝试转换JSON字符串
    if (typeof source === 'string') {
      try {
        source = JSON.parse(source);
      } catch (e) {
        return makeFailConvertResult(e as Error);
      }
    }
    if (typeof source === 'object') {
      //数组类型
      if (Array.isArray(source)) {
        const result = new Map<unknown, unknown>();
        const mapKey = params?.mapKey as string || 'id';
        for (let i = 0, c = source.length; i < c; i++) {
          const item = convertArrayOrObjectItemSolver(source[i], i, key, childDataModel, dateFormat, required, params, options, `${debugKey}[${i}]`, debugName);
          result.set((item as Record<string, unknown>)[mapKey] || i, item);
        }
        return makeSuccessConvertResult(result);
      } 
      //对象类型
      else {
        const result = new Map<unknown, unknown>();
        const mapKey = params?.mapKey as string || 'id';
        for (const childKey in source) {
          const item = convertArrayOrObjectItemSolver((source as Record<string, unknown>)[childKey], childKey, key, childDataModel, dateFormat, required, params, options, `${debugKey}.${childKey}`, debugName);
          result.set((item as Record<string, unknown>)[mapKey] || childKey, item);
        }
        return makeSuccessConvertResult(result);
      }
    }
    else {
      return makeFailConvertResult();
    }
  },
});
registerConverter({
  targetType: 'object',
  key: 'MapToObject',
  preRequireCheckd(source) {
    if (typeof source === 'undefined')
      return 'Empty';
    return undefined;
  },
  converter(source, key, type, childDataModel, dateFormat, required, params, options, debugKey, debugName) {
    if (typeof source === 'object' && source instanceof Map) {
      const result = {} as Record<string, unknown>;
      for (const [ childKey, value ] of source) {
        const item = convertArrayOrObjectItemSolver(value, childKey, key, childDataModel, dateFormat, required, params, options, `${debugKey}.${childKey}`, debugName);
        result[childKey] = item;
      }
      return makeSuccessConvertResult(result);
    }
    else {
      return makeFailConvertResult();
    }
  },
});
registerConverter({
  targetType: 'array',
  key: 'MapToArray',
  preRequireCheckd(source) {
    if (typeof source === 'undefined')
      return 'Empty';
    if (typeof source === 'string' && (source === '' ))
      return 'Empty';
    return undefined;
  },
  converter(source, key, type, childDataModel, dateFormat, required, params, options, debugKey, debugName) {
    if (typeof source === 'object' && source instanceof Map) {
      const result = [] as unknown[];
      for (const [childKey, value] of source) {
        const item = convertArrayOrObjectItemSolver(value, childKey, key, childDataModel, dateFormat, required, params, options, `${debugKey}.${childKey}`, debugName);
        result.push(item);
      }
      return makeSuccessConvertResult(result);
    }
    else {
      return makeFailConvertResult();
    }
  },
});

//array
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
  converter(source, key, type, childDataModel, dateFormat, required, params, options, debugKey, debugName) {
    
    const baseTypeCheckResult = strictCheckServerBaseTypes(options, 'array', source, debugKey);
    if (baseTypeCheckResult)
      return baseTypeCheckResult;
    
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
        const item = convertArrayOrObjectItemSolver(source[i], i, key, childDataModel, dateFormat, required, params, options, `${debugKey}[${i}]`, debugName);
        result.push(item);
      }
      return makeSuccessConvertResult(result);
    }
    else {
      return makeFailConvertResult();
    }
  },
});

//set
registerConverter({
  targetType: 'set',
  key: 'DefaultSet',
  preRequireCheckd(source) {
    if (typeof source === 'undefined')
      return 'Empty';
    if (typeof source === 'string' && (source === '' ))
      return 'Empty';
    return undefined;
  },
  converter(source, key, type, childDataModel, dateFormat, required, params, options, debugKey, debugName) {
    
    const baseTypeCheckResult = strictCheckServerBaseTypes(options, 'array', source, debugKey);
    if (baseTypeCheckResult)
      return baseTypeCheckResult;
    
    //尝试转换JSON字符串
    if (typeof source === 'string') {
      try {
        source = JSON.parse(source);
      } catch (e) {
        return makeFailConvertResult(e as Error);
      }
    }
    if (typeof source === 'object' && source instanceof Array) {
      const result = new Set<unknown>();
      for (let i = 0, c = source.length; i < c; i++) {
        const item = convertArrayOrObjectItemSolver(source[i], i, key, childDataModel, dateFormat, required, params, options, `${debugKey}[${i}]`, debugName);
        result.add(item);
      }
      return makeSuccessConvertResult(result);
    }
    else {
      return makeFailConvertResult();
    }
  },
});
registerConverter({
  targetType: 'array',
  key: 'SetToArray',
  preRequireCheckd(source) {
    if (typeof source === 'undefined')
      return 'Empty';
    if (typeof source === 'string' && (source === '' ))
      return 'Empty';
    return undefined;
  },
  converter(source, key, type, childDataModel, dateFormat, required, params, options, debugKey, debugName) {
    if (typeof source === 'object' && source instanceof Set) {
      const result = [] as unknown[];
      let i = 0;
      for (const value of source) {
        const item = convertArrayOrObjectItemSolver(value, i++, key, childDataModel, dateFormat, required, params, options, `${debugKey}[${i}]`, debugName);
        result.push(item);
        i++;
      }
      return makeSuccessConvertResult(result);
    }
    else {
      return makeFailConvertResult();
    }
  },
});

function strictCheckServerBaseTypes(options: ConvertItemOptions, requiredType: string, source: unknown, debugKey: string) {
  if (options.direction === 'client' && options.policy.startsWith('strict') && options.userOptions?.enableClientStrictBaseTypeCheck) { 
    if (source === null)
      return makeFailConvertResult(`Property '${debugKey}' require type '${requiredType}' but null provided.`);
    if (requiredType === 'array' && !Array.isArray(source))
      return makeFailConvertResult(`Property '${debugKey}' require array but it is not a array.`);
    if (typeof source !== requiredType)
      return makeFailConvertResult(`Property '${debugKey}' require type '${requiredType}' but '${typeof source}' provided.`);
  }
  return undefined;
}

//base
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
  converter(source, key, type, childDataModel, dateFormat, required, params, options, debugKey, debugName)  {

    const baseTypeCheckResult = strictCheckServerBaseTypes(options, 'object', source, debugKey);
    if (baseTypeCheckResult)
      return baseTypeCheckResult;

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
          return makeSuccessConvertResult((source as DataModel).toServerSide(options.userOptions, key));
        else if (typeof childDataModel === 'object')
          return makeSuccessConvertResult(new FastTemplateDataModel(childDataModel, debugKey, source as KeyValue).toServerSide(options.userOptions, key));
        else
          return makeSuccessConvertResult(DataObjectUtils.simpleClone(source));
      } else {
        if (source === null)
          return makeSuccessConvertResult(null);
        if (typeof childDataModel === 'function')
          return makeSuccessConvertResult(new childDataModel().fromServerSide(source as KeyValue, options.userOptions, key));
        else if (typeof childDataModel === 'object')
          return makeSuccessConvertResult(new FastTemplateDataModel(childDataModel, debugKey).fromServerSide(source as KeyValue, options.userOptions, key));
        else
          return makeSuccessConvertResult(DataObjectUtils.simpleClone(source));
      }
    }
    else
      return makeFailConvertResult();
  },
});
registerConverter({
  targetType: 'boolean',
  key: 'DefaultBoolean',
  converter(source, key, type, childDataModel, dateFormat, required, params, options, debugKey, debugName)  {
    
    const baseTypeCheckResult = strictCheckServerBaseTypes(options, 'boolean', source, debugKey);
    if (baseTypeCheckResult)
      return baseTypeCheckResult;

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
  converter(source, key, type, childDataModel, dateFormat, required, params, options, debugKey, debugName) {

    const baseTypeCheckResult = strictCheckServerBaseTypes(options, 'string', source, debugKey);
    if (baseTypeCheckResult)
      return baseTypeCheckResult;

    if (typeof source === 'string')
      return makeSuccessConvertResult(source);
    else if (typeof source === 'number')
      return makeSuccessConvertResult(DataStringUtils.toNumberStr(source, 16));
    else if (typeof source === 'bigint')
      return makeSuccessConvertResult(source.toString());
    else if (typeof source === 'object' && source instanceof Date)
      return makeSuccessConvertResult(DataDateUtils.formatDate(source, dateFormat || options.defaultDateFormat));
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
  converter(source, key, type, childDataModel, dateFormat, required, params, options, debugKey, debugName)  {
    if (typeof source === 'string') {
      const f = parseFloat(source as string);
      if (!isNaN(f)) //nan 表示转换失败
        return makeSuccessConvertResult(f);
    }

    const baseTypeCheckResult = strictCheckServerBaseTypes(options, 'object', source, debugKey);
    if (baseTypeCheckResult)
      return baseTypeCheckResult;

    if (typeof source === 'object' && source instanceof Date)
      return makeSuccessConvertResult(source.getTime());
    else if (typeof source === 'number')
      return makeSuccessConvertResult(source);
    else if (source === null) {
      return makeFailConvertResult('Number should not be null');
    }
    return makeFailConvertResult();
  },
});
registerConverter({
  targetType: 'date',
  key: 'DefaultDate',
  converter(source, key, type, childDataModel, dateFormat, required, params, options, debugKey, debugName)  {
    if (typeof source === 'object' && source instanceof Date)
      return makeSuccessConvertResult(source);
    if (typeof source === 'string' || typeof source === 'number') {
      const date = typeof source === 'number' ? 
        new Date(source) : 
        DataDateUtils.parseDate(source, dateFormat || options.defaultDateFormat);
      if (DataDateUtils.isVaildDate(date))
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
  converter(source, key, type, childDataModel, dateFormat, required, params, options, debugKey, debugName)  {
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
//pure
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
registerConverter({
  targetType: 'original',
  key: 'DefaultOriginal',
  converter(source, key, type, childDataModel, dateFormat, required, params, options, debugKey, debugName)  {
    return makeSuccessConvertResult(source ?? params?.defaultValue);
  },
});

//default

/**
 * 添加默认值转换器
 */
export interface ConverterAddDefaultValueParams {
  /**
   * 默认值
   */
  defaultValue: any,
  /**
   * 用于检查值是否需要添加默认值，如果为空，则判断源数据为false时添加默认值
   * @param v 
   * @returns 
   */
  checkNeedAddDefaultValue?: (v: any) => boolean,
}

registerConverter({
  targetType: CONVERTER_ADD_DEFAULT,
  key: 'AddDefaultValue',
  converter(source, key, type, childDataModel, dateFormat, required, _params, options, debugKey, debugName)  {
    const params = _params as unknown as ConverterAddDefaultValueParams || {};
    if (params.checkNeedAddDefaultValue && params.checkNeedAddDefaultValue(source))
      return makeSuccessConvertResult(params.defaultValue);
    else if (!params.checkNeedAddDefaultValue && !source)
      return makeSuccessConvertResult(params.defaultValue);
    return makeSuccessConvertResult(source);
  },
});

//multiple

/**
 * 乘或者除倍数转换器
 */
export interface ConverterMultipleParams {
  /**
   * 乘或者除
   */
  type: 'multiply'|'divide',
  /**
   * 乘数或者除数
   */
  multiple: number,
}

registerConverter({
  targetType: 'multiple',
  key: 'Multiple',
  converter(source, key, type, childDataModel, dateFormat, required, _params, options, debugKey, debugName)  {
    const params = _params as unknown as ConverterMultipleParams;
    return makeSuccessConvertResult(params.type === 'divide' ? 
      (source as number / params.multiple) :
      (source as number * params.multiple)
    );
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
  /**
   * 用户配置项
   */
  userOptions?: DataModelConvertOptions|undefined;
}

//转换主函数
function convertInnernType(
  source: unknown, 
  key: string, 
  childDataModel: ChildDataModel|undefined, 
  dateFormat: string|undefined, 
  type: string, 
  required: boolean, 
  params: Record<string, unknown>|undefined,
  options: ConvertItemOptions,
  debugKey: string,
  debugName: string,
) : unknown {

  function printSource() {
    return DataErrorFormatUtils.formatError(
      DATA_MODEL_ERROR_PRINT_SOURCE, 
      { objectName: `${debugName}:${debugKey}.` }
    );
  }

  const warn = options.policy.startsWith('warning');
  const strict = options.policy.startsWith('strict');

  //判空
  if (strict && !type)
    throw new Error(`${DataErrorFormatUtils.formatError(DATA_MODEL_ERROR_NO_CONVERTER, { key, direction: options.direction })} ${printSource()}`);

  //获取转换器
  let array = type ? converterArray.get(type) : null;
  if (!array || array.length === 0) {
    const error = DataErrorFormatUtils.formatError(DATA_MODEL_ERROR_NO_CONVERTER, { key, type });
    if (strict)
      throw new Error(`${error} ${printSource()} `);
    if (warn && type !== '') 
      logWarn(`${error} (Raw data returned.) ${printSource()}`);
    return source;
  }

  //判空
  if (required && array[0].targetType !== CONVERTER_ADD_DEFAULT) {
    if (typeof source === 'undefined' || source === null) {
      const error = DataErrorFormatUtils.formatError(DATA_MODEL_ERROR_REQUIRED_KEY_NULL, { key });
      if (strict)
        throw new Error(`${error} ${printSource()}`);
      if (warn)
        logWarn(`${error} ${printSource()}`);
    }
  }

  //转换
  const convertFailMessages = [];
  for (const convert of array) {

    //判空
    if (required && convert.preRequireCheckd) {
      const error = convert.preRequireCheckd(source);
      if (error) {
        const error = DataErrorFormatUtils.formatError(DATA_MODEL_ERROR_REQUIRED_KEY_NULL, { key });
        if (strict)
          throw new Error(`${error} Error: ${error}. ${printSource()}`);
        if (warn)
          logWarn(`${error} Error: ${error}. ${printSource()}`);
      }
    }

    //转换
    const result = convert.converter(
      source, 
      key,
      type,
      childDataModel,
      dateFormat,
      required,
      params,
      options,
      debugKey,
      debugName,
    );
    if (result.success)
      return result.result;
    else if (result.convertFailMessage)
      convertFailMessages.push(result.convertFailMessage);
  }

  if (strict && required)
    logError(`Convert '${key}' (${type}) faild: ${convertFailMessages.join(',') || 'default error'}. ${printSource()} Value: `, source, true);
  if (warn)
    logWarn(`Convert '${key}' (${type}) faild: ${convertFailMessages.join(',') || 'default error'}. ${printSource()} Value: `, source);
  return undefined;
}
function convertDataItem(source: unknown, key: string, item: DataConvertItem, options: ConvertItemOptions, debugKey: string, debugName: string) : unknown {
  const policyRequired = options.policy.endsWith('required');

  if (options.direction === 'server') 
  {
    if (typeof item.customToServerFn === 'function')
      return item.customToServerFn(source, item, options);
    else if (item.serverSide) {
      
      if (typeof item.serverSidePresolve === 'function')
        source = item.serverSidePresolve(key, source);
      return convertInnernType(
        source, 
        key, 
        item.serverSideChildDataModel, 
        item.serverSideDateFormat, 
        item.serverSide, 
        (item.serverSideRequired === true || (policyRequired && item.serverSideRequired !== false)), 
        item.serverSideParam, 
        options,
        debugKey,
        debugName,
      );
    }
  } 
  else
  {
    if (typeof item.customToClientFn === 'function')
      return item.customToClientFn(source, item, options);
    else if (item.clientSide) {
      if (typeof item.clientSidePresolve === 'function')
        source = item.clientSidePresolve(key, source);
      return convertInnernType(
        source,
        key,
        item.clientSideChildDataModel, 
        item.clientSideDateFormat, 
        item.clientSide, 
        (item.clientSideRequired === true || (policyRequired && item.clientSideRequired !== false)), 
        item.clientSideParam, 
        options,
        debugKey,
        debugName,
      );
    }
  }
  return undefined;
}

/**
 * 数据转换器
 */
export const DataConverter = {
  registerConverter,
  unregisterConverter,
  configConvertItemCustomOptions,
  getConvertItemCustomOptions,
  convertDataItem,
  convertInnernType,
  convertArrayOrObjectItemSolver,
  makeSuccessConvertResult,
  makeFailConvertResult,
};