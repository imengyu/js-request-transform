const { DataModel, DataConverter } = require('../dist');

class TestConvertSetModel extends DataModel {
  constructor() {
    super();
    this._convertTable = {
      numberSet: {
        clientSide: 'set', 
        clientSideChildDataModel: 'number',
        serverSide: 'array', 
        serverSideChildDataModel: 'number',
      },
    };
  }

  numberSet = new Set();
}

test('TestConvertSetToClient', () => {

  const sourceJson = `
  {
    "numberSet": [ 3, 2, 3, 5, 5, 9, 10, 11, 11, 12]
  }
  `;

  const serverResult = new TestConvertSetModel().fromServerSide(JSON.parse(sourceJson));

  expect(serverResult.numberSet instanceof Set).toBeTruthy();
  expect(serverResult.numberSet.size).toBe(7);
}) 

test('TestConvertSetToSever', () => {

  const clientModel = new TestConvertSetModel();
  clientModel.numberSet.add(1);
  clientModel.numberSet.add(1);
  clientModel.numberSet.add(2);
  clientModel.numberSet.add(3);
  clientModel.numberSet.add(3);
  const serverData = clientModel.toServerSide();

  expect(serverData.numberSet instanceof Array).toBeTruthy();
  expect(serverData.numberSet[0]).toBe(1);
  expect(serverData.numberSet[1]).toBe(2);
  expect(serverData.numberSet[2]).toBe(3);
}) 
