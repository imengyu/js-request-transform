import { defaultDataErrorFormatHandler } from "./DataErrorFormat";
import { NameMapperCase } from "./DataModel";

const tag = '[js-request-transform] ';

export type KeyValue = Record<string, unknown>;

export function logWarn(message: string, obj?: unknown) {
  console.warn(tag + message, obj);
}
export function logError(message: string, obj?: unknown, throwMessageAsError = false) {
  if (throwMessageAsError)
    throwError(message);
  else
    console.error(tag + message, obj);
}
export function throwError(message: string) {
  throw new Error(tag + message);
}
export function throwOrWarnError(message: string, strict: boolean) {
  strict ? throwError(message) : logWarn(message);
}


type DataErrorFormatHandler = (error: number, data: Record<string, string>) => string;

export const DataErrorFormatUtils = {
  handler: null as DataErrorFormatHandler | null,
  formatError(error: number, data: Record<string, string>) {
    if (this.handler) 
      return this.handler(error, data);
    return defaultDataErrorFormatHandler(error, data);
  },
  setFormatHandler(handler: DataErrorFormatHandler) {
    this.handler = handler;
  },
}

/**
 * 数据转换器的对象工具类
 */
export const DataObjectUtils = {
  /**
   * 快速克隆一个对象
   * @param obj 要克隆的对象
   * @returns 新对象
   */
  simpleClone<T>(obj: T, deepArray = false, deepObject = true): T {
    let temp: KeyValue | Array<KeyValue> | null = null;
    if (obj instanceof Array) {
      temp = deepArray ? obj.map(k => this.simpleClone(k, deepArray)) : obj.concat();
    }
    else if (typeof obj === 'object' && deepObject) {
      temp = {} as KeyValue;
      for (const item in obj) {
        const val = (obj as unknown as KeyValue)[item];
        if (val === null) temp[item] = null;
        else (temp as KeyValue)[item] = DataObjectUtils.simpleClone(val);
      }
    } else {
      temp = obj as unknown as KeyValue;
    }
    return temp as unknown as T;
  },
  /**
   * 通过字符串访问对象中的属性。
   * 
   * 访问路径：
   * * 支持点 “.” 表示子级属性。
   * * 支持数组 “[x]” 表示数组的第 x 个数据。
   * 
   * 例如：a.listData[0].title
   * 
   * @param obj 要操作的对象。
   * @param keyName 访问路径。
   * @param isSet 是否是设置模式，否则为读取模式。
   * @param setValue 设置模式时提供，读取模式可不填
   * @returns 如果是设置模式，则返回设置之前的属性值；如果是读取模式，返回当前属性值
   */
  accessObjectByString(obj: Record<string, unknown>, keyName: string, isSet: boolean, setValue?: unknown) : unknown {
    const keys = keyName.split('.');
    let ret : unknown = undefined;
    let keyIndex = 0;
    let key = keys[keyIndex];
    while (obj) {
      const leftIndex = key.indexOf('[');
      if (leftIndex > 0 && key.endsWith(']')) {
        const arr = obj[key.substring(0, leftIndex)] as Record<string, unknown>[];
        const index = parseInt(key.substring(leftIndex + 1, key.length - 1))    
        obj = arr[index];
        if (keyIndex >= keys.length - 1) {
          ret = obj;
          if (isSet) arr[index] = setValue as Record<string, unknown>;
        }
      } else {
        const newObj = obj[key] as Record<string, unknown>;
        if (keyIndex >= keys.length - 1) {
          ret = newObj;
          if (isSet)
            obj[key] = setValue as Record<string, unknown>;
        }
        obj = newObj;
      }
      if (keyIndex < keys.length - 1)
        key = keys[++keyIndex];
      else
        break;
    }
    return ret;
  },
}

/**
 * 数据转换器的日期工具类
 */
export const DataDateUtils = {
  /**
   * 格式化日期为字符串。
   * 
   * 模板支持以下格式字符串：
   * |名称|说明|
   * |--|--|
   * |yyyy|完整年份，例如2014|
   * |YYYY|同 yyyy|
   * |MM|两位月份，例如01，12|
   * |M|一位月份，例如1，11|
   * |dd|两位日期，例如15|
   * |DD|同dd|
   * |HH|24小时制的两位小时数，例如04，23|
   * |hh|12小时制的两位小时数，例如05|
   * |mm|两位分钟数|
   * |ii|同mm|
   * |ss|两位秒数|
   * 
   * @param date 日期
   * @param formatStr 日期格式化模板，不填写默认是 `'YYYY-MM-dd HH:ii:ss'`
   */
  formatDate(date: Date, formatStr?: string) {
    const pad = DataStringUtils.pad;
    let str = formatStr ? formatStr : "YYYY-MM-dd HH:ii:ss";

    //let Week = ['日','一','二','三','四','五','六'];
    str = str.replace(/yyyy|YYYY/, (date.getFullYear()).toString());
    str = str.replace(/MM/, pad(date.getMonth() + 1, 2));
    str = str.replace(/M/, (date.getMonth() + 1).toString());
    str = str.replace(/dd|DD/, pad(date.getDate(), 2));
    str = str.replace(/d/, date.getDate().toString());
    str = str.replace(/HH/, pad(date.getHours(), 2));
    str = str.replace(
      /hh/,
      pad(date.getHours() > 12 ? date.getHours() - 12 : date.getHours(), 2)
    );
    str = str.replace(/mm/, pad(date.getMinutes(), 2));
    str = str.replace(/ii/, pad(date.getMinutes(), 2));
    str = str.replace(/ss/, pad(date.getSeconds(), 2));
    return str;
  },
  /**
   * 判断一个参数是不是有效的 Date 日期类型。
   * @param date 要判断的参数
   * @returns 
   */
  isVaildDate(date: Date) {
    return date instanceof Date && !isNaN(date.getTime());
  },
};

/**
 * 数据转换器的字符串工具类
 */
export const DataStringUtils = {
  /**
   * 数字字符串去掉末尾多余的0
   * @param num 数字字符串
   * @returns 
   */
  cutNumberZero(num: string) {
    //拷贝一份 返回去掉零的新串
    let newstr = num;
    //循环变量 小数部分长度
    let leng = num.length - num.indexOf('.') - 1;
    //判断是否有效数
    if (num.indexOf('.') > -1) {
      //循环小数部分
      for (let i = leng; i > 0; i--) {
        //如果newstr末尾有0
        if (
          newstr.lastIndexOf('0') > -1 &&
          newstr.substr(newstr.length - 1, 1) === '0'
        ) {
          let k = newstr.lastIndexOf('0');
          //如果小数点后只有一个0 去掉小数点
          if (newstr.charAt(k - 1) == '.') {
            return newstr.substring(0, k - 1);
          } else {
            //否则 去掉一个0
            newstr = newstr.substring(0, k);
          }
        } else {
          //如果末尾没有0
          return newstr;
        }
      }
    }
    return num;
  },
  /**
   * 将数字转为字符串，支持长整数
   * @param num 数字
   * @param digits 小数点位数
   */
  toNumberStr(num: number, digits: number) {
    const fixedString = num.toFixed(digits);

    // 正则匹配小数科学记数法
    if (fixedString.includes('.')) {
      // 去除小数点末尾多余的0
      return DataStringUtils.cutNumberZero(fixedString);
    } else {
      //否则转为长整数显示
      const str = num.toLocaleString();
      return str.replace(/[,]/g, '');
    }
  },
  /**
   * 数字转为字符串时不足补0.
   * @param num 数字
   * @param n 需要保留的位数。
   */
  pad(num: number, n: number): string {
    let strNum = num.toString();
    let len = strNum.length;
    while (len < n) {
      strNum = "0" + strNum;
      len++;
    }
    return strNum;
  },
  /**
   * 将字符串转为指定的命名方式。
   * @param type 命名方式
   * @param str 字符串
   */
  covertStringToCase(type: NameMapperCase, str: string) {
    function firstToCase(s: string, upper: boolean = false) {
      return (upper? s.charAt(0).toUpperCase() : s.charAt(0).toLowerCase()) + s.substring(1);
    }
    switch (type) {
      case 'Camel':
        return firstToCase(str.replace(/[-_][A-Za-z]/g, (match) => match.charAt(1).toUpperCase()));
      case 'Pascal':
        return firstToCase(str.replace(/[-_][A-Za-z]/g, (match) => match.charAt(1).toUpperCase()), true);
      case 'Snake':
        return firstToCase(str).replace(/([A-Z][a-z])/g, (match) => `_${match.toLowerCase()}`).replace(/\-/g, '_').split('_').filter(k => k).join('_');
      case 'Midline':
        return firstToCase(str).replace(/([A-Z][a-z])/g, (match) => `_${match.toLowerCase()}`).replace(/\_/g, '-').split('-').filter(k => k).join('-');
    }
    return str;
  }
}

