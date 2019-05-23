const sqlite3 = require('sqlite3').verbose();

const dbName = 'db/datas/' + process.env.NODE_ENV + '.sqlite3';
const db = new sqlite3.Database(dbName);

// 初期化
db.serialize(function () {
  var create = new Promise(function (resolve, reject) {
    db.get('select count(*) from sqlite_master where type="table" and name=$name',{ $name: 'images' }, function (err, res) {
      var exists = false;
      if (0 < res['count(*)']) { exists = true; }

      resolve(exists);
    });
  });

  create.then(function (exists) {
    if (!exists) {
      db.run('CREATE TABLE images (id integer primary key, uuid string, image BLOB, content_type string)');
    }
  });
});

console.info('Database name is ' + dbName);

module.exports = db;