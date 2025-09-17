var express = require('express');
var router = express.Router();
const connection = require('../db/sql');
const noteSql = require('../db/noteSql');
const multer = require('multer');
const path = require('path');

// 设置存储方式,指定上传文件的 存储目录
const storage = multer.diskStorage({
  // 将所有上传图片集中存储到 public/uploads 目录，便于管理和访问
  destination: function (req, file, cb) {
    // 第一个参数为错误信息（null表示无错误），第二个参数为存储路径,构建绝对路径，确保在不同操作系统下路径正确
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  // 防止同名文件覆盖，解决多用户同时上传时的文件名冲突问题
  filename: function (req, file, cb) {
    // 保证文件名唯一
    // 提取原文件的扩展名
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + ext);
  }
});
// 创建multer上传中间件，使用上述存储配置
const upload = multer({ storage: storage });

// 图片上传接口
// 中间件 ： upload.single('file') 表示接收名为 file 的单个文件
router.post('/uploadImg', upload.single('file'), function (req, res) {
  if (!req.file) {
    return res.status(400).json({ code: 400, msg: '没有文件上传' });
  }
  // 返回图片的访问路径
  const imgUrl = '/uploads/' + req.file.filename;
  res.json({ code: 200, msg: '上传成功', imgUrl });
});

router.post('/insertNote', function (req, res) {
  try {
    const { userId, title, content, createTime, imgUrl } = req.body;
    
    connection.query(noteSql.insertNote({ userId, title, content, createTime, img: imgUrl }), function (err, results) {
      if (err) {
        return res.status(500).json({ code: 500, msg: '添加失败' });
      }
      res.json({ code: 200, msg: '添加成功', imgUrl });
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/getAllNote', function (req, res) {
  try {
    const { userId } = req.body;
    connection.query(noteSql.getAllNote({ userId }), function (err, results) {
      if (err) {
        return res.status(500).json({ code: 500, msg: '查询失败' });
      }
      // console.log("results", req.body);
      res.json({
        code: 200,
        msg: '查询成功',
        data: results,
      });
    });
  } catch (err) {
    console.error("数据库错误:", err);  // 关键日志
    res.status(500).json({ message: err.message });
  }
});

router.post('/deleteNote', function (req, res) {
  try {
    // console.log("req", req.body);
    const { noteId,userId } = req.body;
    connection.query(noteSql.deleteNote({ noteId,userId }), function (err, results) {
      if (err) {
        return res.status(500).json({ code: 500, msg: '删除失败' });
      }
      res.json({
        code: 200,
        msg: '删除成功',
      });
    });
  } catch (err) {
    console.error("数据库错误:", err);  // 关键日志
    res.status(500).json({ message: err.message });
  }
});

router.post('/getEditNote', function (req, res) {
  try {
    console.log("req", req.body);
    const { noteId,userId } = req.body;
    connection.query(noteSql.getEditNote({ noteId,userId }), function (err, results) {
      if (err) {
        return res.status(500).json({ code: 500, msg: '查询失败' });
      }
      let note = results[0];
      res.json({
        code: 200,
        msg: '查询成功',
        data: note,
      });
    });
  } catch (err) {
    console.error("数据库错误:", err);  // 关键日志
    res.status(500).json({ message: err.message });
  }
});

router.post('/editNote', function (req, res) {
  try {
    console.log("req:", req.body);
    const { noteId,userId,title,content,updateTime,img } = req.body;
    let createTime=updateTime
    connection.query(noteSql.editNote({ noteId,userId,title,content,createTime,img }), function (err, results) {
      if (err) {
        return res.status(500).json({ code: 500, msg: '修改失败' });
      }
      res.json({
        code: 200,
        msg: '修改成功',
      });
    });
  } catch (err) {
    console.error("数据库错误:", err);  // 关键日志
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
