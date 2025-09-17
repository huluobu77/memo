# 记事本H5 + Express 全栈项目说明

## 项目简介

本项目是一个基于前后端分离架构的**移动端记事本应用**，前端采用 Vue3 + Vant + Vite，后端采用 Node.js + Express + MySQL，实现了用户注册、登录、笔记增删改查、图片上传、聊天等功能。适合学习全栈开发、移动端适配、文件上传等场景。

---

## 功能介绍

### 主要功能
- **用户注册/登录**：支持用户账号注册与登录，登录后可管理个人笔记。
- **笔记管理**：
  - 新增笔记（支持上传图片）
  - 编辑笔记（支持更换/删除图片）
  - 删除笔记
  - 查看所有笔记
- **图片上传**：支持本地图片上传，图片存储在服务器，数据库仅保存图片链接。
- **聊天功能**：内置简易聊天室，支持用户实时交流。
- **移动端适配**：UI 适配手机端，体验流畅。

---

## 技术栈

### 前端（`vite-project/`）
- **Vue3**：主流渐进式前端框架
- **Vite**：极速开发构建工具
- **Vant**：移动端 UI 组件库
- **Axios**：网络请求库
- **Day.js**：日期处理
- **前端路由**：Vue Router
- **本地存储**：localStorage

### 后端（`server/`）
- **Node.js**：JavaScript 运行环境
- **Express**：Web 服务框架
- **MySQL**：关系型数据库
- **Multer**：图片上传中间件
- **CORS**：跨域资源共享
- **JWT**（如有）：用户认证

---

## 目录结构

```
记事本h5+express/
├── server/           # 后端 Express 服务
│   ├── app.js        # 入口文件
│   ├── routes/       # 路由
│   ├── db/           # 数据库相关
│   └── public/uploads/ # 图片上传目录
└── vite-project/     # 前端 Vue3 项目
    ├── src/
    ├── public/
    └── ...
```

---

## 如何运行

### 1. 克隆项目
```bash
git clone <你的仓库地址>
cd 记事本h5+express
```

### 2. 启动后端（Node.js + Express + WebSocket
```bash
cd server
npm install
node app.js
node chatServer.js
# 默认端口 3000
```

### 3. 启动前端（Vue3 + Vite）
```bash
cd ../vite-project
npm install
npm run dev
# 默认端口 5173
```

### 4. 数据库配置
- 需先安装 MySQL，并在 `server/db/sql.js` 等文件中配置数据库连接信息。
- 数据库表结构可参考 `server/db/noteSql.js`、`userSql.js`。

### 5. 访问方式
- 前端访问地址：http://localhost:5173
- 后端 API 地址：http://localhost:3000
- 图片访问地址：http://localhost:3000/uploads/xxx.jpg

---

## 注意事项
- **图片上传目录**：请确保 `server/public/uploads/` 目录存在且有写权限。
- **端口冲突**：如端口被占用，请自行修改。
- **跨域问题**：开发环境已通过 Vite 代理解决，生产环境需配置 Nginx 或 CORS。
- **环境要求**：Node.js 16+，MySQL 5.7+，npm 8+

---

## 适用人群
- 想学习前后端分离、全栈开发的同学
- 需要移动端适配、图片上传、基础聊天室等功能的项目参考
- Vue3 + Express + MySQL 技术栈实战

---


