import {
	defineConfig
} from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { VantResolver } from '@vant/auto-import-resolver';

// alias - 表示要配置路径别名
// '@' - 这是你定义的别名，可以使用@符号来代替实际的路径
// path.resolve(__dirname, './src') - 这是实际的路径：
// __dirname 是Node.js中的全局变量，表示当前文件所在目录
// './src' 是相对于当前目录的src文件夹
// path.resolve() 方法会将路径解析为绝对路径
export default defineConfig({
	plugins: [vue(),
	AutoImport({
	      resolvers: [VantResolver()],
	    }),
	    Components({
	      resolvers: [VantResolver()],
	    }),],
	//配置根路径 @
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src')
		}
	},
	
	// 解决跨域，设置代理
	// 添加 server 配置
		server: {
			// 设置代理
			proxy: {
				'/api': {
					target: 'http://localhost:3000', // 目标服务器地址
					changeOrigin: true, // 是否改变请求头中的 Origin，默认为 false
					rewrite: (path) => path.replace(/^\/api/, ''), // 重写路径
				},
			},
		}
})