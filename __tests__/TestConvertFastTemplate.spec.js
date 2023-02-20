const { DataModel, DataConverter } = require('../dist');

class TestConvertFastTemplategModel extends DataModel {
  constructor() {
    super();
    this._convertTable = {
      nestedObject: {
        clientSide: 'object', 
        clientSideChildDataModel: {
          convertTable: {
            stringProp: { clientSide: 'string' },
            numberProp: { clientSide: 'number' },
            arrayProp: { clientSide: 'array' },
          }
        },
        serverSide: 'object', 
        serverSideChildDataModel: {
          convertTable: {
            stringProp: { serverSide: 'number' },
            numberProp: { serverSide: 'string' },
          }
        },
      },
      nestedArray: {
        clientSide: 'array', 
        clientSideChildDataModel: {
          convertTable: {
            stringProp: { clientSide: 'string' },
            numberProp: { clientSide: 'number' },
            objectProp: { clientSide: 'object' },
          }
        },
        serverSide: 'object', 
        serverSideChildDataModel: {
          convertTable: {
            stringProp: { serverSide: 'number' },
            numberProp: { serverSide: 'string' },
          }
        },
      },
    };
  }
  nestedObject = {
    stringProp: '',
    numberProp: 0,
    arrayProp: [],
  };
  nestedArray = [{
    stringProp: '',
    numberProp: 0,
    arrayProp: [],
  }];
}

test('TestConvertFastTemplategToClient', () => {

  const sourceJson = `
  {
    "nestedObject": {
      "stringProp": 3,
      "numberProp": "6",
      "arrayProp": [
        "a"
      ]
    },
    "nestedArray": [
      {
        "stringProp": 1,
        "numberProp": "2",
        "arrayProp": [ "a" ]
      },
      {
        "stringProp": 2,
        "numberProp": "3",
        "arrayProp": [ "b" ]
      }
    ]
  }
  `;

  const serverResult = new TestConvertFastTemplategModel().fromServerSide(JSON.parse(sourceJson));

  expect(typeof serverResult.nestedObject === 'object').toBeTruthy();
  expect(serverResult.nestedArray instanceof Array).toBeTruthy();
  expect(typeof serverResult.nestedObject.stringProp === 'string').toBeTruthy();
  expect(typeof serverResult.nestedObject.numberProp === 'number').toBeTruthy();
  expect(serverResult.nestedObject.arrayProp instanceof Array).toBeTruthy();
  expect(serverResult.nestedObject.stringProp).toBe('3');
  expect(serverResult.nestedObject.numberProp).toBe(6);
  expect(serverResult.nestedArray.length).toBe(2);
  expect(serverResult.nestedArray[0].stringProp).toBe('1');
  expect(serverResult.nestedArray[0].numberProp).toBe(2);
  expect(serverResult.nestedArray[0].arrayProp instanceof Array).toBeTruthy();
  expect(serverResult.nestedArray[1].stringProp).toBe('2');
  expect(serverResult.nestedArray[1].numberProp).toBe(3);
  expect(serverResult.nestedArray[1].arrayProp instanceof Array).toBeTruthy();
}) 

test('TestConvertFastTemplategToSever', () => {

  const clientModel = new TestConvertFastTemplategModel();
  clientModel.nestedObject.numberProp = 1;
  clientModel.nestedObject.stringProp = '2';
  const serverData = clientModel.toServerSide();

  expect(serverData.nestedObject.numberProp).toBe('1');
  expect(serverData.nestedObject.stringProp).toBe(2);
}) 
