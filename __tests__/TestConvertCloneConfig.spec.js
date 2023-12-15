const { DataModel } = require('../dist');

class TestConvertCloneConfig extends DataModel {
  constructor() {
    super(TestConvertCloneConfig);
    this._convertPolicy = 'strict-required';
    this._convertTable = {
      requiredStringProp: { clientSide: 'string' },
    };
    this._afterSolveClient = (data) => {
      data.test = this.test + 1;
    }
  }

  test = 0;
  deepClone = [];
}

test('TestConvertCloneConfig', () => {

  const deepRefObject = { v: 0 };

  const sourceModel = new TestConvertCloneConfig();
  sourceModel.deepClone.push(deepRefObject)

  const clonedModelWithDeep = sourceModel.clone({
    deepClone: true,
  });
  const clonedModelNoConfig = sourceModel.clone({
    cloneConfig: false,
  });
  deepRefObject.v = 1;

  expect(clonedModelWithDeep.deepClone instanceof Array).toBeTruthy();
  expect(clonedModelWithDeep.deepClone.length).toBe(1);
  expect(clonedModelWithDeep.deepClone[0].v).toBe(0);
  expect(typeof clonedModelWithDeep._afterSolveClient).toBe('function');
  expect(typeof clonedModelNoConfig._afterSolveClient).toBe('function');
  expect(sourceModel._afterSolveClient === clonedModelNoConfig._afterSolveClient).toBeFalsy();
})