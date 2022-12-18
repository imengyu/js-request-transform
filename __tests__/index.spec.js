const { DataModel } = require('../dist');

class TestConvertToClientStringModel extends DataModel {
  constructor() {
    super();
    this._convertTable = {
      testSourceStringTargetString1: { clientSide: 'string' },
      testSourceStringTargetString2: { clientSide: 'string' },
      testSourceStringTargetNumber1: { clientSide: 'number' },
      testSourceStringTargetNumber2: { clientSide: 'number' },
      testSourceStringTargetNumber3: { clientSide: 'number' },
      testSourceStringTargetNumber4: { clientSide: 'number' },
      testSourceStringTargetNumber5: { clientSide: 'number' },
      testSourceStringTargetNumber6: { clientSide: 'number' },
      testSourceStringTargetBoolean1: { clientSide: 'boolean' },
      testSourceStringTargetBoolean2: { clientSide: 'boolean' },
      testSourceStringTargetBoolean3: { clientSide: 'boolean' },
      testSourceStringTargetBoolean4: { clientSide: 'boolean' },
      testSourceStringTargetBoolean5: { clientSide: 'boolean' },
      testSourceStringTargetDate1: { clientSide: 'date' },
      testSourceStringTargetDate2: { clientSide: 'date' },
      testSourceStringTargetDate3: { clientSide: 'date' },
      testSourceStringTargetDate4: { clientSide: 'date' },
      testSourceStringTargetDayjs1: { clientSide: 'dayjs' },
      testSourceStringTargetDayjs2: { clientSide: 'dayjs' },
      testSourceStringTargetDayjs3: { clientSide: 'dayjs' },
      testSourceStringTargetDayjs4: { clientSide: 'dayjs' },
      testSourceStringTargetArray: { clientSide: 'array' },
    };
  }
}

test('TestConvertToClientString', () => {

  const sourceJson = `
  {
    "testSourceStringTargetString1": "",
    "testSourceStringTargetString2": "abcdefg",
    "testSourceStringTargetNumber1": "0",
    "testSourceStringTargetNumber2": "-",
    "testSourceStringTargetNumber3": "1",
    "testSourceStringTargetNumber4": "298---343242",
    "testSourceStringTargetNumber5": "+456",
    "testSourceStringTargetNumber6": "aaa",
    "testSourceStringTargetBoolean1": "true",
    "testSourceStringTargetBoolean2": "false",
    "testSourceStringTargetBoolean3": "1",
    "testSourceStringTargetBoolean4": "0",
    "testSourceStringTargetBoolean5": "",
    "testSourceStringTargetDate1": "2020-12-18",
    "testSourceStringTargetDate2": "2020-12-18 12:00:00",
    "testSourceStringTargetDate3": "2022-12-18T12:00:00.000Z",
    "testSourceStringTargetDate4": "a1",
    "testSourceStringTargetDayjs1": "2020-12-18",
    "testSourceStringTargetDayjs2": "2020-12-18 12:00:00",
    "testSourceStringTargetDayjs3": "2022-12-18T12:00:00.000Z",
    "testSourceStringTargetDayjs4": "a2",
    "testSourceStringTargetArray": "[ 'a' ]"
  }
  `;

  const serverResult = new TestConvertToClientStringModel().fromServerSide(JSON.parse(sourceJson));

  const dateDay = new Date(1608249600000);
  const dateFull = new Date(1671336000000);

  expect(serverResult.testSourceStringTargetString1).toBe('');
  expect(serverResult.testSourceStringTargetString2).toBe('abcdefg');
  expect(serverResult.testSourceStringTargetNumber1).toBe(0);
  expect(serverResult.testSourceStringTargetNumber2).toBe(undefined);
  expect(serverResult.testSourceStringTargetNumber3).toBe(1);
  expect(serverResult.testSourceStringTargetNumber4).toBe(298);
  expect(serverResult.testSourceStringTargetNumber5).toBe(456);
  expect(serverResult.testSourceStringTargetNumber6).toBe(undefined);
  expect(serverResult.testSourceStringTargetBoolean1).toBe(true);
  expect(serverResult.testSourceStringTargetBoolean2).toBe(false);
  expect(serverResult.testSourceStringTargetBoolean3).toBe(true);
  expect(serverResult.testSourceStringTargetBoolean4).toBe(false);
  expect(serverResult.testSourceStringTargetBoolean5).toBe(false);
  expect(serverResult.testSourceStringTargetDate1).toBe(dateDay);
  expect(serverResult.testSourceStringTargetDate2).toBe(dateFull);
  expect(serverResult.testSourceStringTargetDate3).toBe(dateFull);
  expect(serverResult.testSourceStringTargetDate4).toBe(undefined);
  expect(serverResult.testSourceStringTargetDayjs1).toBe(dateDay);
  expect(serverResult.testSourceStringTargetDayjs2).toBe(dateFull);
  expect(serverResult.testSourceStringTargetDayjs3).toBe(dateFull);
  expect(serverResult.testSourceStringTargetDayjs4).toBe(undefined);
  expect(serverResult.testSourceStringTargetArray[0]).toBe('a');
}) 