const SqlClass = require('./sql-class');
const appRoot = require('app-root-path');
const dbpaht = `${appRoot}/mydb.db` || ':memory:';
class Model extends SqlClass {
  constructor(tablename, columns) {
    super(dbpaht, tablename, columns)
  }
}
module.exports = Model;

module.exports.INTERGER = 'INTEGER';

module.exports.TEXT = 'TEXT';

module.exports.DATETIME = 'DATETIME';

module.exports.BLOB = 'BLOB';

module.exports.REAL = 'REAL';
