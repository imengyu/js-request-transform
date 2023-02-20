const { DataModel, DataConverter } = require('../dist');

class TestConvertMapModel extends DataModel {
  constructor() {
    super();
    this._convertTable = {
      arrayToMap: {
        clientSide: 'map', 
        clientSideParam: { mapKey: 'id' },
        serverSide: 'array', 
      },
      keyValueToMap: {
        clientSide: 'map', 
        serverSide: 'object', 
      },
    };
  }

  arrayToMap = new Map();
  keyValueToMap = new Map();
}

test('TestConvertMapToClient', () => {

  const sourceJson = `
  {
    "arrayToMap": [
      { "id": 1, "name": "张三" },
      { "id": 2, "name": "李四" },
      { "id": 3, "name": "王五" },
      { "id": 4, "name": "于六" },
      { "id": 5, "name": "刘七" }
    ],
    "keyValueToMap": {
      "1": { "name": "张三" },
      "2": { "name": "李四" },
      "3": { "name": "王五" },
      "4": { "name": "于六" }
    }
  }
  `;

  const serverResult = new TestConvertMapModel().fromServerSide(JSON.parse(sourceJson));

  expect(serverResult.arrayToMap instanceof Map).toBeTruthy();
  expect(serverResult.arrayToMap.size).toBe(5);
  expect(serverResult.keyValueToMap instanceof Map).toBeTruthy();
  expect(serverResult.keyValueToMap.size).toBe(4);
  expect(serverResult.arrayToMap.get(3).name).toBe('王五');
  expect(serverResult.arrayToMap.get(5).name).toBe('刘七');
  expect(serverResult.keyValueToMap.get('3').name).toBe('王五');
  expect(serverResult.keyValueToMap.get('4').name).toBe('于六');
}) 

test('TestConvertMapToSever', () => {

  const clientModel = new TestConvertMapModel();
  clientModel.arrayToMap.set(1, '张三');
  clientModel.arrayToMap.set(2, '李四');
  clientModel.arrayToMap.set(3, '王五');
  clientModel.arrayToMap.set(4, '于六');
  clientModel.keyValueToMap.set(1, '张三');
  clientModel.keyValueToMap.set(2, '李四');
  clientModel.keyValueToMap.set(3, '王五');
  clientModel.keyValueToMap.set(4, '于六');
  const serverData = clientModel.toServerSide();

  expect(serverData.arrayToMap instanceof Array).toBeTruthy();
  expect(serverData.arrayToMap.length).toBe(4);
  expect(serverData.arrayToMap[0]).toBe('张三');
  expect(serverData.arrayToMap[3]).toBe('于六');
  expect(typeof serverData.keyValueToMap).toBe('object');
  expect(Object.keys(serverData.keyValueToMap).length).toBe(4);
  expect(serverData.keyValueToMap['1']).toBe('张三');
  expect(serverData.keyValueToMap['2']).toBe('李四');
}) 
