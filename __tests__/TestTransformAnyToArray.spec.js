const { transformAnyToArray } = require('../dist');

describe('TestTransformAnyToArray', () => {
  // 测试数组类型输入
  test('transform array input', () => {
    const input = [1, 2, 3];
    const result = transformAnyToArray(input);
    expect(result).toEqual(input);
  });

  // 测试对象类型输入
  test('transform object input', () => {
    const input = { a: 1, b: 2, c: 3 };
    const result = transformAnyToArray(input);
    expect(result).toEqual([1, 2, 3]);
  });

  // 测试Map类型输入
  test('transform Map input', () => {
    const input = new Map([['a', 1], ['b', 2], ['c', 3]]);
    const result = transformAnyToArray(input);
    expect(result).toEqual([1, 2, 3]);
  });

  // 测试可解析为JSON数组的字符串
  test('transform JSON array string', () => {
    const input = '[1, 2, 3]';
    const result = transformAnyToArray(input);
    expect(result).toEqual([1, 2, 3]);
  });

  // 测试可解析为JSON对象的字符串
  test('transform JSON object string', () => {
    const input = '{"a": 1, "b": 2}';
    const result = transformAnyToArray(input);
    expect(result).toEqual([1, 2]);
  });

  // 测试无法解析的JSON字符串
  test('transform invalid JSON string', () => {
    const input = '{a: 1}'; // 无效的JSON格式
    const result = transformAnyToArray(input);
    expect(result).toEqual([]);
  });

  // 测试基本类型输入 - 数字
  test('transform number input', () => {
    const input = 123;
    const result = transformAnyToArray(input);
    expect(result).toEqual([123]);
  });

  // 测试基本类型输入 - 字符串
  test('transform primitive string input', () => {
    const input = 'test';
    const result = transformAnyToArray(input);
    expect(result).toEqual(['test']);
  });

  // 测试基本类型输入 - 布尔值
  test('transform boolean input', () => {
    const input = true;
    const result = transformAnyToArray(input);
    expect(result).toEqual([true]);
  });

  // 测试基本类型输入 - null
  test('transform null input', () => {
    const input = null;
    const result = transformAnyToArray(input);
    expect(result).toEqual([]);
  });

  // 测试基本类型输入 - undefined
  test('transform undefined input', () => {
    const result = transformAnyToArray(undefined);
    expect(result).toEqual([]);
  });

  // 测试嵌套JSON字符串
  test('transform nested JSON string', () => {
    const input = '{"data": {"list": [1, 2, 3]}}';
    const result = transformAnyToArray(input, { nestArray: true });
    expect(result).toEqual([1, 2, 3]);
  });

  // 测试空数组
  test('transform empty array', () => {
    const input = [];
    const result = transformAnyToArray(input);
    expect(result).toEqual([]);
  });

  // 测试空对象
  test('transform empty object', () => {
    const input = {};
    const result = transformAnyToArray(input);
    expect(result).toEqual([]);
  });

  // 测试空字符串
  test('transform empty string', () => {
    const input = '';
    const result = transformAnyToArray(input);
    expect(result).toEqual([]);
  });

  // 测试特殊字符的JSON字符串
  test('transform special characters JSON string', () => {
    const input = '{"name": "测试", "value": 123}';
    const result = transformAnyToArray(input);
    expect(result).toEqual(['测试', 123]);
  });
});
