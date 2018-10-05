var express = require('express');
var router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db.sqlite3');

router.put('/', function(req, res, next) {
  new Promise(resolve => {
    db.serialize(() => {
      // データをDBに保存
      const stmt = db.prepare('INSERT INTO images (id, image) VALUES (?, ?)');
      stmt.run(req.body.id, req.body.image);
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
