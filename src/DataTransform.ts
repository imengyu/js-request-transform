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

import { FastTemplateDataModel } from "./DataConverter";
import { DataModel, FastTemplateDataModelDefine } from "./DataModel";
import { KeyValue } from "./DataUtils";

/**
 * 将JSON数据转为数据模型
 * @param c 目标类
 * @param rs 源数据实例
 * @returns 数据模型实例
 */
export function transformDataModel<T extends DataModel>(c: (new () => T)|FastTemplateDataModelDefine, source: KeyValue) : T {
  if (typeof c === 'function')
    return new c().fromServerSide(source) as T;
  else
    return new FastTemplateDataModel(c, '').fromServerSide(source) as T;
}
/**
 * 将JSON数组数据转为数据模型数组
 * @param c 目标类
 * @param rs 源数据数组
 * @returns 数据模型数组
 */
export function transformArrayDataModel<T extends DataModel>(c: (new () => T)|FastTemplateDataModelDefine, source: KeyValue[], sourceKeyName: string) : T[] {
  const array = [] as T[];
  if (typeof source === 'undefined')
    throw new Error(`transformArrayDataModel fail: The required field ${sourceKeyName} is not provide.`);
  if (!(source instanceof Array))
    throw new Error(`transformArrayDataModel fail: The required field ${sourceKeyName} is not a array.`);
  for (const item of source) {
    if (typeof c === 'function') 
      array.push(new c().fromServerSide(item) as T);
    else
      array.push(new FastTemplateDataModel(c, '').fromServerSide(item) as T);
  }
  return array;
}