//在数据库中验证用户的信息
const note = {
	//新增用户
	insertNote({ userId, title, content, createTime, img }) {
         return {
            sql: 'INSERT INTO note (userId, title, content, createTime, img) VALUES (?, ?, ?, ?, ?)',
            values: [userId, title, content, createTime, img]
          };
	},
 // 获取所有笔记
 getAllNote({userId}) {
  return {
    sql: 'SELECT * FROM note WHERE userId = ? ORDER BY createTime DESC',
    values: [userId]
  };
},
deleteNote({userId, noteId}) {
  return {
    sql: 'DELETE FROM note WHERE userId = ? AND noteId = ?',
    values: [userId, noteId]
  };
},
getEditNote({userId, noteId}) {
  return {
    sql: 'SELECT * FROM note WHERE userId =? AND noteId =?',
    values: [userId, noteId]
  };
},
editNote({noteId,userId,title,content,createTime,img}) {
  return {
    sql: 'UPDATE note SET title =?, content =?, createTime =?, img =? WHERE noteId =? AND userId =?',
    values: [title,content,createTime,img,noteId,userId]
  };
},
}

exports = module.exports = note