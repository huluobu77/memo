import axios from 'axios'

const service = axios.create({
  baseURL: '/api', // 后端接口地址，根据实际情况修改
  timeout: 5000
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    console.log(config);
    // 可统一添加 token
    const token = localStorage.getItem('token')  // 从浏览器的本地存储中获取名为'token'的值
    if (token) {  // 如果token存在
      config.headers['Authorization'] = 'Bearer ' + token  // 在请求头中添加Authorization字段
    }
    return config  // 返回修改后的配置对象
  },
  error => Promise.reject(error)
)

// 响应拦截器
service.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response.status === 404) {
      console.error('API端点不存在，请检查:', error.config.url)
    }
    return Promise.reject(error)
  }
)

export default service
