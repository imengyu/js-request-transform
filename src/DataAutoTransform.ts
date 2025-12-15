export interface FindOnePropCondition {
  /**
   * 匹配类型
   * startWith: (需要name)匹配以指定字符串开头的属性值
   * endWith: (需要name)匹配以指定字符串结尾的属性值
   * contain: (需要name)匹配包含指定字符串的属性值
   * match: (需要name)匹配完全等于指定字符串的属性值
   * selectOnlyOne: 如果只有一个key，仅返回此key的属性值
   * selectAtLestOne: 如果没有匹配到任何属性值，返回keys中第一个
   */
  type: 'startWith'|'endWith'|'contain'|'match'|'selectOnlyOne'|'selectAtLestOne';
  name?: string;
}

/**
 * 在一个对象中根据匹配条件查找一个属性值
 * @param source 源对象
 * @param matchConditions 匹配条件
 * @param assertMessage 如果提供了断言失败时的错误信息，则在未匹配到属性值时抛出指定信息的错误
 * @returns 匹配到的属性值，或者undefined
 */
export function findOneProp(source: Record<string, any>, matchConditions: FindOnePropCondition[], assertMessage?: string) {
  // 获取source对象的所有键
  const keys = Object.keys(source);

  // 如果只有一个key，仅返回此key的属性值
  if (matchConditions.some(cond => cond.type === 'selectOnlyOne')) {
    if (keys.length === 1)
      return source[keys[0]];
  } 

  // 遍历所有匹配条件
  for (const condition of matchConditions) {
    switch (condition.type) {
      case 'startWith':
        if (condition.name) {
          // 查找以指定字符串开头的属性值
          for (const key of keys) {
            if (key.startsWith(condition.name)) {
              return source[key];
            }
          }
        }
        break;
      case 'endWith':
        if (condition.name) {
          // 查找以指定字符串结尾的属性值
          for (const key of keys) {
            if (key.endsWith(condition.name)) {
              return source[key];
            }
          }
        }
        break;
      case 'match':
        if (condition.name) {
          // 查找完全等于指定字符串的属性值
          for (const key of keys) {
            if (key === condition.name) {
              return source[key];
            }
          }
        }
        break;
      case 'contain':
        if (condition.name) {
          // 查找包含指定字符串的属性值
          for (const key of keys) {
            if (key.includes(condition.name)) {
              return source[key];
            }
          }
        }
        break;
    }
  }

  if (matchConditions.some(cond => cond.type === 'selectAtLestOne')) {
    // 如果没有匹配到任何属性值，返回keys中第一个
    if (keys.length > 0) {
      return source[keys[0]];
    }
  }
  
  // 如果所有条件都未匹配到且提供了断言错误信息，抛出错误
  if (assertMessage) {
    throw new Error(assertMessage);
  }
  // 如果所有条件都未匹配到，返回undefined
  return undefined;
}

/**
 * 在一个对象中递归查找最可能的列表数组并返回。将会递归查找所有属性值，
 * 并返回第一个匹配到的列表数组。如果没有匹配到任何列表数组，则返回空数组。
 * @param source 
 */
export function findOneBestArray(source: Record<string, any>): any[] {
  // 如果source不是对象或为空，直接返回空数组
  if (typeof source !== 'object' || source === null) {
    return [];
  }

  // 检查当前对象的所有属性
  const keys = Object.keys(source);
  
  for (const key of keys) {
    const value = source[key];
    
    // 检查是否是数组
    if (Array.isArray(value)) {
      // 判断是否是合理的列表数组
      if (isReasonableArray(value)) {
        return value;
      }
    }
  }

  // 如果当前对象没有找到，递归检查每个属性值
  for (const key of keys) {
    const value = source[key];
    
    // 只递归检查对象类型的值
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const result = findOneBestArray(value);
      if (result.length > 0) {
        return result;
      }
    }
  }

  // 如果没有找到任何合理的数组，返回空数组
  return [];
}

/**
 * 判断一个数组是否是合理的列表数组
 * @param arr 要判断的数组
 * @returns 是否是合理的列表数组
 */
function isReasonableArray(arr: any[]): boolean {
  // 数组长度必须大于0
  if (arr.length === 0) {
    return false;
  }

  // 检查数组元素类型是否一致（至少80%的元素类型相同）
  const typeCounts: Record<string, number> = {};
  const total = arr.length;
  
  for (const item of arr) {
    const type = typeof item;
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  }

  // 找到出现最多的类型
  let maxCount = 0;
  for (const count of Object.values(typeCounts)) {
    if (count > maxCount) {
      maxCount = count;
    }
  }

  // 如果最多类型的元素占比超过80%，则认为是合理的列表数组
  return maxCount / total >= 0.8;
}

/**
 * 将任意类型转换为数组类型.
 * 
 * * 如果源数据是数组类型，则直接返回源数据.
 * * 如果源数据是对象/Map类型，则返回对象的所有属性值组成的数组.
 * * 如果数据是字符串，尝试将其转换为JSON对象，如果成功则json对象继续调用 transformAnyToArray ，否则返回空数组.
 * * 如果源数据是基本类型，则返回包含源数据的单数组.
 * * 如果源数据是null或undefined，则返回空数组.
 * 
 * @param source 任意类型的源数据
 * @returns 转换后的数组类型数据
 */
export function transformAnyToArray(source: unknown, options?: {
  /**
   * 是否递归查找嵌套数组，默认值为 true.
   */
  nestArray?: boolean;
}): any[] {
  // 如果源数据是null或undefined，则返回空数组
  if (source === null || source === undefined || source === '') 
    return [];
  // 如果源数据是数组类型，则直接返回源数据
  if (Array.isArray(source)) 
    return source;

  const nestArray = options?.nestArray ?? true;

  // 如果源数据是字符串，尝试将其转换为JSON对象
  if (typeof source === 'string' && (source.startsWith('{') || source.startsWith('['))) {
    try {
      const parsed = JSON.parse(source);
      if (Array.isArray(parsed)) 
        return parsed;

      if (nestArray) {
        const bestArray = findOneBestArray(parsed);
        if (bestArray.length > 0)
          return bestArray;
      }
      return transformAnyToArray(parsed, options);
    } catch (e) {
      // 如果解析失败，返回空数组
      return [];
    }
  }

  // 如果源数据是Map类型，返回所有值组成的数组
  if (source instanceof Map) {
    return Array.from(source.values());
  }

  // 如果源数据是对象类型，返回所有属性值组成的数组
  if (typeof source === 'object') {
    return Object.values(source);
  }

  // 如果源数据是基本类型，则返回包含源数据的单数组
  return [source];
}