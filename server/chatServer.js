// 引入必要的模块
const express = require('express'); // Express框架，用于创建HTTP服务器
const http = require('http'); // Node.js内置HTTP模块
const WebSocket = require('ws'); // WebSocket库，实现WebSocket协议

// 创建Express应用和HTTP服务器
const app = express(); // 初始化Express应用
const server = http.createServer(app); // 使用Express应用创建HTTP服务器

// 创建WebSocket服务器，绑定到HTTP服务器上
const wss = new WebSocket.Server({ server }); // WebSocket服务器实例

// 存储所有连接的客户端
let clients = []; // 用于保存所有活跃的WebSocket客户端连接

// 当有新的WebSocket连接建立时
wss.on('connection', function connection(ws) {
    console.log('新客户端连接'); // 打印日志
    
    // 将新客户端添加到clients数组中
    clients.push(ws);
    
    // 心跳检测机制 - 定期发送ping帧检测连接是否存活
    const heartbeatInterval = setInterval(() => {
        // 检查连接状态是否为OPEN（活跃）
        if (ws.readyState === WebSocket.OPEN) {
            ws.ping(); // 发送ping帧
        }
    }, 30000); // 每30秒发送一次ping

    // 当收到客户端消息时的处理
    ws.on('message', function incoming(message) {
        try {
            console.log('收到消息:', message); // 打印收到的消息
            
            // 广播消息给所有其他客户端
            clients.forEach(client => {
                // 检查：不是发送消息的客户端 且 客户端连接状态为OPEN
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    // 将消息转换为字符串后发送（WebSocket可以发送字符串或Buffer）
                    client.send(message.toString());
                }
            });
        } catch (error) {
            console.error('消息处理错误:', error); // 捕获并打印可能的错误
        }
    });

    // 当客户端断开连接时的处理
    ws.on('close', () => {
        console.log('客户端断开连接'); // 打印日志
        clearInterval(heartbeatInterval); // 清除该客户端的心跳检测定时器
        // 从clients数组中移除已断开的客户端
        clients = clients.filter(client => client !== ws);
    });

    // 当WebSocket连接发生错误时的处理
    ws.on('error', (error) => {
        console.error('WebSocket错误:', error); // 打印错误信息
    });
});

// 启动HTTP服务器，监听3001端口
server.listen(3001, () => {
    console.log('WebSocket 服务器已启动，端口 3001'); // 服务器启动成功日志
});