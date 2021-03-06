"use strict"

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var apiRouter = require('./routes/api');

require('dotenv').config();
const uuidv5 = require('uuid/v5');

var app = express();

// 画面は使用しない
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// サンプル用の画面は、ローカル環境でしか動作させない
if(process.env.NODE_ENV == 'development'){
  app.use(express.static(path.join(__dirname, 'public')));
}

// リクエストのbodyをjsonに変換する
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true
}));
app.use(bodyParser.json({
  limit: '50mb'
}));

if(process.env.NODE_ENV == 'development'){
  app.use('/', indexRouter);
}
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404).json({ error: 'not found' });
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500).json({ error: 'something is wrong' });
});

module.exports = app;
