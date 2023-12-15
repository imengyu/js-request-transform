const { DataModel, DataConverter } = require('../dist');


class TestConvertFilterModelNest extends DataModel {
  constructor() {
    super();
    this._convertPolicy = 'strict-required';
    this._convertTable = {
      key1: { clientSide: 'number', serverSide: 'string' },
      key7: { clientSide: 'number', serverSide: 'string' },
      key8: { clientSide: 'number', serverSide: 'string' },
    };
  }
}
class TestConvertFilterModel extends DataModel {
  constructor() {
    super();
    this._convertPolicy = 'strict-required';
    this._convertTable = {
      key1: { clientSide: 'number', serverSide: 'string' },
      key2: { clientSide: 'number', serverSide: 'string' },
      key3: { clientSide: 'number', serverSide: 'string' },
      key4: { clientSide: 'number', serverSide: 'string' },
      key5: { clientSide: 'number', serverSide: 'string' },
      key6: { clientSide: 'number', serverSide: 'string' },
      keyNest: { 
        clientSide: 'object',
        clientSideChildDataModel: TestConvertFilterModelNest,
      },
    };
  }
}

test('TestConvertFilter', () => {

  const sourceJson = `
  {
    "key1": "1",
    "key2": "2",
    "key3": "3",
    "key4": "4",
    "key5": "5",
    "key6": "6",
    "keyNest": {
      "key1": "1",
      "key7": "7",
      "key8": "8"
    }
  }
  `;

  const clientResult = new TestConvertFilterModel().fromServerSide(JSON.parse(sourceJson), {
    filterKey: [  
      'key1', 'key2', 'key7', 'keyNest', 'keyNest.key8'
    ]
  });

  expect(clientResult.key1).toBe(1);
  expect(clientResult.key2).toBe(2);
  expect(clientResult.key3).toBe(undefined);
  expect(clientResult.key4).toBe(undefined);
  expect(clientResult.key5).toBe(undefined);
  expect(clientResult.key6).toBe(undefined);
  expect(typeof clientResult.keyNest).toBe('object');
  expect(clientResult.keyNest.key1).toBe(undefined);
  expect(clientResult.keyNest.key7).toBe(undefined);
  expect(clientResult.keyNest.key8).toBe(8);

  const clientResultWithFuncFilter = new TestConvertFilterModel().fromServerSide(JSON.parse(sourceJson), {
    filterKey: (key) => {
      return (parseInt(key.charAt(3)) >= 5 || (key.startsWith('keyNest') && key !== 'keyNest.key1'))
    }
  });

  expect(clientResultWithFuncFilter.key1).toBe(undefined);
  expect(clientResultWithFuncFilter.key2).toBe(undefined);
  expect(clientResultWithFuncFilter.key3).toBe(undefined);
  expect(clientResultWithFuncFilter.key4).toBe(undefined);
  expect(clientResultWithFuncFilter.key5).toBe(5);
  expect(clientResultWithFuncFilter.key6).toBe(6);
  expect(clientResultWithFuncFilter.keyNest.key1).toBe(undefined);
  expect(clientResultWithFuncFilter.keyNest.key7).toBe(7);
  expect(clientResultWithFuncFilter.keyNest.key8).toBe(8);

  const clientToServerModel = new TestConvertFilterModel();
  clientToServerModel.key1 = 1;
  clientToServerModel.key2 = 2;
  clientToServerModel.key3 = 3;
  clientToServerModel.key4 = 4;
  clientToServerModel.key5 = 5;
  clientToServerModel.key6 = 6;
  clientToServerModel.keyNest = new TestConvertFilterModelNest();
  clientToServerModel.keyNest.key1 = 1;
  clientToServerModel.keyNest.key7 = 7;
  clientToServerModel.keyNest.key8 = 8;
}) 
