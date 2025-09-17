<template>
  <div class="note-container">
    <!-- 搜索框区域 -->
    <div class="search-wrapper">
      <van-search
        v-model="searchText"
        placeholder="输入笔记关键词"
        class="custom-search-field"
      >
      </van-search>
    </div>

    <!-- 笔记列表区域 -->
    <div class="note-list">
      <!-- 单个笔记卡片，使用v-for循环渲染 -->
      <div
        v-for="note in filteredNotes"
        :key="note.noteId"
        class="note-card"
        @click="viewNote(note.noteId)"
      >
        <div class="note-header">
          <!-- 笔记标题 -->
          <h3 class="note-title">{{ note.title }}</h3>
        </div>
        <!-- 笔记内容预览 -->
        <p class="note-content">{{ note.content }}</p>
        <div class="note-footer">
          <!-- 笔记日期 -->
          <span class="note-date">{{ formatDate(note.createTime) }}</span>
          <!-- 笔记操作按钮 -->
          <div class="note-actions">
            <!-- 编辑按钮 -->
            <van-button
              round
              size="mini"
              icon="edit"
              type="primary"
              plain
              @click.stop="editNote(note.noteId)"
            />
            <!-- 删除按钮 -->
            <van-button
              round
              size="mini"
              icon="delete"
              type="danger"
              plain
              @click.stop="deleteNotes(note.noteId)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 添加笔记的浮动按钮 -->
    <van-button round type="primary" size="large" class="add-button" @click="addNote">
      <van-icon name="plus" size="24" />
    </van-button>

    <!-- 底部导航栏 -->
    <Tabbar />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import Tabbar from "@/components/common/Tabbar.vue";
import { getAllNote, deleteNote } from "@/api/noteApi";

const router = useRouter();
const userInfo = JSON.parse(localStorage.getItem("userInfo"));
// 初始化笔记数据
const notes = ref([]); // 使用ref创建响应式数组
const searchText = ref(""); // 搜索框文本

/**
 * 组件挂载时加载笔记数据
 */
onMounted(async () => {
  try {
    const res = await getAllNote(userInfo.id);
    console.log("获取笔记数据:", res);
    if (res.code === 200) {
      notes.value = res.data; // 更新笔记数据
    }
  } catch (error) {
    console.error("加载笔记失败:", error);
  }
});

/**
 * 计算属性：根据搜索文本过滤笔记
 */
const filteredNotes = computed(() => {
  if (!searchText.value.trim()) {
    return notes.value; // 无搜索文本时返回全部笔记
  }
  // 根据标题或内容过滤笔记
  const searchTerm = searchText.value.toLowerCase();
  return notes.value.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm) ||
      note.content.toLowerCase().includes(searchTerm)
  );
});

/**
 * 格式化日期显示
 * @param {string} dateString - 日期字符串
 * @returns {string} 格式化后的日期（如：5月20日）
 */
 const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}年${month}月${day}日 ${hours}时${minutes}分${seconds}秒`;
};

/**
 * 查看笔记详情
 * @param {number} noteId - 笔记ID
 */
const viewNote = (noteId) => {
  console.log("查看笔记:", noteId);
  router.push(`/editNote/${noteId}`);
};

const editNote = (noteId) => {
  console.log("编辑笔记:", noteId);
  router.push(`/editNote/${noteId}`);
};

/**
 * 添加新笔记
 */
const addNote = async () => {
  router.push("/addNote");
};

const deleteNotes = async (noteId) => {
  console.log("删除笔记:", noteId);
  const res = await deleteNote(noteId, userInfo.id);
  if (res.code === 200) {
    // 删除成功，刷新页面
    showToast("删除成功");
    window.location.reload();
  } else {
    showToast("删除失败");
  }
};
</script>

<style scoped>
/* 容器样式 */
.note-container {
  background-color: #f7f8fa;
  min-height: calc(100vh - 100px); /* 确保内容不被底部导航遮挡 */
  padding-bottom: 50px;
  position: relative;
}

/* 搜索框样式 */
.search-wrapper {
  padding: 16px;
  background: rgb(255, 255, 255);
  margin-bottom: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); /* 添加轻微阴影 */
}

.custom-search-field {
  background: #c7d7f6; /* 浅蓝色背景 */
  border-radius: 20px; /* 圆角 */
  padding: 8px 16px;
}

/* 深度选择器修改Vant组件内部样式 */
:deep(.custom-search-field .van-field__control) {
  padding-right: 12px;
}

/* 笔记列表样式 */
.note-list {
  padding: 0 16px;
}

/* 单个笔记卡片样式 */
.note-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s; /* 添加点击动画 */
}

.note-card:active {
  transform: scale(0.98); /* 点击时轻微缩小效果 */
}

/* 笔记头部样式 */
.note-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.note-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap; /* 标题过长显示省略号 */
}

.pinned-tag {
  margin-left: 8px;
}

/* 笔记内容样式 */
.note-content {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* 限制显示2行 */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis; /* 超出部分显示省略号 */
}

/* 笔记底部样式 */
.note-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.note-date {
  font-size: 12px;
  color: #999;
}

.note-actions {
  display: flex;
  gap: 8px; /* 按钮间距 */
}

/* 按钮样式优化 */
:deep(.van-button) {
  width: 28px;
  height: 28px;
  padding: 0; /* 移除默认内边距 */
}

/* 添加按钮样式 */
.add-button {
  position: fixed;
  right: 24px;
  bottom: 80px; /* 位于底部导航上方 */
  width: 56px;
  height: 56px;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(25, 137, 250, 0.3); /* 蓝色阴影 */
}

.add-button:active {
  transform: scale(0.95); /* 点击动画 */
}
</style>
