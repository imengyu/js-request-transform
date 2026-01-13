const { DataModel, DataConverter, transformWithConverter } = require('../dist');

class TestConvertToClientSingleModel extends DataModel {
  constructor() {
    super();
    this._convertPolicy = 'strict-required';
    this._convertTable = {
      requiredStringProp: { clientSide: 'string' },
    };
  }

  requiredStringProp = '';
}

test('TestConvertToClientPrimitive', () => {
  expect(transformWithConverter('number', '23')).toBe(23);
  expect(transformWithConverter('string', 1)).toBe('1');
  expect(transformWithConverter('boolean', 1)).toBe(true);
  expect(transformWithConverter('array', '[]') instanceof Array).toBeTruthy();
  expect(typeof transformWithConverter('object', '{}')).toBe('object');
}) 

test('TestConvertToClientPrimitiveErrorCatch', () => {
  expect(() => {
    transformWithConverter('number', '{"haha":"a}');
  }).toThrow();
  expect(() => {
    transformWithConverter('array', 1);
  }).toThrow();
  expect(() => {
    transformWithConverter('object', 1);
  }).toThrow();
}) 