const { DataModel } = require('../dist');

class TestConvertToClientArrayChildModel extends DataModel {
  constructor() {
    super();
    this._convertTable = {
      name: { clientSide: 'string' },
      key: { clientSide: 'string' },
    };
  }

  key = '';
  name = '';
}
class TestConvertToClientArrayModel extends DataModel {
  constructor() {
    super();
    this._convertTable = {
      testSourceNumberTargetArray: { clientSide: 'array' },
      testSourceObjectTargetArray: { clientSide: 'array' },
      testSourceBooleanTargetArray: { clientSide: 'array' },
      testSourceArrayTargetArray1: { clientSide: 'array' },
      testSourceArrayTargetArray2: { clientSide: 'array' },
      testSourceArrayTargetArray3: { clientSide: 'array' },
      testSourceArrayTargetArray4: { clientSide: 'array', clientSideChildDataModel: TestConvertToClientArrayChildModel },
      testSourceStringTargetArray1: { clientSide: 'array', clientSideChildDataModel: 'string' },
      testSourceStringTargetArray2: { clientSide: 'array' },
      testSourceStringTargetArray3: { clientSide: 'array' },
      testSourceStringTargetArray4: { clientSide: 'array', clientSideChildDataModel: TestConvertToClientArrayChildModel },
    };
  }
}

test('TestConvertToClientArray', () => {


  const sourceJson = `
  {
    "testSourceNumberTargetArray": 0,
    "testSourceObjectTargetArray": {},
    "testSourceBooleanTargetArray": false,
    "testSourceArrayTargetArray1": [ "a", "b" ],
    "testSourceArrayTargetArray2": [ 1, 2 ],
    "testSourceArrayTargetArray3": [ true, false ],
    "testSourceArrayTargetArray4": [
      { "key": 1, "name": "Abc" },
      { "key": 2, "name": "Def" },
      { "key": 3, "name": "Ghk" }
    ],
    "testSourceStringTargetArray1": "[ \\"a\\" ]",
    "testSourceStringTargetArray2": "[ 1, 2 ]",
    "testSourceStringTargetArray3": "[ true, false ]",
    "testSourceStringTargetArray4": "[{\\"key\\":1,\\"name\\":\\"Abc\\"},{\\"key\\":2,\\"name\\":\\"Def\\"},{\\"key\\":3,\\"name\\":\\"Ghk\\"}]"
  }
  `;

  const serverResult = new TestConvertToClientArrayModel().fromServerSide(JSON.parse(sourceJson));

  expect(serverResult.testSourceNumberTargetArray).toBe(undefined);
  expect(serverResult.testSourceObjectTargetArray).toBe(undefined);
  expect(serverResult.testSourceBooleanTargetArray).toBe(undefined);
  
  expect(serverResult.testSourceArrayTargetArray1 instanceof Array).toBeTruthy();
  expect(serverResult.testSourceArrayTargetArray1.length).toBe(2);
  expect(serverResult.testSourceArrayTargetArray1[0]).toBe('a');
  expect(serverResult.testSourceArrayTargetArray1[1]).toBe('b');

  expect(serverResult.testSourceArrayTargetArray2 instanceof Array).toBeTruthy();
  expect(serverResult.testSourceArrayTargetArray2.length).toBe(2);
  expect(serverResult.testSourceArrayTargetArray2[0]).toBe(1);
  expect(serverResult.testSourceArrayTargetArray2[1]).toBe(2);

  expect(serverResult.testSourceArrayTargetArray3 instanceof Array).toBeTruthy();
  expect(serverResult.testSourceArrayTargetArray3.length).toBe(2);
  expect(serverResult.testSourceArrayTargetArray3[0]).toBe(true);
  expect(serverResult.testSourceArrayTargetArray3[1]).toBe(false);

  expect(serverResult.testSourceArrayTargetArray4 instanceof Array).toBeTruthy();
  expect(serverResult.testSourceArrayTargetArray4.length).toBe(3);
  expect(serverResult.testSourceArrayTargetArray4[0] instanceof TestConvertToClientArrayChildModel).toBeTruthy();
  expect(serverResult.testSourceArrayTargetArray4[1] instanceof TestConvertToClientArrayChildModel).toBeTruthy();
  expect(serverResult.testSourceArrayTargetArray4[2] instanceof TestConvertToClientArrayChildModel).toBeTruthy();
  expect(serverResult.testSourceArrayTargetArray4[2].name).toBe('Ghk');

  expect(serverResult.testSourceStringTargetArray1 instanceof Array).toBeTruthy();
  expect(serverResult.testSourceStringTargetArray1.length).toBe(1);
  expect(serverResult.testSourceStringTargetArray1[0]).toBe('a');

  expect(serverResult.testSourceStringTargetArray2 instanceof Array).toBeTruthy();
  expect(serverResult.testSourceStringTargetArray2[0]).toBe(1);
  expect(serverResult.testSourceStringTargetArray2[1]).toBe(2);

  expect(serverResult.testSourceStringTargetArray3 instanceof Array).toBeTruthy();
  expect(serverResult.testSourceStringTargetArray3.length).toBe(2);
  expect(serverResult.testSourceStringTargetArray3[0]).toBe(true);
  expect(serverResult.testSourceStringTargetArray3[1]).toBe(false);

  expect(serverResult.testSourceStringTargetArray4 instanceof Array).toBeTruthy();
  expect(serverResult.testSourceStringTargetArray4.length).toBe(3);
  expect(serverResult.testSourceStringTargetArray4[0] instanceof TestConvertToClientArrayChildModel).toBeTruthy();
  expect(serverResult.testSourceStringTargetArray4[1] instanceof TestConvertToClientArrayChildModel).toBeTruthy();
  expect(serverResult.testSourceStringTargetArray4[2] instanceof TestConvertToClientArrayChildModel).toBeTruthy();
  expect(serverResult.testSourceStringTargetArray4[2].name).toBe('Ghk');
}) 
