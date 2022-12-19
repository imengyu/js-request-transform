const dayjs = require('dayjs');
const { DataModel, DataConverter } = require('../dist');

DataConverter.configDayJsTimeZone('PRC');

class TestConvertToClientStringModel extends DataModel {
  constructor() {
    super();
    this._convertTable = {
      testSourceStringTargetString1: { clientSide: 'string' },
      testSourceStringTargetString2: { clientSide: 'string' },
      testSourceNumberTargetString1: { clientSide: 'string' },
      testSourceNumberTargetString2: { clientSide: 'string' },
      testSourceNumberTargetString3: { clientSide: 'string' },
      testSourceNumberTargetString4: { clientSide: 'string' },
      testSourceNumberTargetString5: { clientSide: 'string' },
      testSourceBooleanTargetString1: { clientSide: 'string' },
      testSourceBooleanTargetString2: { clientSide: 'string' },
      testSourceArrayTargetString1: { clientSide: 'string' },
      testSourceArrayTargetString2: { clientSide: 'string' },
      testSourceArrayTargetString3: { clientSide: 'string' },
      testSourceArrayTargetString4: { clientSide: 'string' },
      testSourceObjectTargetString1: { clientSide: 'string' },
      testSourceObjectTargetString1: { clientSide: 'string' },
      testSourceObjectTargetString1: { clientSide: 'string' },
      testSourceObjectTargetString1: { clientSide: 'string' },
    };
  }
}

test('TestConvertToClientString', () => {


  const sourceJson = `
  {
    "testSourceStringTargetString1": "",
    "testSourceStringTargetString2": "abcdefg",
    "testSourceNumberTargetString1": 0,
    "testSourceNumberTargetString2": 1,
    "testSourceNumberTargetString3": -15,
    "testSourceNumberTargetString4": 100000000000000000000000,
    "testSourceNumberTargetString5": 0.0000000012,
    "testSourceBooleanTargetString1": true,
    "testSourceBooleanTargetString2": false,
    "testSourceArrayTargetString1": [ "a", "b" ],
    "testSourceArrayTargetString2": [ 1, 2 ],
    "testSourceArrayTargetString3": [ true, false ],
    "testSourceArrayTargetString4": [
      { "key": 1, "name": "Abc" },
      { "key": 2, "name": "Def" },
      { "key": 3, "name": "Ghk" }
    ],
    "testSourceObjectTargetString1": { "key": "123" }
  }
  `;

  const serverResult = new TestConvertToClientStringModel().fromServerSide(JSON.parse(sourceJson));

  expect(serverResult.testSourceStringTargetString1).toBe('');
  expect(serverResult.testSourceStringTargetString2).toBe('abcdefg');
  expect(serverResult.testSourceNumberTargetString1).toBe('0');
  expect(serverResult.testSourceNumberTargetString2).toBe('1');
  expect(serverResult.testSourceNumberTargetString3).toBe('-15');
  expect(serverResult.testSourceNumberTargetString4).toBe('100000000000000000000000');
  expect(serverResult.testSourceNumberTargetString5).toBe('0.0000000012');
  expect(serverResult.testSourceBooleanTargetString1).toBe('true');
  expect(serverResult.testSourceBooleanTargetString2).toBe('false');
  expect(serverResult.testSourceArrayTargetString1).toBe('["a","b"]');
  expect(serverResult.testSourceArrayTargetString2).toBe('[1,2]');
  expect(serverResult.testSourceArrayTargetString3).toBe('[true,false]');
  expect(serverResult.testSourceArrayTargetString4).toBe('[{"key":1,"name":"Abc"},{"key":2,"name":"Def"},{"key":3,"name":"Ghk"}]');
  expect(serverResult.testSourceObjectTargetString1).toBe('{"key":"123"}');
}) 
