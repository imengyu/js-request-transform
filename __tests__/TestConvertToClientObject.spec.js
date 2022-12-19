const dayjs = require('dayjs');
const { DataModel, DataConverter } = require('../dist');

DataConverter.configDayJsTimeZone('PRC');

class TestConvertToClientObjectChildChildModel extends DataModel {
  constructor() {
    super();
    this._convertTable = {
      code: { clientSide: 'string' },
      date: { clientSide: 'dayjs' }
    };
  }

  date = dayjs();
  code = '';
}

class TestConvertToClientObjectChildModel extends DataModel {
  constructor() {
    super();
    this._convertTable = {
      name: { clientSide: 'string' },
      key: { clientSide: 'number' },
    };
  }

  key = 0;
  name = '';
}
class TestConvertToClientObjectChildNestArrayModel extends TestConvertToClientObjectChildModel {
  constructor() {
    super();
    this._convertTable.items = { clientSide: 'array', clientSideChildDataModel: TestConvertToClientObjectChildChildModel }
  }
  /**
   * @type TestConvertToClientObjectChildChildModel[]
   */
  items = [];
}
class TestConvertToClientObjectChildNestObjectModel extends TestConvertToClientObjectChildModel {
  constructor() {
    super();
    this._convertTable.child = { clientSide: 'object', clientSideChildDataModel: TestConvertToClientObjectChildChildModel }
  }
  /**
   * @type TestConvertToClientObjectChildChildModel
   */
  child = null;
}

class TestConvertToClientObjectModel extends DataModel {
  constructor() {
    super();
    this._convertTable = {
      testSourceNumberTargetObject: { clientSide: 'object' },
      testSourceArrayTargetObject: { clientSide: 'object' },
      testSourceBooleanTargetObject: { clientSide: 'object' },
      testSourceObjectTargetObject1: { clientSide: 'object', clientSideChildDataModel: TestConvertToClientObjectChildModel },
      testSourceObjectTargetObject2: { clientSide: 'object', clientSideChildDataModel: TestConvertToClientObjectChildNestObjectModel },
      testSourceObjectTargetObject3: { clientSide: 'object', clientSideChildDataModel: TestConvertToClientObjectChildNestArrayModel },
      testSourceStringTargetObject1: { clientSide: 'object', clientSideChildDataModel: TestConvertToClientObjectChildModel },
      testSourceStringTargetObject2: { clientSide: 'object', clientSideChildDataModel: TestConvertToClientObjectChildNestObjectModel },
      testSourceStringTargetObject3: { clientSide: 'object', clientSideChildDataModel: TestConvertToClientObjectChildNestArrayModel },
    };
  }
}

test('TestConvertToClientObject', () => {

  const sourceJson = `
  {
    "testSourceNumberTargetObject": 0,
    "testSourceArrayTargetObject": [],
    "testSourceBooleanTargetObject": false,
    "testSourceObjectTargetObject1": { "key": 1, "name": "Abc" },
    "testSourceObjectTargetObject2": {
      "key": 2, "name": "Cde",
      "child": { "code": "Code111", "date": "2022-12-19" }
    },
    "testSourceObjectTargetObject3": {
      "key": 1, "name": "Abc",
      "items": [
        { "code": "Code111", "date": "2022-12-19" },
        { "code": "Code112", "date": "2022-12-19" }
      ]
    },
    "testSourceStringTargetObject1": "{ \\"key\\": 1, \\"name\\": \\"Abc\\" }",
    "testSourceStringTargetObject2": "{\\"key\\":2,\\"name\\":\\"Cde\\",\\"child\\":{\\"code\\":\\"Code111\\"}}",
    "testSourceStringTargetObject3": "{\\"key\\":1,\\"name\\":\\"Abc\\",\\"items\\":[{\\"code\\":\\"Code111\\"},{\\"code\\":\\"Code112\\"},{\\"code\\":\\"Code113\\"},{\\"code\\":\\"Code114\\"}]}"
  }
  `;

  const serverResult = new TestConvertToClientObjectModel().fromServerSide(JSON.parse(sourceJson));

  expect(serverResult.testSourceNumberTargetObject).toBe(undefined);
  expect(serverResult.testSourceArrayTargetObject).toBe(undefined);
  expect(serverResult.testSourceBooleanTargetObject).toBe(undefined);
  
  expect(serverResult.testSourceObjectTargetObject1 instanceof TestConvertToClientObjectChildModel).toBeTruthy();
  expect(serverResult.testSourceObjectTargetObject1.key).toBe(1);
  expect(serverResult.testSourceObjectTargetObject1.name).toBe('Abc');

  expect(serverResult.testSourceObjectTargetObject2 instanceof TestConvertToClientObjectChildModel).toBeTruthy();
  expect(serverResult.testSourceObjectTargetObject2.key).toBe(2);
  expect(serverResult.testSourceObjectTargetObject2.name).toBe('Cde');
  expect(serverResult.testSourceObjectTargetObject2.child instanceof TestConvertToClientObjectChildChildModel).toBeTruthy();
  expect(serverResult.testSourceObjectTargetObject2.child.code).toBe('Code111');
  expect(dayjs.isDayjs(serverResult.testSourceObjectTargetObject2.child.date)).toBeTruthy();

  expect(serverResult.testSourceObjectTargetObject3 instanceof TestConvertToClientObjectChildModel).toBeTruthy();
  expect(serverResult.testSourceObjectTargetObject3.key).toBe(1);
  expect(serverResult.testSourceObjectTargetObject3.name).toBe('Abc');
  expect(serverResult.testSourceObjectTargetObject3.items instanceof Array).toBeTruthy();
  expect(serverResult.testSourceObjectTargetObject3.items.length).toBe(2);
  expect(serverResult.testSourceObjectTargetObject3.items[0] instanceof TestConvertToClientObjectChildChildModel).toBeTruthy();
  expect(serverResult.testSourceObjectTargetObject3.items[1] instanceof TestConvertToClientObjectChildChildModel).toBeTruthy();
  expect(serverResult.testSourceObjectTargetObject3.items[0].code).toBe('Code111');

  expect(serverResult.testSourceStringTargetObject1 instanceof TestConvertToClientObjectChildModel).toBeTruthy();
  expect(serverResult.testSourceStringTargetObject1.key).toBe(1);
  expect(serverResult.testSourceStringTargetObject1.name).toBe('Abc');

  expect(serverResult.testSourceStringTargetObject2 instanceof TestConvertToClientObjectChildModel).toBeTruthy();
  expect(serverResult.testSourceStringTargetObject2.key).toBe(2);
  expect(serverResult.testSourceStringTargetObject2.name).toBe('Cde');
  expect(serverResult.testSourceStringTargetObject2.child instanceof TestConvertToClientObjectChildChildModel).toBeTruthy();
  expect(serverResult.testSourceStringTargetObject2.child.code).toBe('Code111');
  expect(dayjs.isDayjs(serverResult.testSourceStringTargetObject2.child.date)).toBeTruthy();

  expect(serverResult.testSourceStringTargetObject3 instanceof TestConvertToClientObjectChildModel).toBeTruthy();
  expect(serverResult.testSourceStringTargetObject3.key).toBe(1);
  expect(serverResult.testSourceStringTargetObject3.name).toBe('Abc');
  expect(serverResult.testSourceStringTargetObject3.items instanceof Array).toBeTruthy();
  expect(serverResult.testSourceStringTargetObject3.items.length).toBe(4);
  expect(serverResult.testSourceStringTargetObject3.items[0] instanceof TestConvertToClientObjectChildChildModel).toBeTruthy();
  expect(serverResult.testSourceStringTargetObject3.items[1] instanceof TestConvertToClientObjectChildChildModel).toBeTruthy();
  expect(serverResult.testSourceStringTargetObject3.items[2] instanceof TestConvertToClientObjectChildChildModel).toBeTruthy();
  expect(serverResult.testSourceStringTargetObject3.items[3] instanceof TestConvertToClientObjectChildChildModel).toBeTruthy();
}) 
