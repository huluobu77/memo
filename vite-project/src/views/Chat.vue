<template>
  <div class="chat-page">
    <div class="chat-container">
      <div class="messages">
        <div 
          v-for="(msg, idx) in messages" 
          :key="idx" 
          class="message"
          :class="{'sent': msg.isSent}"
        >
          {{ msg.text }}
        </div>
      </div>
      <div class="input-container">
        <van-field
          v-model="input"
          placeholder="请输入消息..."
          @keyup.enter="send"
          right-icon="arrow-up"
          @click-right-icon="send"
          class="message-input"
          clearable
          border
        />
      </div>
    </div>
    <Tabbar/>
  </div>
</template>

<script setup>
// 导入Vue相关功能
import { ref, onMounted, onBeforeUnmount } from 'vue';
// 导入底部导航栏组件
import Tabbar from '@/components/common/Tabbar.vue'

// 响应式数据定义
const messages = ref([]);  // 存储所有消息的数组
const input = ref('');  // 绑定输入框的值
let ws = null;  // WebSocket连接实例

// 组件挂载时执行的逻辑
onMounted(() => {
  // 创建WebSocket连接
  ws = new WebSocket('ws://localhost:3001');
  
  // 消息接收处理
  ws.onmessage = async (event) => {
    let message;
    // 处理不同类型的消息数据（Blob或普通文本）
    if (event.data instanceof Blob) {
      message = await event.data.text();  // 如果是Blob类型，转换为文本
    } else {
      message = event.data;  // 直接使用文本数据
    }
    
    // 将接收到的消息添加到消息列表（标记为接收的消息）
    messages.value.push({
      text: message,
      isSent: false  // 标记为接收的消息
    });
    
    // 滚动到底部显示最新消息
    scrollToBottom();
  };
  
  // 连接成功回调
  ws.onopen = () => {
    console.log('WebSocket 连接成功');
  };
  
  // 连接错误回调
  ws.onerror = (err) => {
    console.error('WebSocket 连接失败', err);
  };
});

// 关闭WebSocket连接的方法
const closeWebSocket = () => {
  // 检查连接是否存在且处于打开状态
  if (ws && ws.readyState === WebSocket.OPEN) {
    // 正常关闭连接（状态码1000表示正常关闭）
    ws.close(1000, '用户切换页面');
  }
};

// 导入路由守卫
import { onBeforeRouteLeave } from 'vue-router';
// 路由离开前的处理
onBeforeRouteLeave((to, from, next) => {
  closeWebSocket();  // 关闭WebSocket连接
  next();  // 继续路由跳转
});

// 组件卸载前的处理
onBeforeUnmount(() => {
  closeWebSocket();  // 关闭WebSocket连接
});

// 滚动到消息列表底部
function scrollToBottom() {
  // 使用setTimeout确保DOM更新后再滚动
  setTimeout(() => {
    const messagesContainer = document.querySelector('.messages');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, 50);
}

// 发送消息方法
function send() {
    // 检查：输入不为空且WebSocket连接已建立
    if (input.value.trim() && ws && ws.readyState === 1) {
        // 创建消息对象
        const message = {
            text: input.value,
            isSent: true,  // 标记为发送的消息
            timestamp: new Date().toISOString()  // 添加时间戳
        };
        
        // 通过WebSocket发送纯文本消息
        ws.send(input.value);
        
        // 将消息添加到本地消息列表
        messages.value.push(message);
        input.value = '';  // 清空输入框
        scrollToBottom();  // 滚动到底部
    } else {
        console.error('WebSocket未准备好或消息为空');
    }
}
</script>

<style scoped>
/* 保持原有样式不变 */
.chat-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.chat-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 12px;
  padding-bottom: 50px;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  margin-bottom: 12px;
  scroll-behavior: smooth;
}

.message {
  margin: 8px 0;
  padding: 10px 14px;
  border-radius: 18px;
  max-width: 80%;
  word-break: break-word;
  background-color: #e5e5ea;
  color: #000;
  align-self: flex-start;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
}

.message.sent {
  background-color: #1989fa;
  color: white;
  align-self: flex-end;
}

.input-container {
  background-color: white;
  border-radius: 20px;
  padding: 8px;
  box-shadow: 0 -1px 4px rgba(0, 0, 0, 0.05);
}

.message-input {
  border-radius: 20px;
  background-color: #f7f7f7;
}

.messages::-webkit-scrollbar {
  width: 6px;
}

.messages::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.messages::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.messages::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>