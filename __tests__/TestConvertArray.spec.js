const { DataModel, DataConverter } = require('../dist');

class TestConvertNoArrayModel extends DataModel {
  constructor() {
    super();
  }
}
class TestConvertArrayModel extends DataModel {
  constructor() {
    super();
    this.setArrayType(TestConvertArrayChildModel);
  }
}
class TestConvertArrayChildModel extends DataModel {
  constructor() {
    super();
    this._convertTable = {
      id: { clientSide: 'number', serverSide: 'number' },
      name: { clientSide: 'string', serverSide: 'string' },
    };
  }

}

test('TestConvertArrayToClient', () => {

  const sourceJson = `[
    { "id": 1, "name": "张三" },
    { "id": 2, "name": "李四" },
    { "id": 3, "name": "王五" },
    { "id": 4, "name": "于六" },
    { "id": 5, "name": "刘七" }
  ]`;

  const serverResult = new TestConvertArrayModel().fromServerSide(JSON.parse(sourceJson));

  expect(serverResult.isArray()).toBeTruthy();
  expect(serverResult.getArrayLength()).toBe(5);
  expect(serverResult.getArray() instanceof Array).toBeTruthy();
  expect(serverResult.getArrayItem(3).id).toBe(4);
  expect(serverResult.getArrayItem(3) instanceof TestConvertArrayChildModel).toBeTruthy();
  
  expect(() => {
    new TestConvertNoArrayModel().fromServerSide(JSON.parse(sourceJson));
  }).toThrow();
}) 

test('TestConvertArrayToSever', () => {

  const clientModel = new TestConvertArrayModel();
  clientModel.arrayAdd({id: '1', name: '张三' });
  clientModel.arrayAdd(new TestConvertArrayChildModel().fromServerSide({id: '2', name: '李四' }));
  clientModel.arrayAdd({id: 3, name: '王五' });
  clientModel.arrayAdd(new TestConvertArrayChildModel().fromServerSide({id: '4', name: '于六' }));
  clientModel.arrayAdd({id: '1', name: '张三' });

  expect(clientModel.getArrayLength()).toBe(5);

  clientModel.arrayDelete(4);
  expect(clientModel.getArrayLength()).toBe(4);

  const serverData = clientModel.toServerSide();

  expect(serverData instanceof Array).toBeTruthy();
  expect(serverData.length).toBe(4);
  expect(typeof serverData[0]).toBe("object");
  expect(typeof serverData[0].id).toBe("string");
  expect(typeof serverData[1].id).toBe("number");
  expect(serverData[0].name).toBe('张三');
  expect(serverData[3].name).toBe('于六');
}) 
