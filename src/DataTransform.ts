/* eslint-disable @typescript-eslint/ban-types */
/**
 * 固定模型转换层
 *
 * 功能介绍：
 *    本文件提供了几个固定模型的转换函数，你可以调用这些函数来快速转换。
 *
 * Author: imengyu
 * Date: 2021/09/25
 *
 * Copyright (c) 2021 imengyu.top. Licensed under the MIT License.
 * See License.txt in the project root for license information.
 */

import { ConvertPolicy, DataConverter, FastTemplateDataModel } from "./DataConverter";
import { DATA_MODEL_ERROR_ARRAY_IS_NOT_ARRAY, DATA_MODEL_ERROR_ARRAY_REQUIRED_KEY_MISSING } from "./DataErrorFormat";
import { ChildDataModel, DataModel, DataModelConvertOptions, FastTemplateDataModelDefine, NewDataModel } from "./DataModel";
import { DataErrorFormatUtils, DataObjectUtils, KeyValue } from "./DataUtils";

/**
 * 用于从服务端转为客户端数据，将JSON数据转为数据模型，
 * 
 * * 支持设置模型作为转换类型，例如：
 * ```
 *    transformDataModel(DataModel, source)
 * ```
 *    同 `new DataModel().fromServerSide(source)`。
 * 
 * * 支持快速模板作为转换类型，例如：
 * ```
 *    transformDataModel({
 *      convertTable: {
 *        prop: {
            clientSide: 'object', 
            clientSideChildDataModel: {
              convertTable: {
                stringProp: { clientSide: 'string' },
                numberProp: { clientSide: 'number' },
                arrayProp: { clientSide: 'array' },
              }
            },
          }
        }
 *    }, source)
 * ```
 *    数据中会按照您设置的转换表转换然后返回。
 * 
 * @param c 目标类
 * @param source 源数据实例
 * @param userOptions 其他转换自定义配置
 * @returns 数据模型实例
 */
export function transformDataModel<T extends DataModel>(
  c: NewDataModel|FastTemplateDataModelDefine, 
  source: KeyValue,
  userOptions?: DataModelConvertOptions | undefined
) : T {
  if (typeof c === 'function')
    return new c().fromServerSide(source, userOptions) as T;
  else
    return new FastTemplateDataModel(c, '').fromServerSide(source, userOptions) as T;
}

/**
 * 用于从服务端转为客户端数据，将JSON数据根据转换器名称转为指定数据模型或者基本类型
 * @param converterName 转换器名称
 * @param source 源数据实例
 * @param sourceKeyName 标识数据名称，用于异常显示
 * @param arrayChildDataModel 当是数组或者集合等嵌套对象时，指定子对象的数据类型
 * @param defaultDateFormat 默认日期格式
 * @param defaultConvertPolicy 默认转换策略
 * @param userOptions 其他转换自定义配置
 * @returns 
 */
export function transformWithConverter(
  converterName: string, 
  source: KeyValue, 
  sourceKeyName = 'root', 
  arrayChildDataModel: ChildDataModel|undefined = undefined,
  defaultDateFormat = 'YYYY-MM-DD HH:mm:ss',
  defaultConvertPolicy: ConvertPolicy = 'strict-required',
  userOptions?: DataModelConvertOptions | undefined
) : unknown {
  return DataConverter.convertInnernType(source, sourceKeyName, arrayChildDataModel, undefined, converterName, true, undefined, {
    direction: 'client',
    defaultDateFormat,
    policy: defaultConvertPolicy,
    userOptions,
  }, sourceKeyName, 'transformWithConverter');
}

/**
 * 用于从服务端转为客户端数据，将JSON数组数据转为数据模型数组
 * @param c 目标类
 * @param source 源数据数组
 * @param sourceKeyName 标识数据名称，用于异常显示
 * @param throwErrorIfFail 是否在传入非数组时抛出异常，否则返回空数组。默认：true
 * @param userOptions 其他转换自定义配置
 * @returns 数据模型数组
 */
export function transformArrayDataModel<T extends DataModel>(
  c: NewDataModel|FastTemplateDataModelDefine, 
  source: KeyValue[]|Iterable<KeyValue>|ArrayLike<KeyValue>, 
  sourceKeyName: string, 
  throwErrorIfFail = true,
  userOptions?: DataModelConvertOptions | undefined
) : T[] {
  const array = [] as T[];
  if (typeof source === 'undefined') {
    if (throwErrorIfFail)
      throw new Error(DataErrorFormatUtils.formatError(DATA_MODEL_ERROR_ARRAY_REQUIRED_KEY_MISSING, { sourceKey: sourceKeyName }));
    else
      return array;
  }
  if (!Array.isArray(source) && DataObjectUtils.isIterable(source))
    source = Array.from(source);
  if (!Array.isArray(source)) {
    if (throwErrorIfFail)
      throw new Error(DataErrorFormatUtils.formatError(DATA_MODEL_ERROR_ARRAY_IS_NOT_ARRAY, { sourceKey: sourceKeyName }));
    else
      return array;
  }
  for (const item of source) {
    if (typeof c === 'function') 
      array.push(new c().fromServerSide(item, userOptions) as T);
    else
      array.push(new FastTemplateDataModel(c, '').fromServerSide(item, userOptions) as T);
  }
  return array;
}