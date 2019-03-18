const chai = require('chai');
const assert = chai.assert;
const SqlClass = require('../sqlClass/sql-class');
const sqlite = require('sqlite3');


describe('# 測試sql-class建構子及類別成員', () => {
  const columns = {
    id: { type: 'INTEGER', ai: true, pk: true },
    name: { type: 'TEXT', nn: true }
  }

  const tableName = 'testTable';
  let sqlClass;

  before(() => {
    sqlClass = new SqlClass(':memory:', tableName, columns);
  })

  it('測試建構子', () => {
    assert.equal(sqlClass.tableName, tableName);
    assert.equal(sqlClass.columns, columns);
    assert.equal(typeof sqlClass.db, 'object')
  })

  it('嘗試修改類別成員db內容(通過代表不能修改)', () => {
    const db = sqlClass.db;
    sqlClass.db = Math.random() * 100;
    assert.equal(sqlClass.db, db);
  })

  it('嘗試修改類別成員tablename內容(通過代表不能修改)', () => {
    const tableName = sqlClass.tableName;
    sqlClass.tableName = Math.random() * 100;
    assert.equal(sqlClass.tableName, tableName);
  })

  it('嘗試修改類別成員columns內容(通過代表不能修改)', () => {
    const columns = sqlClass.columns;
    sqlClass.columns = Math.random() * 100;
    assert.equal(sqlClass.columns, columns);
  })
})

describe('# 測試sql-class資料表預設值功能', () => {
  const tableName = 'newTable';
  let sqlClass;
  const randomNum = Math.floor(Math.random() * 100);
  const randomProd = Math.floor(Math.random() * 10);
  const testTime = new Date();
  const timestamp = Math.floor(testTime / 1000);
  const defaultStr = "helloWrold";
  const columns = {
    id: { type: 'INTEGER', ai: true, pk: true },
    default_num: { type: 'INTEGER', defaultValue: randomNum },
    default_fn: { type: 'INTEGER', defaultValue: () => randomNum * randomProd },
    default_text: { type: 'TEXT', defaultValue: defaultStr },
    default_time_fn: { type: 'DATETIME', defaultValue: () => Math.floor(testTime / 1000) }
  };
  before(() => {
    sqlClass = new SqlClass(':memory:', tableName, columns);
  })

  it('測試所有預設值功能(包含數值、字串、函式表達式)', async () => {
    let res;
    try {
      await sqlClass.add({ id: 1 });
      res = await sqlClass.findOne({ id: 1 });
      assert.equal(res.default_fn, randomNum * randomProd);
      assert.equal(res.default_text, defaultStr);
      assert.equal(res.default_num, randomNum)
      assert.equal(res.default_time_fn, timestamp)
    }
    catch (err) {
      assert.throw(err => err, 'some thing wrong')
    }
  })
})
