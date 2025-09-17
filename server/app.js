var createError = require('http-errors');
var express = require('express');

var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var notesRouter = require('./routes/notes');

var app = express();

const cors = require('cors'); // 引入cors包

// 使用cors中间件，允许所有来源的请求（仅用于测试和演示）
app.use(cors({
  origin: 'https://memo86.netlify.app' // 例如：https://happy-torvalds.netlify.app
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// 配置静态文件服务后，前端可直接访问上传的图片
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json({ limit: '10Mb' }));
app.use(express.urlencoded({ limit: '10Mb', extended: true }));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/notes', notesRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
// 优先使用环境变量PORT，否则在本地开发时使用3000端口
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
