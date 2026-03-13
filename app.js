var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// Khởi tạo in-memory database (không cần MongoDB)
let db = require('./utils/db');
// Khởi tạo RS256 key pair
let keys = require('./utils/keys');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//domain:port/api/v1/products
//domain:port/api/v1/users
//domain:port/api/v1/categories
//domain:port/api/v1/roles

console.log('In-memory database initialized (data will reset on restart)');

app.use('/', require('./routes/index'));
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/roles', require('./routes/roles'));
app.use('/api/v1/products', require('./routes/products'))
app.use('/api/v1/categories', require('./routes/categories'))
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({ message: "API endpoint not found" });
  }
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  if (req.originalUrl.startsWith('/api/')) {
    return res.status(err.status || 500).json({ message: err.message, error: res.locals.error });
  }

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
