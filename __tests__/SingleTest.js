const { DataModel, DataConverter } = require('../dist');


class TestConvertToClientErrorCatchUndefinedStringModel extends DataModel {
  constructor() {
    super();
    this._convertPolicy = 'strict-required';
    this._convertTable = {
      state: { 
        customToServerFn: (v) => {
          switch(v) {
            case 0: return '未支付';
            case 1: return '已支付';
            case 2: return '订单过期';
            case 3: return '订单关闭';
          }
          return '';
        },
      },
    };
    this._convertKeyType = (key, direction) => {
      //例如 open_state load_state 等等都将使用下面的转换
      if (key.endsWith('state')) {
        return {
          clientSide: 'boolean',
          serverState: 'number',
        };
      }
    }
  }

  requiredStringProp = '';
}

new TestConvertToClientErrorCatchUndefinedStringModel().fromServerSide(JSON.parse(`{}`));