const { DataModel } = require('../dist');

class TestConvertToClientNumberModel extends DataModel {
  constructor() {
    super();
    this._convertTable = {
      testSourceStringTargetNumber1: { clientSide: 'number' },
      testSourceStringTargetNumber2: { clientSide: 'number' },
      testSourceStringTargetNumber3: { clientSide: 'number' },
      testSourceStringTargetNumber4: { clientSide: 'number' },
      testSourceStringTargetNumber5: { clientSide: 'number' },
      testSourceStringTargetNumber6: { clientSide: 'number' },
      testSourceStringTargetNumber7: { clientSide: 'number' },
      testSourceStringTargetNumber8: { clientSide: 'number' },
      testSourceStringTargetNumber9: { clientSide: 'number' },
      testSourceStringTargetNumber10: { clientSide: 'number' },
      testSourceNumberTargetNumber1: { clientSide: 'number' },
      testSourceNumberTargetNumber2: { clientSide: 'number' },
      testSourceNumberTargetNumber3: { clientSide: 'number' },
      testSourceNumberTargetNumber4: { clientSide: 'number' },
      testSourceNumberTargetNumber5: { clientSide: 'number' },
      testSourceNumberTargetNumber6: { clientSide: 'number' },
      testSourceBooleanTargetNumber1: { clientSide: 'number' },
      testSourceBooleanTargetNumber2: { clientSide: 'number' },
    };
  }
}

test('TestConvertToClientNumber', () => {

  const sourceJson = `
  {
    "testSourceStringTargetNumber1": "0",
    "testSourceStringTargetNumber2": "-",
    "testSourceStringTargetNumber3": "1",
    "testSourceStringTargetNumber4": "298---343242",
    "testSourceStringTargetNumber5": "+456",
    "testSourceStringTargetNumber6": "aaa",
    "testSourceStringTargetNumber7": "",
    "testSourceStringTargetNumber8": "10000000000000000000000000",
    "testSourceStringTargetNumber9": "1.00000001",
    "testSourceStringTargetNumber10": "1.000007.001",
    "testSourceNumberTargetNumber1": 0,
    "testSourceNumberTargetNumber2": -123,
    "testSourceNumberTargetNumber3": 8881,
    "testSourceNumberTargetNumber4": 0.0000000000001,
    "testSourceNumberTargetNumber5": 10000000000000000000000000,
    "testSourceNumberTargetNumber6": 1.00000001,
    "testSourceBooleanTargetNumber1": true,
    "testSourceBooleanTargetNumber2": false
  }
  `;

  const serverResult = new TestConvertToClientNumberModel().fromServerSide(JSON.parse(sourceJson));

  expect(serverResult.testSourceStringTargetNumber1).toBe(0);
  expect(serverResult.testSourceStringTargetNumber2).toBe(undefined);
  expect(serverResult.testSourceStringTargetNumber3).toBe(1);
  expect(serverResult.testSourceStringTargetNumber4).toBe(298);
  expect(serverResult.testSourceStringTargetNumber5).toBe(456);
  expect(serverResult.testSourceStringTargetNumber6).toBe(undefined);
  expect(serverResult.testSourceStringTargetNumber7).toBe(undefined);
  expect(serverResult.testSourceStringTargetNumber8).toBe(10000000000000000000000000);
  expect(serverResult.testSourceStringTargetNumber9).toBe(1.00000001);
  expect(serverResult.testSourceStringTargetNumber10).toBe(1.000007);
  expect(serverResult.testSourceNumberTargetNumber1).toBe(0);
  expect(serverResult.testSourceNumberTargetNumber2).toBe(-123);
  expect(serverResult.testSourceNumberTargetNumber3).toBe(8881);
  expect(serverResult.testSourceNumberTargetNumber4).toBe(0.0000000000001);
  expect(serverResult.testSourceNumberTargetNumber5).toBe(10000000000000000000000000);
  expect(serverResult.testSourceNumberTargetNumber6).toBe(1.00000001);
  expect(serverResult.testSourceBooleanTargetNumber1).toBe(undefined);
  expect(serverResult.testSourceBooleanTargetNumber2).toBe(undefined);
}) 