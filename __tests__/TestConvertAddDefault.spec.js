const { DataModel, DataConverter, transformWithConverter } = require('../dist');

class TestConvertAddDefaultModel extends DataModel {
  constructor() {
    super();
    this._convertPolicy = 'strict-required';
    this._convertTable = {
      requiredStringProp: { 
        clientSide: 'string' 
      },
      addDefaultStringProp: [
        {
          clientSide: 'addDefaultValue',
          clientSideParam: {
            defaultValue: 'defaultString'
          },
          forceApply: true,
        },
        { 
          clientSide: 'string' 
        }
      ],
      addDefaultNumberProp: [
        {
          clientSide: 'addDefaultValue',
          clientSideParam: {
            defaultValue: 15
          },
          forceApply: true,
        },
        { 
          clientSide: 'number' 
        }
      ],
      addDefaultNumberAfterProp: [
        { 
          clientSide: 'number',
          clientSideRequired: false,
          forceApply: true,
        },
        {
          clientSide: 'addDefaultValue',
          clientSideParam: {
            defaultValue: 15
          },
        }
      ],
    };
  }

  requiredStringProp = undefined;
  addDefaultStringProp = undefined;
  requiredStringProp = undefined;
  addDefaultNumberAfterProp = undefined;
}

test('TestConvertToClientAddDefault', () => {

  const sourceJson = `{
    "requiredStringProp": "123"
  }`;

  const result1 = new TestConvertAddDefaultModel().fromServerSide(sourceJson);

  expect(result1.requiredStringProp).toBe('123');
  expect(result1.addDefaultStringProp).toBe('defaultString');
  expect(result1.addDefaultNumberProp).toBe(15);
  expect(result1.addDefaultNumberAfterProp).toBe(15);

  const sourceJson2 = `{
    "requiredStringProp": "123",
    "addDefaultNumberAfterProp": "1"
  }`;

  const result2 = new TestConvertAddDefaultModel().fromServerSide(sourceJson2);

  expect(result2.addDefaultNumberAfterProp).toBe(1);
  
  const sourceJson3 = `{
    "requiredStringProp": "123",
    "addDefaultNumberAfterProp": []
  }`;

  const result3 = new TestConvertAddDefaultModel().fromServerSide(sourceJson3);

  expect(result3.addDefaultNumberAfterProp).toBe(15);
}) 