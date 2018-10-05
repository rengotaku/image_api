const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db.sqlite3');

module.exports = {
  put: (req, res) => {
console.log("test");
    db.serialize(() => {
      // データをDBに保存
      const stmt = db.prepare('INSERT INTO images (id, image) VALUES (?, ?)');
      stmt.run(req.body.id, req.body.image);
      stmt.finalize();
    });
  },
  get: (req, res) => {
    db.serialize(() => {
      // データを取得して表示
      db.get('SELECT * FROM images WHERE id = $id', { $id: req.params.id }, (err, row) => {
        res.send(`<img src="${row.image}">`);
      });
    });
  }
}