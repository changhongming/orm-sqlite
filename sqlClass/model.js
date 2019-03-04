const SqlClass = require('./sql-class');
const dbpaht = `${__dirname}/mydb.db` || ':memory:';
class Model extends SqlClass {
  constructor(tablename, columns) {
    super(dbpaht, tablename, columns)
  }
}
module.exports = Model;
