const tag = '[js-request-transform] ';

export type KeyValue = Record<string, unknown>;

export function logWarn(message: string, obj?: unknown) {
  console.warn(tag + message, obj);
}
export function logError(message: string, obj?: unknown) {
  console.error(tag + message, obj);
}
export function simpleClone<T>(obj: T): T {
  let temp: KeyValue | Array<KeyValue> | null = null;
  if (obj instanceof Array) {
    temp = obj.concat();
  }
  else if (typeof obj === 'object') {
    temp = {} as KeyValue;
    for (const item in obj) {
      const val = (obj as unknown as KeyValue)[item];
      if (val === null) temp[item] = null;
      else (temp as KeyValue)[item] = simpleClone(val);
    }
  } else {
    temp = obj as unknown as KeyValue;
  }
  return temp as unknown as T;
}
export function pad(num: number, n: number): string {
  let strNum = num.toString();
  let len = strNum.length;
  while (len < n) {
    strNum = "0" + strNum;
    len++;
  }
  return strNum;
}
export function formatDate(date: Date, formatStr?: string) {
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
};
export function isVaildDate(date: Date) {
  return date instanceof Date && !isNaN(date.getTime());
}

export function cutNumberZero(num: string) {
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
}
export function toNumberStr(num: number, digits: number) {
  const fixedString = num.toFixed(digits);

  // 正则匹配小数科学记数法
  if (fixedString.includes('.')) {
    // 去除小数点末尾多余的0
    return cutNumberZero(fixedString);
  } else {
    //否则转为长整数显示
    const str = num.toLocaleString();
    return str.replace(/[,]/g, '');
  }
}
