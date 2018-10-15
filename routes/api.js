var express = require('express');
var router = express.Router();
const uuid = require('uuid/v5');
const sqlite3 = require('sqlite3').verbose();
// FIXME: 別ファイルに分ける
// https://kuroeveryday.blogspot.com/2016/05/nodejs-sqlite3.html
const db = new sqlite3.Database('db/db.sqlite3');
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
      db.run('CREATE TABLE images (id integer primary key, uuid string, image BLOB)');
    }
  });
});

const UUID_SEED = process.env.UUID_SEED;
const TOKEN = process.env.TOKEN;

router.get('/:uuid', function(req, res) {
  db.serialize(() => {
    // データを取得して表示
    db.get('SELECT * FROM images WHERE uuid = $uuid', { $uuid: req.params.uuid }, (err, row) => {
      if(row) {
        res.send(row.image);
      } else {
        return res.status(404).json({ error: 'not found' });
      }
    });
  });
});

router.put('/', function(req, res, next) {
  if(!req.headers['x-api-token'] || req.headers['x-api-token'] != process.env.TOKEN){
    return res.status(404).json({ error: 'not found' });
  }

  new Promise(resolve => {
    // データを取得して表示
    db.get('select count(1) as count from images', {}, (err, row) => {
      resolve(row.count);
    });
  }).then(function(count) {
    db.serialize(() => {
      var imagePath = uuid(String(++count), UUID_SEED);

      // データをDBに保存
      const stmt = db.prepare('INSERT INTO images (id, uuid, image) VALUES (?, ?, ?)');
      stmt.run(count, imagePath, req.body.image);
      stmt.finalize();

      res.json({ data: { image_path: imagePath } });
    });
  });
});

module.exports = router;
