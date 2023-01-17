const { DataModel, DataConverter } = require('../dist');

class TestConvertMappingModel extends DataModel {
  constructor() {
    super();
    this._convertTable = {
      vedioUrl: { clientSide: 'string', serverSide: 'string' },
    };
    this._nameMapperServer = {
      vedioUrl: 'videoUrl',
    };
    this._nameMapperClient = {
      videoUrl: 'vedioUrl',
    };
  }
  videoUrl = '';
}

test('TestConvertMappingToClient', () => {

  const sourceJson = `
  {
    "vedioUrl": "abc.com/aa.mp4"
  }
  `;

  const serverResult = new TestConvertMappingModel().fromServerSide(JSON.parse(sourceJson));

  expect(serverResult.videoUrl).toBe('abc.com/aa.mp4');
}) 

test('TestConvertMappingToSever', () => {

  const clientModel = new TestConvertMappingModel();
  clientModel.videoUrl = 'abc.com/aa.mp4';
  const serverData = clientModel.toServerSide();

  expect(serverData.videoUrl).toBe(undefined);
  expect(serverData.vedioUrl).toBe('abc.com/aa.mp4');
}) 
