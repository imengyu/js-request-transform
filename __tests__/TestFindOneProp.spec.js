const { findOneProp } = require('../dist');

describe('TestFindOneProp', () => {
  // 基础测试对象
  const testObject = {
    name: 'test',
    data: [1, 2, 3],
    info: { id: 1, value: 'info' },
    user_id: 123,
    item_name: 'test_item',
    result_data: 'result',
    status: true
  };

  describe('match condition', () => {
    test('match exact property name', () => {
      const result = findOneProp(testObject, [{
        type: 'match',
        name: 'name'
      }]);
      expect(result).toBe('test');
    });

    test('match non-existent property', () => {
      const result = findOneProp(testObject, [{
        type: 'match',
        name: 'non_existent'
      }]);
      expect(result).toBeUndefined();
    });
  });

  describe('startWith condition', () => {
    test('match property starting with specific string', () => {
      const result = findOneProp(testObject, [{
        type: 'startWith',
        name: 'user_'
      }]);
      expect(result).toBe(123);
    });

    test('startWith multiple matches, return first one', () => {
      const result = findOneProp(testObject, [{
        type: 'startWith',
        name: 'item_'
      }]);
      expect(result).toBe('test_item');
    });

    test('startWith no match', () => {
      const result = findOneProp(testObject, [{
        type: 'startWith',
        name: 'xyz_'
      }]);
      expect(result).toBeUndefined();
    });
  });

  describe('endWith condition', () => {
    test('match property ending with specific string', () => {
      const result = findOneProp(testObject, [{
        type: 'endWith',
        name: '_id'
      }]);
      expect(result).toBe(123);
    });

    test('endWith multiple matches, return first one', () => {
      const result = findOneProp(testObject, [{
        type: 'endWith',
        name: '_data'
      }]);
      expect(result).toBe('result');
    });

    test('endWith no match', () => {
      const result = findOneProp(testObject, [{
        type: 'endWith',
        name: '_xyz'
      }]);
      expect(result).toBeUndefined();
    });
  });

  describe('contain condition', () => {
    test('match property containing specific string', () => {
      const result = findOneProp(testObject, [{
        type: 'contain',
        name: 'item'
      }]);
      expect(result).toBe('test_item');
    });

    test('contain multiple matches, return first one', () => {
      const result = findOneProp(testObject, [{
        type: 'contain',
        name: '_'
      }]);
      expect(result).toBe(123);
    });

    test('contain no match', () => {
      const result = findOneProp(testObject, [{
        type: 'contain',
        name: 'xyz'
      }]);
      expect(result).toBeUndefined();
    });
  });

  describe('selectOnlyOne condition', () => {
    test('selectOnlyOne with single property object', () => {
      const singlePropObj = { name: 'single' };
      const result = findOneProp(singlePropObj, [{
        type: 'selectOnlyOne'
      }]);
      expect(result).toBe('single');
    });

    test('selectOnlyOne with multiple properties, return undefined', () => {
      const result = findOneProp(testObject, [{
        type: 'selectOnlyOne'
      }]);
      expect(result).toBeUndefined();
    });

    test('selectOnlyOne with empty object', () => {
      const emptyObj = {};
      const result = findOneProp(emptyObj, [{
        type: 'selectOnlyOne'
      }]);
      expect(result).toBeUndefined();
    });
  });

  describe('selectAtLestOne condition', () => {
    test('selectAtLestOne when no other matches', () => {
      const result = findOneProp(testObject, [{
        type: 'match',
        name: 'non_existent'
      }, {
        type: 'selectAtLestOne'
      }]);
      expect(result).toBe('test');
    });

    test('selectAtLestOne with other conditions that match', () => {
      const result = findOneProp(testObject, [{
        type: 'match',
        name: 'name'
      }, {
        type: 'selectAtLestOne'
      }]);
      expect(result).toBe('test');
    });

    test('selectAtLestOne with empty object', () => {
      const emptyObj = {};
      const result = findOneProp(emptyObj, [{
        type: 'selectAtLestOne'
      }]);
      expect(result).toBeUndefined();
    });
  });

  describe('multiple conditions', () => {
    test('multiple conditions, first match is returned', () => {
      const result = findOneProp(testObject, [{
        type: 'match',
        name: 'non_existent'
      }, {
        type: 'startWith',
        name: 'user_'
      }, {
        type: 'contain',
        name: 'name'
      }]);
      expect(result).toBe(123);
    });

    test('multiple conditions, no matches but with selectAtLestOne', () => {
      const result = findOneProp(testObject, [{
        type: 'match',
        name: 'non_existent1'
      }, {
        type: 'startWith',
        name: 'xyz_'
      }, {
        type: 'selectAtLestOne'
      }]);
      expect(result).toBe('test');
    });

    test('selectOnlyOne before other conditions', () => {
      const singlePropObj = { value: 'single' };
      const result = findOneProp(singlePropObj, [{
        type: 'selectOnlyOne'
      }, {
        type: 'match',
        name: 'value'
      }]);
      expect(result).toBe('single');
    });
  });

  describe('edge cases', () => {
    test('empty object', () => {
      const result = findOneProp({}, [{
        type: 'match',
        name: 'name'
      }]);
      expect(result).toBeUndefined();
    });

    test('object with null value', () => {
      const nullObj = { name: null, value: 'test' };
      const result = findOneProp(nullObj, [{
        type: 'match',
        name: 'name'
      }]);
      expect(result).toBeNull();
    });

    test('object with undefined value', () => {
      const undefinedObj = { name: undefined, value: 'test' };
      const result = findOneProp(undefinedObj, [{
        type: 'match',
        name: 'name'
      }]);
      expect(result).toBeUndefined();
    });

    test('nested object property', () => {
      const nestedObj = { info: { id: 1, name: 'nested' } };
      const result = findOneProp(nestedObj, [{
        type: 'match',
        name: 'info'
      }]);
      expect(result).toEqual({ id: 1, name: 'nested' });
    });

    test('property with special characters', () => {
      const specialCharObj = { 'user-id': 123, 'item/name': 'test' };
      const result1 = findOneProp(specialCharObj, [{
        type: 'match',
        name: 'user-id'
      }]);
      expect(result1).toBe(123);

      const result2 = findOneProp(specialCharObj, [{
        type: 'contain',
        name: '/'
      }]);
      expect(result2).toBe('test');
    });
  });

  describe('property value types', () => {
    const typeTestObject = {
      string: 'string',
      number: 123,
      boolean: true,
      array: [1, 2, 3],
      object: { id: 1 },
      null: null,
      undefined: undefined
    };

    test('match string value', () => {
      const result = findOneProp(typeTestObject, [{
        type: 'match',
        name: 'string'
      }]);
      expect(result).toBe('string');
      expect(typeof result).toBe('string');
    });

    test('match number value', () => {
      const result = findOneProp(typeTestObject, [{
        type: 'match',
        name: 'number'
      }]);
      expect(result).toBe(123);
      expect(typeof result).toBe('number');
    });

    test('match boolean value', () => {
      const result = findOneProp(typeTestObject, [{
        type: 'match',
        name: 'boolean'
      }]);
      expect(result).toBe(true);
      expect(typeof result).toBe('boolean');
    });

    test('match array value', () => {
      const result = findOneProp(typeTestObject, [{
        type: 'match',
        name: 'array'
      }]);
      expect(result).toEqual([1, 2, 3]);
      expect(Array.isArray(result)).toBeTruthy();
    });

    test('match object value', () => {
      const result = findOneProp(typeTestObject, [{
        type: 'match',
        name: 'object'
      }]);
      expect(result).toEqual({ id: 1 });
      expect(typeof result).toBe('object');
      expect(result).not.toBeNull();
    });

    test('match null value', () => {
      const result = findOneProp(typeTestObject, [{
        type: 'match',
        name: 'null'
      }]);
      expect(result).toBeNull();
    });

    test('match undefined value', () => {
      const result = findOneProp(typeTestObject, [{
        type: 'match',
        name: 'undefined'
      }]);
      expect(result).toBeUndefined();
    });
  });
});
