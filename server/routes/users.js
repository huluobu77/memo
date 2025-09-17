var express = require('express');
var router = express.Router();
const connection = require('../db/sql');
const userSql = require('../db/userSql');
const jwt = require('jsonwebtoken');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// 用户注册接口
router.post('/register', function(req, res) {
    // 1. 从请求体获取用户名和密码
    const { userName, userPwd } = req.body;
      // 2. 验证必填字段
    if (!userName || !userPwd) {
        return res.json({ code: 1, msg: '用户名和密码不能为空' });
    }
    // 3. 检查用户是否已存在
    connection.query(userSql.queryUserByName(userName), function(err, results) {
        if (err) return res.json({ code: 2, msg: '数据库错误', err });
         // 4. 如果用户已存在
        if (results.length > 0) {
            return res.json({ code: 3, msg: '用户已存在' });
        }
        // 5.插入新用户
        connection.query(userSql.insertUser({ userName, userPwd }), function(err2, results2) {
            if (err2) return res.json({ code: 4, msg: '注册失败', err: err2 });
             // 7. 返回成功响应
            res.json({ code: 200, msg: '注册成功'});
        });
    });
});
// 用户登录接口
router.post('/login', function(req, res) {
    console.log('req.body:', req.body);      // 打印请求体（前端POST提交的数据）
    // 1. 从请求体获取用户名和密码
    const { userName, userPwd } = req.body;
      // 2. 验证必填字段
    if (!userName || !userPwd) {
        return res.json({ code: 1, msg: '用户名和密码不能为空' });
    }
    // 3. 检查用户是否已存在
    connection.query(userSql.queryUserByNameAndPwd({userName, userPwd}), function(err, results) {
       console.log("err",err);
       console.log("results",results);
        if (err) {
            return res.json({ code: 500, msg: '数据库查询错误' });
        }
         // 4. 验证查询结果
         if (results.length === 0) {
            return res.json({ code: 2, msg: '用户名或密码错误' });
        }
        // 5. 登录成功
        const user = results[0];
        // 生成token (需要安装jsonwebtoken)
        const token = jwt.sign({ userName: user.name }, '666', { expiresIn: '2h' });
        // 6. 返回成功响应
        res.json({
            code: 200,
            msg: '登录成功',
            data: {
                token,
                userInfo: {
                    id: user.id,
                    name: user.name
                }
            }
        });
    });
});
router.post('/updatePassword', function(req, res) {
    console.log('req.body:', req.body); 
    const { userName, userPwd,newPwd } = req.body;
    if(userPwd === newPwd){
        return res.json({ code: 1, msg: '新密码不能和原密码相同' });
    }else{
        connection.query(userSql.updatePassword({userName,newPwd,userPwd}), function(err, results) {
            if (err) {
                return res.json({ code: 500, msg: '数据库修改错误' });
            }
    // affectedRows:受影响的行数，主要用于INSERT、UPDATE、DELETE等修改数据的操作
    // 返回值 ：
    //  - 0：表示没有行被影响（例如UPDATE时没有匹配的记录）
    //  - 大于0：表示成功影响了指定行数
            if (results.affectedRows > 0) {
                res.json({
                    code: 200,
                    msg: '修改成功',
                    data: {
                        name: userName,
                        pwd:newPwd
                    }
                });
            } else {
                return res.json({ code: -1, msg: '密码修改失败，可能是用户名不存在' });
              
            }
        })
    }
})
module.exports = router;
