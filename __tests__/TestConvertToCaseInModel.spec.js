const { DataModel, DataConverter, transformWithConverter } = require('../dist');

class TestConvertToCaseInModel extends DataModel {
  constructor() {
    super();
    this.setNameMapperCase('Camel', 'Snake');
  }

  mainBodyId = 0;
  modelId = 0;
  mainBodyColumnId = 0;
}
class TestConvertToCaseInModelRequiredCheck extends DataModel {
  constructor() {
    super();
    this.setNameMapperCase('Camel', 'Snake');
    this._convertTable = {
      mainBodyColumnId: {
        clientSide: 'number', serverSide: 'number', clientSideRequired: true, serverSideRequired: true
      }
    }
  }

  mainBodyId = 0;
  modelId = 0;
  mainBodyColumnId = 0;
}

test('TestConvertToCaseInModelToServer', () => {
  const model = new TestConvertToCaseInModel();
  model.mainBodyId = 1;
  model.modelId = 2;

  const server = model.toServerSide();

  expect(server.mainBodyId).toBe(undefined);
  expect(server.modelId).toBe(undefined);
  expect(server.mainBodyColumnId).toBe(undefined);
  expect(server.main_body_column_id).toBe(0);
  expect(server.main_body_id).toBe(1);
  expect(server.model_id).toBe(2);
}) 

test('TestConvertToCaseInModelToClient', () => {
  const model = new TestConvertToCaseInModel().fromServerSide(JSON.parse(`{
    "main_body_column_id": 0,
    "main_body_id": 1,
    "model_id": 2
  }`));

  expect(model.mainBodyId).toBe(1);
  expect(model.modelId).toBe(2);
  expect(model.mainBodyColumnId).toBe(0);
  expect(model.main_body_column_id).toBe(undefined);
  expect(model.main_body_id).toBe(undefined);
  expect(model.model_id).toBe(undefined);
}) 



test('TestConvertToCaseInModelRequiredCheck', () => {

  expect(new TestConvertToCaseInModelRequiredCheck().fromServerSide(JSON.parse(`{
    "main_body_column_id": 2
  }`)).mainBodyColumnId).toBe(2);
  expect(() => {
    new TestConvertToCaseInModelRequiredCheck().fromServerSide(JSON.parse(`{
      "mainBodyColumnId": 0
    }`));
  }).toThrow();
  
  expect(() => {
    const model = new TestConvertToCaseInModelRequiredCheck();
    model.mainBodyId = 1;
    model.mainBodyColumnId = undefined;
    model.toServerSide();
  }).toThrow();

  expect(() => {
    const model = new TestConvertToCaseInModelRequiredCheck();
    model.main_body_column_id = 1;
    model.mainBodyColumnId = undefined;
    model.toServerSide();
  }).toThrow();

  expect(() => {
    const model = new TestConvertToCaseInModelRequiredCheck();
    model.mainBodyColumnId = 1;
    model.toServerSide();
    return undefined;
  });

}) 