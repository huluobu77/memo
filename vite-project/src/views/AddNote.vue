<template>
  <div class="add-note-container">
    <van-nav-bar
      title="添加笔记"
      left-text="返回"
      left-arrow
      @click-left="onClickBack"
      fixed
      placeholder
    />

    <!-- 标题输入 -->
    <van-field
      v-model="newNote.title"
      placeholder="请输入笔记标题"
      class="title-input"
      clearable
      :border="false"
    >
      <template #left-icon>
        <van-icon name="edit" color="#1989fa" />
      </template>
    </van-field>

    <!-- 内容输入 -->
    <van-field
      v-model="newNote.content"
      type="textarea"
      placeholder="请输入笔记内容..."
      rows="10"
      class="content-input"
      :border="false"
    />

    <!-- 图片上传区域 -->
    <div class="upload-section">
      <div class="upload-title">添加图片（限1张）</div>
      <van-uploader
        v-model="fileList"
        :after-read="afterRead"
        :before-delete="beforeDelete"
        :max-count="1"
        accept="image/*"
        :preview-image="false"
        class="image-uploader"
      >
        <van-button icon="plus" type="primary" round>选择图片</van-button>
      </van-uploader>

      <!-- 图片预览 -->
      <div class="image-preview" v-if="newNote.imgUrl">
        <van-image
          width="100%"
          height="200px"
          :src="newNote.imgUrl"
          fit="cover"
          radius="8px"
        >
          <template v-slot:loading>
            <van-loading type="spinner" size="20" />
          </template>
        </van-image>
        <van-icon name="clear" class="delete-image" @click="removeImage" />
      </div>
    </div>

    <!-- 添加按钮 -->
    <div class="action-buttons">
      <van-button
        round
        type="primary"
        size="large"
        class="add-btn"
        @click="addNote"
        :disabled="!newNote.title.trim()"
      >
        <van-icon name="plus" size="20" />
        添加笔记
      </van-button>
    </div>
  </div>
  <Tabbar />
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { insertNote } from "@/api/noteApi";
import axios from "axios";
import Tabbar from "@/components/common/Tabbar.vue";
import dayjs from "dayjs";
const router = useRouter();
const createTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
const BASE_URL = 'http://localhost:3000'; // 生产环境用你的服务器地址

// 笔记数据
const newNote = reactive({
  id: "",
  title: "",
  content: "",
  imgUrl: "",
});
/** 
户选择图片 → afterRead触发 → 提取File对象 → uploadImg调用（上传图片到服务器） →
构建FormData → 发送POST请求 → 后端处理 → 前端响应处理 →
成功：更新预览+保存URL / 失败：显示错误提示
*/

// 文件列表
// 创建响应式数组，用于存储图片预览信息
const fileList = ref([]);

// 上传图片到服务器
const uploadImg = async (file) => {
  // 创建表单数据对象，专门用于传输文件和键值对
  const formData = new FormData();
  // 将文件对象添加到表单，键名"file"需与后端接口（multer配置）保持一致
  formData.append("file", file);
  const res = await axios.post("/api/notes/uploadImg", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  if (res.data.code === 200) {
    // 拼接完整图片URL（ BASE_URL 是后端服务器基础地址，如 http://localhost:3000 ）
    newNote.imgUrl = BASE_URL + res.data.imgUrl; // 拼接完整地址
    // 更新预览列表，显示上传成功的图片
    fileList.value = [{ url: newNote.imgUrl }];
  } else {
    showToast("图片上传失败");
  }
};

// 图片上传处理
// 这是文件选择组件（如Vant的 van-uploader ）的回调函数，当用户选择图片后自动触发
const afterRead = (file) => {
  // 处理文件选择组件可能返回的文件数组，确保只取第一个文件（符合项目单图上传需求）
  const fileItem = Array.isArray(file) ? file[0] : file;
  // fileItem.file：是浏览器提供的原生File对象，包含文件内容、名称、大小等元信息
  uploadImg(fileItem.file);
};

// 添加笔记
const addNote = async () => {
  if (!newNote.title.trim()) {
    showToast("请输入标题");
    return;
  }
  if (!newNote.content.trim()) {
    showToast("请输入内容");
    return;
  }
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const res = await insertNote(
    userInfo.id,
    newNote.title,
    newNote.content,
    createTime,
    newNote.imgUrl
  );
  console.log("添加：",res);
  
  if (res.code === 200) {
    showToast("添加成功");
    resetForm();
    router.back();
  } else {
    showToast("添加失败");
  }
};


// 删除图片前的确认
const beforeDelete = () => {
  return new Promise((resolve) => {
    Dialog.confirm({
      title: "提示",
      message: "确定要删除这张图片吗？",
    })
      .then(() => {
        removeImage();
        resolve(true);
      })
      .catch(() => {
        resolve(false);
      });
  });
};

// 移除图片
const removeImage = () => {
  newNote.imgUrl = "";
  fileList.value = [];
};

// 检查是否有未保存的更改
const hasUnsavedChanges = () => {
  return newNote.title.trim() || newNote.content.trim() || newNote.imgUrl;
};

// 返回按钮点击事件
const onClickBack = () => {
  if (hasUnsavedChanges()) {
    Dialog.confirm({
      title: "未保存的更改",
      message: "您有未保存的更改，确定要离开吗？",
    })
      .then(() => {
        router.back();
      })
      .catch(() => {
        // 取消操作
      });
  } else {
    router.back();
  }
};



// 重置表单
const resetForm = () => {
  newNote.title = "";
  newNote.content = "";
  newNote.imgUrl = "";
  fileList.value = [];
};
</script>

<style scoped>
.add-note-container {
  padding: 16px;
  background-color: #f7f8fa;
  min-height: calc(100vh - 100px);
  position: relative;
}

/* 标题输入框样式 */
.title-input {
  background-color: white;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

:deep(.title-input .van-field__control) {
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

/* 内容输入框样式 */
.content-input {
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

:deep(.content-input .van-field__control) {
  font-size: 16px;
  line-height: 1.6;
  color: #333;
  min-height: 200px;
}

/* 上传区域样式 */
.upload-section {
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  margin-top: 10px;
  margin-bottom: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.upload-title {
  font-size: 14px;
  color: #666;
}

/* 图片预览样式 */
.image-preview {
  position: relative;
}

.delete-image {
  position: absolute;
  top: 8px;
  right: 8px;
  color: white;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  padding: 4px;
  z-index: 1;
}

/* 添加按钮样式 */
.action-buttons {
  position: fixed;
  bottom: 70px;
  left: 0;
  right: 0;
  padding: 0 16px;
  z-index: 1;
}

.add-btn {
  width: 100%;
  box-shadow: 0 4px 12px rgba(25, 137, 250, 0.3);
  transition: all 0.3s ease;
}

.add-btn:active {
  transform: scale(0.98);
}

/* 禁用状态样式 */
:deep(.add-btn.van-button--disabled) {
  opacity: 0.6;
  box-shadow: none;
}

/* 按钮内容布局 */
:deep(.add-btn .van-button__content) {
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
