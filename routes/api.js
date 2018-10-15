var express = require('express');
var router = express.Router();
const sqlite3 = require('sqlite3').verbose();
// FIXME: 別ファイルに分ける
// https://kuroeveryday.blogspot.com/2016/05/nodejs-sqlite3.html
const db = new sqlite3.Database('db.sqlite3');
// FIXME: 上記のモジュールに含める
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
      db.run('CREATE TABLE images (id integer primary key, image BLOB)');
    }
  });
});

// FIXME: 認証コードチェックの処理を付与する
router.put('/', function(req, res, next) {
  // FIXME: token名をコンフィグに宣言する
  if(!req.headers['x-api-token'] || req.headers['x-api-token'] != 'test'){
    res.status(404)        // HTTP status 404: NotFound
    .send('Not found!');
    return;
  }

  new Promise(resolve => {
    db.serialize(() => {
      // データをDBに保存
      const stmt = db.prepare('INSERT INTO images (id, image) VALUES ((select count(*) from images) + 1, ?)');
      stmt.run(req.body.image);
      stmt.finalize();

      resolve();
    });
  }).then(function (value) {
    res.send({ data: 'ok' });
  })
});

router.get('/:id', function(req, res, next) {
  // データを取得して表示
  db.get('SELECT * FROM images WHERE id = $id', { $id: req.params.id }, (err, row) => {
    res.send(`<img src="${row.image}">`);
  });
});

module.exports = router;
