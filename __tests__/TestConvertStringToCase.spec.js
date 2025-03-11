const { DataStringUtils } = require('../dist');

test('TestCovertStringToCase', () => {

  expect(DataStringUtils.covertStringToCase('Camel', 'main_body_column_id')).toBe('mainBodyColumnId');
  expect(DataStringUtils.covertStringToCase('Camel', 'Main_body_column_id')).toBe('mainBodyColumnId');
  expect(DataStringUtils.covertStringToCase('Camel', 'Main-bodyColumn-Id')).toBe('mainBodyColumnId');

  expect(DataStringUtils.covertStringToCase('Pascal', 'main_body_column_id')).toBe('MainBodyColumnId');
  expect(DataStringUtils.covertStringToCase('Pascal', 'Main_body_column_id')).toBe('MainBodyColumnId');
  expect(DataStringUtils.covertStringToCase('Pascal', 'Main-bodyColumn_Id')).toBe('MainBodyColumnId');

  expect(DataStringUtils.covertStringToCase('Snake', 'main_body_column_id')).toBe('main_body_column_id');
  expect(DataStringUtils.covertStringToCase('Snake', 'MainBodyColumnId')).toBe('main_body_column_id');
  expect(DataStringUtils.covertStringToCase('Snake', 'Main-bodyColumn_Id')).toBe('main_body_column_id');
  expect(DataStringUtils.covertStringToCase('Snake', 'Main--bodyColumn_Id')).toBe('main_body_column_id');
  expect(DataStringUtils.covertStringToCase('Snake', 'Main--bodyColumn_Id')).toBe('main_body_column_id');

  expect(DataStringUtils.covertStringToCase('Midline', 'main_body_column_id')).toBe('main-body-column-id');
  expect(DataStringUtils.covertStringToCase('Midline', 'MainBodyColumnId')).toBe('main-body-column-id');
  expect(DataStringUtils.covertStringToCase('Midline', 'Main-bodyColumn_Id')).toBe('main-body-column-id');
  expect(DataStringUtils.covertStringToCase('Midline', 'Main-bodyColumn__Id')).toBe('main-body-column-id');
}) 
