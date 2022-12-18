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

import { DataModel } from "./DataModel";
import { KeyValue } from "./DataUtils";

/**
 * 将JSON数据转为数据模型
 * @param c 目标类
 * @param rs 源数据实例
 * @returns 数据模型实例
 */
export function transformDataModel<T extends DataModel>(c: new () => T, source: KeyValue) : T {
  return new c().fromServerSide(source) as T;
}
/**
 * 将JSON数组数据转为数据模型数组
 * @param c 目标类
 * @param rs 源数据数组
 * @returns 数据模型数组
 */
export function transformArrayResult<T extends DataModel>(c: new () => T, source: KeyValue[]) : T[] {
  const array = [] as T[];
  for (const item of source) {
    array.push(new c().fromServerSide(item) as T);
  }
  return array;
}