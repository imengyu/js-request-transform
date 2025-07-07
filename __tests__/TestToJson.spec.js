const { DataModel, DataConverter } = require('../dist');

class TestToJsonChildModel extends DataModel {
  constructor() {
    super();
  }

  aFunction() {
    console.log('aFunction')
  }
  aString = '0';
  aNumber = 0;
}

class TestToJsonModel extends DataModel {
  constructor() {
    super();
  }

  aFunction() {
    console.log('aFunction')
  }

  aString = '0';
  aNumber = 0;
  arrayType = [];
  arrayNesetType = [];
}

test('TestToJson', () => {
  const model = new TestToJsonModel();
  model.arrayType = [
    1, () => 1, '1',
  ];
  model.arrayNesetType = [
    new TestToJsonChildModel(),
  ];

  const json = model.toJSON();

  expect(json._convertPolicy).toBe(undefined);
  expect(json._convertTable).toBe(undefined);
  expect(json.fromServerSide).toBe(undefined);
  expect(json.aString).toBe('0');
  expect(json.aNumber).toBe(0);
  expect(json.aFunction).toBe(undefined);
  expect(json.arrayType).toBeInstanceOf(Array);
  expect(json.arrayNesetType).toBeInstanceOf(Array);

  expect(json.arrayType.length).toBe(3);
  expect(json.arrayType[0]).toBe(1);
  expect(json.arrayType[1]).toBe(undefined);
  expect(json.arrayType[2]).toBe('1');
  expect(json.arrayNesetType.length).toBe(1);
  expect(json.arrayNesetType[0].aString).toBe('0');
  expect(json.arrayNesetType[0].aNumber).toBe(0);
  expect(json.arrayNesetType[0].aFunction).toBe(undefined);
  expect(json.arrayNesetType[0]._convertPolicy).toBe(undefined);
  expect(json.arrayNesetType[0]._convertTable).toBe(undefined);
  expect(json.arrayNesetType[0].fromServerSide).toBe(undefined);
}) 
