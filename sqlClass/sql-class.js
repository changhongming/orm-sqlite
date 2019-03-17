const sqlite3 = require('sqlite3').verbose();
const Promise = require('bluebird');

class SqlClass {
  // 建構子(傳入資料庫目錄名稱)
  constructor(dbFilePath, tableName, columns) {
    if (tableName === undefined || columns === undefined)
      throw new Error('Please input table name and columns');

    this.db = new sqlite3.Database(dbFilePath, (err) => {
      if (err)
        throw new Error('Could not connect to database:', err);
    });

    this.columns = columns;
    this.tableName = tableName;

    // 鎖定成員防止覆寫(overwrite)
    Object.freeze(this.db);
    Object.freeze(this.columns);
    Object.freeze(this.tableName);

    this.db.serialize(() => {
      this.create().catch(err => { throw new Error('Create Table Error', err) });
    });
  }

  close() {
    this.db.close();
  }

  add(data) {
    if (typeof data !== 'object') return new Promise((resolve, reject) => { reject('Add data not a object') });
    let addColumns = '';
    let addData = '';
    // for(let key in data) {
    //   if(this.columns[key] !== undefined) {
    //     const val = data[key];
    //     addColumns += `\`${key}\`, `;
    //     addData += typeof val === 'number' ? `${val}, ` : `'${val}', `;
    //   }
    // }
    //const key = Object.keys(this.columns);
    Object.keys(this.columns).map(key => {
      if (data[key] !== undefined) {
        const val = data[key];
        addColumns += `\`${key}\`, `;
        addData += typeof val === 'number' ? `${val}, ` : `'${val}', `;
      }
      else if (typeof this.columns[key].defaultValue === 'function') {
        addColumns += `\`${key}\`, `;
        const val = this.columns[key].defaultValue();
        addData += typeof val === 'number' ? `${val}, ` : `'${val}', `;
      }
    })
    addColumns = addColumns.substring(0, addColumns.length - 2);
    addData = addData.substring(0, addData.length - 2);
    const sql = `INSERT INTO \`${this.tableName}\` (${addColumns}) VALUES (${addData})`;
    return this.run(sql);
  }

  delete(where) {
    if (typeof where !== 'object') return new Promise((resolve, reject) => { reject('Where data not a object') });
    let statement = '';
    for (let key in where) {
      if (this.columns[key] !== undefined && this.columns[key].pk) {
        statement += typeof where[key] === 'string' ? `${key} = \`${where[key]}\` AND ` : `${key} = ${where[key]} AND `
      }
    }
    statement = statement.substring(0, statement.length - 4);
    const sql = `DELETE FROM ${this.tableName} WHERE ${statement}`;
    return this.run(sql);
  }

  update(data, where) {
    if (typeof data !== 'object') return new Promise((resolve, reject) => { reject('Update data not a object') });
    if (typeof where !== 'object') return new Promise((resolve, reject) => { reject('Where data not a object') });
    let whereStatement = '';
    let dataStatement = '';
    for (let key in where) {
      if (this.columns[key] !== undefined && this.columns[key].pk) {
        whereStatement += typeof where[key] === 'string' ? `\`${key}\` = '${where[key]}' AND ` : `\`${key}\` = ${where[key]} AND `
      }
    }
    for (let key in data) {
      if (this.columns[key] !== undefined) {
        dataStatement += typeof data[key] === 'string' ? `\`${key}\` = '${data[key]}', ` : `\`${key}\` = ${data[key]}, `
      }
    }
    whereStatement = whereStatement.substring(0, whereStatement.length - 4);
    dataStatement = dataStatement.substring(0, dataStatement.length - 2);
    const sql = `UPDATE \`${this.tableName}\` SET ${dataStatement} WHERE ${whereStatement};`;
    return this.run(sql);
  }

  findOne(where) {
    if (typeof where !== 'object') return new Promise((resolve, reject) => { reject('Where data not a object') });
    let whereStatement = '';
    for (let key in where) {
      if (this.columns[key] !== undefined) {
        whereStatement += typeof where[key] === 'string' ? `\`${key}\` = '${where[key]}' AND ` : `\`${key}\` = ${where[key]} AND `
      }
    }
    whereStatement = whereStatement.substring(0, whereStatement.length - 4);
    const sql = `SELECT * FROM \`${this.tableName}\` WHERE ${whereStatement};`;
    return this.get(sql);
  }

  findAll() {
    const sql = `SELECT * FROM \`${this.tableName}\`;`;
    return this.all(sql);
  }

  save() {
    const sqlObj = [];
    let sql = `INSERT INTO \`${this.tableName}\` (`;
    let values = '(';
    for (let key in this.columns) {
      if (this[key]) {
        sqlObj.push(this[key]);
        delete this[key];
        sql += key + ', ';
        values += '?, '
      }
      else if (typeof this.columns[key].defaultValue === 'function') {
        sqlObj.push(this.columns[key].defaultValue())
        sql += key + ', ';
        values += '?, '
      }
    }
    values = values.substring(0, values.length - 2) + ')';
    sql = sql.substring(0, sql.length - 2) + ') VALUES ' + values;
    if (sqlObj.length === 0) {
      return Promise.reject({ error: 'no valid column add' });
    }
    return this.run(sql, sqlObj);
  }

  // 新增或修改使用run方法執行指令
  run(sql, params = []) {
    // promise特性改善js非同步特性的問題，可以在任務完成後自動調用回調函式(callback)，並且統一回調函式(callback)名稱，方便擴展與串接
    return new Promise((resolve, reject) => {
      // sqlite3 函式庫語法，請參閱 => https://github.com/mapbox/node-sqlite3/wiki/API#databaserunsql-param--callback
      this.db.run(sql, params, function (err) {
        if (err) {
          // ...為展開運算符(Spread Operator)，可以使陣列或物件展開常用於複製或串接，
          // 如果物件名稱(key)重複會覆蓋掉前面的物件值(value)。
          // 註：Object Spread Operator ES9後才支援，目前穩定版本nodejs可直接使用，如果前端js需要使用可能需要搭配babel降轉語法(請自行查看各家瀏覽器支援情況)
          const _err = { sql, ...err }
          // 在promise的catch emit 錯誤的訊息與指令
          reject(_err)
        } else {
          // 在promise的then emit 新增或修改的索引值
          resolve({ id: this.lastID, change: this.changes })
        }
      })
    })
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          const _err = { sql, ...err }
          reject(_err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, rows) => {
        if (err) {
          const _err = { sql, ...err }
          reject(_err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  create(tryExist = true) {
    let str = "";
    for (let key in this.columns) {
      const context = this.columns[key];
      str += `\`${key}\` ${context.type}`;
      if (context.pk)
        str += ' PRIMARY KEY';
      if (context.ai)
        str += ' AUTOINCREMENT';
      if (context.nn)
        str += ' NOT NULL';
      if (context.uq)
        str += ' UNIQUE';
      if (typeof context.defaultValue === 'string')
        str += ` DEFAULT \`${context.defaultValue}\``;
      else if (typeof context.defaultValue === 'number')
        str += ` DEFAULT ${context.defaultValue}`;
      str += ', ';
    }
    str = str.substring(0, str.length - 2);
    const sql = `CREATE TABLE ${tryExist ? 'IF NOT EXISTS' : ''} \`${this.tableName}\` (${str})`;
    return this.run(sql);
  }
}

module.exports = SqlClass;
