const dayjs = require('dayjs');
const { DataModel, DataConverter } = require('../dist');

DataConverter.configDayJsTimeZone('PRC');

class TestConvertToClientErrorCatchUndefinedStringModel extends DataModel {
  constructor() {
    super();
    this._convertPolicy = 'strict-required';
    this._convertTable = {
      requiredStringProp: { clientSide: 'string' },
    };
  }

  requiredStringProp = '';
}
class TestConvertToClientErrorCatchNullStringModel extends DataModel {
  constructor() {
    super();
    this._convertPolicy = 'strict-required';
    this._convertTable = {
      requiredStringProp: { clientSide: 'string' },
    };
  }

  requiredStringProp = '';
}
class TestConvertToClientErrorCatchSpeicalModel extends DataModel {
  constructor() {
    super();
    this._convertTable = {
      requiredStringInTableRequiredProp: { clientSide: 'string', clientSideRequired: true },
      requiredStringNotInTableRequiredProp: { clientSide: 'string' },
    };
  }

  requiredStringInTableRequiredProp = '';
  requiredStringNotInTableRequiredProp = '';
}

class TestConvertToServerErrorCatchSpeicalModel extends DataModel {
  constructor() {
    super();
    this._convertTable = {
      requiredProp: { clientSide: 'string', serverSide: '', serverSideRequired: true },
    };
  }

  requiredProp = null;
}


test('TestConvertToClientErrorCatch', () => {

  const sourceJson = `{}`;

  expect(() => {
    new TestConvertToClientErrorCatchUndefinedStringModel().fromServerSide(JSON.parse(sourceJson));
  }).toThrow();
  expect(() => {
    new TestConvertToClientErrorCatchNullStringModel().fromServerSide(JSON.parse(sourceJson));
  }).toThrow();
  expect(() => {
    new TestConvertToClientErrorCatchSpeicalModel().fromServerSide(JSON.parse(sourceJson));
  }).toThrow();
}) 
test('TestConvertToServerErrorCatch', () => {

  const model = new TestConvertToServerErrorCatchSpeicalModel();

  expect(() => {
    model.toServerSide();
  }).toThrow();
}) 