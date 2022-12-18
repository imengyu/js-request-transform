const tag = '[js-request-transform] ';

export type KeyValue = Record<string, unknown>;

export function logWarn(message: string, obj?: unknown[]) {
  console.warn(tag + message, obj);
}
export function logError(message: string, obj?: unknown[]) {
  console.error(tag + message, obj);
}
export function simpleClone<T>(obj: T) : T {
  let temp: KeyValue|Array<KeyValue>|null = null;
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
export function pad(num: number, n: number) : string {
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