//在数据库中验证用户的信息
const user = {
	//查询用户是否已存在
	queryUserByName(name) {
		return `SELECT * FROM user WHERE name = '${name}'`;
	},
	//新增用户
	insertUser(option) {
		// console.log("option",option);
		let userName = option.userName; // 从option参数获取用户名
		let userPwd = option.userPwd || '1111';  // 获取密码，默认值'1111'
		return `INSERT INTO user (name, pwd) VALUES ('${userName}', '${userPwd}')`;
	},
	// 使用参数化查询防止SQL注入
	queryUserByNameAndPwd: ({userName, userPwd}) => {
	// console.log("userName",userName,"userPwd",userPwd);
    return {
        sql: 'SELECT * FROM user WHERE name = ? and pwd = ?', // 使用参数化查询，防止SQL注入
        values: [userName,userPwd]
    };
},
// queryUserByNameAndPwd: (option) => {
// 	console.log("option",option);
// 		let userName = option.userName; // 从option参数获取用户名
// 		let userPwd = option.userPwd || '1111';  // 获取密码，默认值'1111'
//     return {
//         sql: 'SELECT * FROM user WHERE name = ? and pwd = ?', // 使用参数化查询，防止SQL注入
//         values: [userName,userPwd]
//     };
// }
updatePassword:({userName,newPwd,userPwd})=>{
	return {
        sql: 'update user set pwd = ? WHERE name = ? and pwd = ?', // 使用参数化查询，防止SQL注入
        values: [newPwd,userName,userPwd]
    };
}
}

exports = module.exports = user