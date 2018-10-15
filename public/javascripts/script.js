"use strict"

const submit = document.getElementById('submit');

// input[type=file]からbase64のデータを取得
const file = document.getElementById('inputFile');

file.addEventListener('change', function fileChange(ev) {
  var target = ev.target;
  var file = target.files[0];
  var type = file.type;
  var size = file.size;

  // if ( type !== 'image/jpeg' ) {
  //   alert('選択できるファイルはJPEG画像だけです。');
  //   inputFile.value = '';
  //   return;
  // }
}, false);

submit.addEventListener('click', () => {
  const id = document.getElementById('inputId').value;

  // const fileList = file.files;
  const reader = new FileReader();
  reader.addEventListener('load', () => {
    superagent
      .put('/api')
      // FIXME: 適宜変更する
      .set('x-api-token', 'test2')
      // reader.resultはbase64形式の画像データ
      .send({ id, image: reader.result })
      .end((err, res) => {
        console.log('Finished!');
      });
  });

  reader.readAsDataURL(file.files[0]);
});