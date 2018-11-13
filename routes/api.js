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
      db.run('CREATE TABLE images (id integer primary key, uuid string, image BLOB, content_type string)');
    }
  });
});

// HACKME: この変数がrouter内から参照できない
const UUID_SEED = process.env.UUID_SEED;
const TOKEN = process.env.TOKEN;

router.get('/:uuid', function(req, res) {
  const uuid = req.params.uuid;
  if(!uuid || uuid.length != 36) {
    return res.status(404).json({ error: 'not found' });
  }

  return db.serialize(() => {
    // データを取得して表示
    db.get('SELECT * FROM images WHERE uuid = $uuid', { $uuid: uuid }, (err, row) => {
      if(row && row.image) {
        res.send(row.image);
      } else {
        return res.status(404).json({ error: 'not found' });
      }
    });
  });
});

router.put('/', function(req, res, next) {
  if(!req.headers['x-api-token'] || req.headers['x-api-token'] != process.env.TOKEN){
    return res.status(404).json({ error: 'not found!' });
  }

  if(!req.body.image) {
    return res.status(404).json({ error: 'not found!!' });
  }

  const fileData = req.body.image;
  const decodedFile = new Buffer(fileData.replace(/^data:\w+\/\w+;base64,/, ''), 'base64');
  const contentType = fileData.toString().slice(fileData.indexOf(':') + 1, fileData.indexOf(';'));

  new Promise(resolve => {
    db.get('select count(1) as count from images', {}, (err, row) => {
      resolve(row.count);
    });
  }).then(function(count) {
    db.serialize(() => {
      var imagePath = uuid(String(++count), process.env.UUID_SEED);

      // データをDBに保存
      const stmt = db.prepare('INSERT INTO images (id, uuid, image, content_type) VALUES (?, ?, ?, ?)');
      stmt.run(count, imagePath, decodedFile, contentType);
      stmt.finalize();

      res.json({ data: { image_path: imagePath } });
    });
  });
});

module.exports = router;
