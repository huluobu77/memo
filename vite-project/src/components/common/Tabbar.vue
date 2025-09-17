<template>
	<div class="tabbar">
		<ul>
			<li v-for="(item, index) in routerList" :key="index" @click=switchTab(item.path)>
				<span :class='route.path.includes(item.path)?"active":""'>{{item.title}}</span>
			</li>
		</ul>
	</div>
</template>

<script setup>
import { ref } from 'vue';
import {useRouter,useRoute} from 'vue-router';
const router=useRouter();
const route=useRoute();
const routerList = ref([
	{ title: '首页', path: '/home' },
	{ title: '聊天', path: '/chat' },
]);
const switchTab=(path)=>{
	router.replace(path)
}
</script>

<style scoped>
	.tabbar {
		position: fixed;
		left: 0;
		bottom: 0;
		z-index: 999;
		width: 100%;
		height: 1.25rem;
		background-color: white;
	}

	.tabbar ul {
		display: flex;
		justify-content: space-around;
		align-items: center;
		width: 100%;
		height: 100%;
		border-top: 1px solid rgb(226, 226, 226);
	}

	.tabbar ul li {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.tabbar ul li span {
		font-size: 0.45rem;
	}

	.active {
		color: red;
	}
</style>
