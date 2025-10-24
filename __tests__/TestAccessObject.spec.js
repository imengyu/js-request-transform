const { DataObjectUtils } = require('../dist');

test('TestAccessObject', () => {
  const sourceJson = {
    key: 2,
    dataWithChild: {
      key: 3
    },
    dataWithChild2: {
      child: {
        key: 5
      },
    },
    dataWithArray: [
      {
        key: 3
      },
      {
        key: 4
      },
    ],
  };

  let accessKey = DataObjectUtils.accessObjectByString(sourceJson, 'key', false);
  expect(accessKey).toBe(2);
  accessKey = DataObjectUtils.accessObjectByString(sourceJson, 'dataWithChild.key', false);
  expect(accessKey).toBe(3);
  accessKey = DataObjectUtils.accessObjectByString(sourceJson, 'dataWithChild2.child.key', false);
  expect(accessKey).toBe(5);
  accessKey = DataObjectUtils.accessObjectByString(sourceJson, 'dataWithArray[0].key', false);
  expect(accessKey).toBe(3);
  accessKey = DataObjectUtils.accessObjectByString(sourceJson, 'dataWithArray[1].key', false);
  expect(accessKey).toBe(4);

  DataObjectUtils.accessObjectByString(sourceJson, 'key', true, 10);
  expect(sourceJson.key).toBe(10)
  DataObjectUtils.accessObjectByString(sourceJson, 'dataWithChild.key', true, 11);
  expect(sourceJson.dataWithChild.key).toBe(11)
  DataObjectUtils.accessObjectByString(sourceJson, 'dataWithChild2.child.key', true, 12);
  expect(sourceJson.dataWithChild2.child.key).toBe(12)
  DataObjectUtils.accessObjectByString(sourceJson, 'dataWithArray[0].key', true, 13);
  expect(sourceJson.dataWithArray[0].key).toBe(13)
  DataObjectUtils.accessObjectByString(sourceJson, 'dataWithArray[1].key', true, 14);
  expect(sourceJson.dataWithArray[1].key).toBe(14)
}) 
