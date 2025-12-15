const { findOneBestArray } = require('../dist');

test('TestFindOneBestArray_TopLevelArray', () => {
  // 测试用例1: 简单对象包含数组
  const test1 = {
    name: 'test',
    data: [1, 2, 3, 4, 5],
    info: { 
      id: 1,
      items: ['a', 'b', 'c']
    }
  };

  const result = findOneBestArray(test1);
  expect(result).toEqual([1, 2, 3, 4, 5]);
  expect(Array.isArray(result)).toBeTruthy();
});

test('TestFindOneBestArray_NestedArray', () => {
  // 测试用例2: 嵌套对象包含数组
  const test2 = {
    result: {
      success: true,
      data: {
        list: [
          { id: 1, name: 'item1' },
          { id: 2, name: 'item2' },
          { id: 3, name: 'item3' }
        ],
        total: 3
      }
    }
  };

  const result = findOneBestArray(test2);
  expect(result).toEqual([
    { id: 1, name: 'item1' },
    { id: 2, name: 'item2' },
    { id: 3, name: 'item3' }
  ]);
  expect(Array.isArray(result)).toBeTruthy();
  expect(result.length).toBe(3);
});

test('TestFindOneBestArray_NoArray', () => {
  // 测试用例3: 没有数组的对象
  const test3 = {
    name: 'test',
    age: 18,
    info: {
      address: 'test address',
      phone: '1234567890'
    }
  };

  const result = findOneBestArray(test3);
  expect(result).toEqual([]);
  expect(Array.isArray(result)).toBeTruthy();
});

test('TestFindOneBestArray_MixedArray', () => {
  // 测试用例4: 混合类型的数组（不合理的数组）
  const test4 = {
    mixed: [1, 'a', true, {}, []],
    good: [{ id: 1 }, { id: 2 }, { id: 3 }]
  };

  const result = findOneBestArray(test4);
  expect(result).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
  expect(Array.isArray(result)).toBeTruthy();
  expect(result.length).toBe(3);
});

test('TestFindOneBestArray_EmptyArray', () => {
  // 测试用例5: 空数组
  const test5 = {
    empty: [],
    good: [1, 2, 3]
  };

  const result = findOneBestArray(test5);
  expect(result).toEqual([1, 2, 3]);
  expect(Array.isArray(result)).toBeTruthy();
  expect(result.length).toBe(3);
});

test('TestFindOneBestArray_OnlyEmptyArray', () => {
  // 测试用例6: 只有空数组
  const test6 = {
    empty1: [],
    empty2: [],
    info: { name: 'test' }
  };

  const result = findOneBestArray(test6);
  expect(result).toEqual([]);
  expect(Array.isArray(result)).toBeTruthy();
});

test('TestFindOneBestArray_NotObject', () => {
  // 测试用例7: 不是对象的输入
  const test7 = [1, 2, 3]; // 直接传入数组

  const result = findOneBestArray(test7);
  expect(result).toEqual([]);
  expect(Array.isArray(result)).toBeTruthy();
});

test('TestFindOneBestArray_NullInput', () => {
  // 测试用例8: null输入
  const test8 = null;

  const result = findOneBestArray(test8);
  expect(result).toEqual([]);
  expect(Array.isArray(result)).toBeTruthy();
});
