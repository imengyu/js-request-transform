const dayjs = require('dayjs');
const { DataModel, DataConverter } = require('../dist');

DataConverter.configDayJsTimeZone('PRC');

class TestConvertToClientDateModel extends DataModel {
  constructor() {
    super();
    this._convertTable = {
      testSourceStringTargetDate1: { clientSide: 'date' },
      testSourceStringTargetDate2: { clientSide: 'date' },
      testSourceStringTargetDate3: { clientSide: 'date' },
      testSourceStringTargetDate4: { clientSide: 'date' },
      testSourceStringTargetDayjs1: { clientSide: 'dayjs' },
      testSourceStringTargetDayjs2: { clientSide: 'dayjs' },
      testSourceStringTargetDayjs3: { clientSide: 'dayjs' },
      testSourceStringTargetDayjs4: { clientSide: 'dayjs' },
    };
  }
}

test('TestConvertToClientDate', () => {


  const sourceJson = `
  {
    "testSourceStringTargetDate1": "2022-12-18",
    "testSourceStringTargetDate2": "2022-12-18 12:00:00",
    "testSourceStringTargetDate3": "2022-12-18T12:00:00.000Z",
    "testSourceStringTargetDate4": "a1",
    "testSourceStringTargetDayjs1": "2022-12-18",
    "testSourceStringTargetDayjs2": "2022-12-18 12:00:00",
    "testSourceStringTargetDayjs3": "2022-12-18T12:00:00.000Z",
    "testSourceStringTargetDayjs4": "a2"
  }
  `;

  const serverResult = new TestConvertToClientDateModel().fromServerSide(JSON.parse(sourceJson));

  const dateTest1 = new Date("2022-12-18");
  const dateTest2 = new Date("2022-12-18 12:00:00");
  const dateTest3 = new Date("2022-12-18T12:00:00.000Z");

  expect(serverResult.testSourceStringTargetDate1.getTime()).toBe(dateTest1.getTime());
  expect(serverResult.testSourceStringTargetDate2.getTime()).toBe(dateTest2.getTime());
  expect(serverResult.testSourceStringTargetDate3.getTime()).toBe(dateTest3.getTime());
  expect(serverResult.testSourceStringTargetDate4).toBe(undefined);
  expect(serverResult.testSourceStringTargetDayjs1.format('YYYY-MM-DD')).toBe('2022-12-18');
  expect(serverResult.testSourceStringTargetDayjs2.format('YYYY-MM-DD HH:mm:ss')).toBe('2022-12-18 12:00:00');
  expect(serverResult.testSourceStringTargetDayjs3.tz('GMT').format('YYYY-MM-DD HH:mm:ss:SSS')).toBe('2022-12-18 12:00:00:000');
  expect(serverResult.testSourceStringTargetDayjs4.isValid()).toEqual(false);
}) 
