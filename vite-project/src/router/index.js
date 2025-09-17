import {
	createRouter,
	createWebHistory
} from 'vue-router'
import Home from '../views/Home.vue'
// 获取环境变量，Vite 会自动替换这里的值
const base = import.meta.env.VITE_BASE_URL || '/'
const router = createRouter({
	history: createWebHistory(base),
	routes: [{
			path: '/',
			redirect: '/home'
		},
		{
			path: '/home',
			name: 'Home',
			component: Home,
		},
		{
			path: '/editNote/:id',
			name: 'EditNote',
			component: () => import('../views/EditNote.vue'),
			props: true
		},
		{
			path: '/chat',
			name: 'Chat',
			component: () => import('../views/Chat.vue'),
		},
		{
			path: '/addNote',
			name: 'AddNote',
			component: () => import('../views/AddNote.vue'),
		},
		{
			path: '/login',
			name: 'Login',
			component: () => import('../views/Login.vue'),
		},
	],
})
export default router