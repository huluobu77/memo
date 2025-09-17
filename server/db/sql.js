const mysql = require('mysql')

let connection = mysql.createConnection({
	host:'localhost',
	user:'root',
	password:'123456',
	database:'vueshop'
})

// 新增初始化表函数
function initTables() {
	const createTableSQL = `
	  CREATE TABLE IF NOT EXISTS user (
		id INT AUTO_INCREMENT PRIMARY KEY,
		name VARCHAR(50) NOT NULL,
		pwd VARCHAR(50) NOT NULL
	  )`
	  const createNoteTableSQL = `
	  CREATE TABLE IF NOT EXISTS note (
		noteId INT AUTO_INCREMENT PRIMARY KEY,
		userId INT NOT NULL,
		title VARCHAR(50) NOT NULL,
		content VARCHAR(50) NOT NULL,
		createTime DATETIME NOT NULL,
		img VARCHAR(255)
	  )`

	connection.query(createTableSQL, (err) => {
		if (err) {
			console.error('创建用户表失败:', err);
			return;
		  }
		  console.log('用户表创建/检查完成');
	})
	connection.query(createNoteTableSQL, (err) => {
		if (err) {
			console.error('创建笔记表失败:', err);
			return;
		  }
		  console.log('笔记表创建/检查完成');
	})
	connection.query('SHOW TABLES LIKE "user"', (err, results) => {
		if (err) throw err;
		if (results.length > 0) {
		  console.log('用户表已存在');
		} else {
		  console.log('用户表不存在');
		}
	  });
	  connection.query('SHOW TABLES LIKE "note"', (err, results) => {
		if (err) throw err;
		if (results.length > 0) {
		  console.log('笔记表已存在');
		} else {
		  console.log('笔记表不存在');
		}
	  });
  }
  
  // 连接后自动初始化
  connection.connect((err) => {
	if (err) throw err
	console.log('数据库连接成功')
	initTables()
  })

  
module.exports = connection