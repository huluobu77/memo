import { createApp } from 'vue'
// import './style.css'
import App from './App.vue'
// 引入路由
import router from './router/index'
// 引入公共样式
import '@/assets/css/common.css'
// 引入淘宝无限适配方案
import '@/assets/js/flexible.js'
// 引入字体图标的css文件
import '@/assets/css/iconfont.css'
const app = createApp(App)

router.beforeEach((to,from)=>{
    const token = localStorage.getItem("token");
    if (!token && to.path !== "/login") {
        return "/login";
      } else if (token && to.path === "/login") {
        return "/";
      } else {
        return true;
      }
    })

app.use(router)
app.mount('#app')
