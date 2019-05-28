var express = require('express');
var router = express.Router();
const uuid = require('uuid/v5');
const db = require('../lib/database.js');

// HACKME: この変数がrouter内から参照できない
const UUID_SEED = process.env.UUID_SEED;
const TOKEN = process.env.TOKEN;

router.get('/:uuid', function(req, res) {
  const uuid = req.params.uuid;
  if(!uuid || uuid.length != 36) {
    return res.status(400).json({ error: 'Valid uudi format!' });
  }

  return db.serialize(() => {
    // データを取得して表示
    db.get('SELECT * FROM images WHERE uuid = $uuid', { $uuid: uuid }, (err, row) => {
      if(row && row.image) {
        res.send(row.image);
      } else {
        return res.status(404).json({ error: 'Can not find image!' });
      }
    });
  });
});

router.put('/', function(req, res, next) {
  if(!req.headers['x-api-token'] || req.headers['x-api-token'] != process.env.TOKEN){
    return res.status(403).json({ error: 'Valid token!' });
  }

  if(!req.body.image) {
    return res.status(400).json({ error: 'Valid body!' });
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

router.delete('/:uuid', function(req, res) {
  // HACKME: common化
  if(!req.headers['x-api-token'] || req.headers['x-api-token'] != process.env.TOKEN){
    return res.status(403).json({ error: 'Valid token!' });
  }

  const uuid = req.params.uuid;
  if(!uuid || uuid.length != 36) {
    return res.status(400).json({ error: 'Valid uudi format!' });
  }

  new Promise(resolve => {
    db.get('select count(1) as count from images where uuid = ?', uuid, (err, row) => {
      resolve(row.count);
    });
  }).then(function(count) {
    if(count == 0) {
      return res.status(404).json({ error: 'Can not find image!' });
    }

    db.serialize(() => {
      db.run('DELETE FROM images WHERE uuid = ?', uuid, function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ data: { delete_rows: this.changes } });
      });
    });
  });
});

module.exports = router;
