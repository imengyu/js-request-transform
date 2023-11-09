const { DataModel, DataConverter } = require('../dist');

class TestMulitConvertModel extends DataModel {
  constructor() {
    super();
    this._convertTable = {
      valueWithMultipy: [
        {
          clientSide: 'number',
          serverSide: 'number',
        },
        {
          clientSide: 'multiple',
          clientSideParam: {
            type: 'divide',
            multiple: 100,
          },
          serverSide: 'multiple',
          serverSideParam: {
            type: 'multiply',
            multiple: 100,
          },
        },
      ]
    };
  }
  eventType = 0;
}

test('TestMulitConvert', () => {
  const sourceJson = `
  {
    "valueWithMultipy": "150"
  }
  `;

  const serverResult = new TestMulitConvertModel().fromServerSide(JSON.parse(sourceJson));

  expect(serverResult.valueWithMultipy).toBe(1.5);

  let toServerJson = serverResult.toServerSide();

  expect(toServerJson.valueWithMultipy).toBe(150);
}) 
