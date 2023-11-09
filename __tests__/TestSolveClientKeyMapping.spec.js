const { DataModel, DataConverter } = require('../dist');

class TestSolveClientKeyMappingModel extends DataModel {
  constructor() {
    super();
    this._convertTable = {
      eventType: {
        clientSide: 'number',
        serverSide: 'string',
      }
    };
    this._afterSolveClient = (data) => {
      if (data.eventType == "null")
        data.eventType = "0";
    };
    this.setNameMapper({
      'eType': 'eventType',
    });
  }
  eventType = 0;
}

test('TestSolveClientKeyMapping', () => {


  const sourceJson = `
  {
    "eType": "1"
  }
  `;

  const serverResult = new TestSolveClientKeyMappingModel().fromServerSide(JSON.parse(sourceJson));

  expect(serverResult.eType).toBe(undefined);
  expect(serverResult.eventType).toBe(1);

  let toServerJson = serverResult.toServerSide();

  expect(toServerJson.eType).toBe("1");
  expect(toServerJson.eventType).toBe(undefined);

  serverResult.eventType = null;
  toServerJson = serverResult.toServerSide();

  expect(toServerJson.eType).toBe("0");
}) 
