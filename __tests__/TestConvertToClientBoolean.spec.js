const { DataModel } = require('../dist');

class TestConvertToClientBooleanModel extends DataModel {
  constructor() {
    super();
    this._convertTable = {
      testSourceStringTargetBoolean1: { clientSide: 'boolean' },
      testSourceStringTargetBoolean2: { clientSide: 'boolean' },
      testSourceStringTargetBoolean3: { clientSide: 'boolean' },
      testSourceStringTargetBoolean4: { clientSide: 'boolean' },
      testSourceStringTargetBoolean5: { clientSide: 'boolean' },
      testSourceStringTargetBoolean6: { clientSide: 'boolean' },
      testSourceStringTargetBoolean7: { clientSide: 'boolean' },
      testSourceStringTargetBoolean8: { clientSide: 'boolean' },
      testSourceStringTargetBoolean9: { clientSide: 'boolean' },
      testSourceStringTargetBoolean10: { clientSide: 'boolean' },
      testSourceStringTargetBoolean11: { clientSide: 'boolean' },
      testSourceStringTargetBoolean12: { clientSide: 'boolean' },
      testSourceStringTargetBoolean13: { clientSide: 'boolean' },
    };
  }
}

test('TestConvertToClientBoolean', () => {

  const sourceJson = `
  {
    "testSourceStringTargetBoolean1": true,
    "testSourceStringTargetBoolean2": false,
    "testSourceStringTargetBoolean3": "1",
    "testSourceStringTargetBoolean4": "0",
    "testSourceStringTargetBoolean5": "",
    "testSourceStringTargetBoolean6": "true",
    "testSourceStringTargetBoolean7": "false",
    "testSourceStringTargetBoolean8": "dzfx1112",
    "testSourceStringTargetBoolean9": 0,
    "testSourceStringTargetBoolean10": 1,
    "testSourceStringTargetBoolean11": 1000,
    "testSourceStringTargetBoolean12": -1000,
    "testSourceStringTargetBoolean13": "认"
  }
  `;

  const serverResult = new TestConvertToClientBooleanModel().fromServerSide(JSON.parse(sourceJson));

  expect(serverResult.testSourceStringTargetBoolean1).toBe(true);
  expect(serverResult.testSourceStringTargetBoolean2).toBe(false);
  expect(serverResult.testSourceStringTargetBoolean3).toBe(true);
  expect(serverResult.testSourceStringTargetBoolean4).toBe(false);
  expect(serverResult.testSourceStringTargetBoolean5).toBe(false);
  expect(serverResult.testSourceStringTargetBoolean6).toBe(true);
  expect(serverResult.testSourceStringTargetBoolean7).toBe(false);
  expect(serverResult.testSourceStringTargetBoolean8).toBe(false);
  expect(serverResult.testSourceStringTargetBoolean9).toBe(false);
  expect(serverResult.testSourceStringTargetBoolean10).toBe(true);
  expect(serverResult.testSourceStringTargetBoolean11).toBe(true);
  expect(serverResult.testSourceStringTargetBoolean12).toBe(false);
  expect(serverResult.testSourceStringTargetBoolean13).toBe(false);
}) 