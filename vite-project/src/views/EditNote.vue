<template>
  <div class="edit-note-page">
    <!-- 顶部导航栏 -->
    <van-nav-bar
      title="编辑"
      class="edit-nav-bar"
      left-text="返回"
      left-arrow
      @click-left="onClickBack"
      fixed
      placeholder
    />

    <div class="edit-note-container">
      <!-- 使用Vant组件美化输入区域 -->
      <van-field
        v-model="currentNote.title"
        placeholder="请输入笔记标题"
        class="title-input"
        clearable
        :border="false"
      >
        <template #left-icon>
          <van-icon name="edit" color="#1989fa" />
        </template>
      </van-field>

      <van-field
        v-model="currentNote.content"
        type="textarea"
        placeholder="请输入笔记内容..."
        rows="15"
        class="content-input"
        :border="false"
      />

      <!-- 图片编辑区域 -->
      <div class="image-edit-section">
        <div class="section-title">笔记图片</div>
        <div class="image-container">
          <!-- 图片预览 -->
          <div class="image-preview" v-if="fileList.length > 0">
            <!-- Vant 组件 -->
            <van-image
              width="100%"
              height="150px"
              :src="fileList[0]?.url || currentNote.img"
              fit="cover"
              radius="8px"
            >
              <template v-slot:loading>
                <van-loading type="spinner" size="20" />
              </template>
            </van-image>
            <div class="image-actions">
              <van-button
                round
                size="small"
                type="primary"
                @click="showImagePicker = true"
              >
                <van-icon name="edit" />
                更换
              </van-button>
              <van-button round size="small" type="danger" @click="removeImage">
                <van-icon name="delete" />
                删除
              </van-button>
            </div>
          </div>

          <!-- 无图片时的上传按钮 -->
          <van-uploader
            v-else
            v-model="fileList"
            :after-read="afterRead"
            :max-count="1"
            accept="image/*"
            :preview-image="true"
          >
            <van-button icon="plus" type="primary" round>添加图片</van-button>
          </van-uploader>
        </div>
      </div>

      <!-- 图片选择器弹窗 -->
      <van-action-sheet v-model:show="showImagePicker" title="修改图片">
        <div class="image-picker-content">
          <van-uploader
            v-model="fileList"
            :after-read="afterRead"
            :max-count="1"
            accept="image/*"
          >
            <van-button icon="plus" type="primary" block>选择新图片</van-button>
          </van-uploader>
          <van-button
            type="danger"
            block
            @click="removeImage"
            v-if="currentNote.img"
            style="margin-top: 10px"
          >
            删除当前图片
          </van-button>
        </div>
      </van-action-sheet>

      <!-- 悬浮操作按钮 -->
      <div class="action-buttons">
        <van-button
          round
          type="danger"
          size="large"
          class="delete-btn"
          @click="DeleteNote"
        >
          <van-icon name="delete" size="20" />
          删除笔记
        </van-button>
        <van-button
          round
          type="primary"
          size="large"
          class="save-btn"
          @click="saveNote"
          :disabled="!currentNote.title?.trim()"
        >
          <van-icon name="success" size="20" />
          保存修改
        </van-button>
      </div>
    </div>
    <Tabbar />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import Tabbar from "@/components/common/Tabbar.vue";
import { editNote, deleteNote, getEditNote } from "@/api/noteApi";
import dayjs from "dayjs";
import axios from "axios";
const BASE_URL = 'http://localhost:3000'; 

const updateTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
const route = useRoute();
const router = useRouter();
const userInfo = JSON.parse(localStorage.getItem("userInfo"));
const noteId = ref(route.params.id);
const showImagePicker = ref(false);
const fileList = ref([]);
// 确保组件卸载时释放URL
onUnmounted(() => {
  if (fileList.value[0]?.url) {
    URL.revokeObjectURL(fileList.value[0].url);
  }
});
// 组件挂载时加载笔记数据
onMounted(async () => {
  const res = await getEditNote(noteId.value, userInfo.id);
  if (res.code === 200) {
    currentNote.value = res.data;
    if (res.data.img) {
      // 如果不是完整URL，拼接BASE_URL
      const imgUrl = res.data.img.startsWith('http') ? res.data.img : BASE_URL + res.data.img;
      // 更新笔记对象中的图片URL
      currentNote.value.img = imgUrl;
     // 初始化文件列表用于图片预览
     fileList.value = [{
        url: imgUrl,          // 图片预览地址
        name: 'note-image.png', // 文件名（固定值或可从URL提取）
        status: 'done',       // 上传状态标记为已完成
        isImage: true         // 标记为图片类型
      }];
    }
  }
});

// 当前编辑的笔记数据
const currentNote = ref({
  id: null,
  title: "",
  content: "",
  updateTime: "",
  img: "",
});
/***
 * 
### 执行流程
1. 用户选择图片 → 触发 afterRead 回调
2. 验证文件类型和大小 → 不合格则提示并终止
3. 构建FormData → 发送POST请求到上传接口
4. 成功响应 → 更新图片URL和预览列表 → 提示成功
5. 失败响应/异常 → 提示上传失败
 */


// 图片上传处理
const afterRead = async (file) => {
   // 标准化文件格式（处理单文件/多文件数组情况）
  const fileItem = Array.isArray(file) ? file[0] : file;
  // 1. 文件类型验证
  if (!fileItem.file.type.startsWith("image/")) {
    // 非图片类型提示
    showToast("请上传图片文件");
    // 清空文件列表
    fileList.value = [];
    return;
  }
   // 2. 文件大小验证（限制2MB）
  if (fileItem.file.size > 2 * 1024 * 1024) {
    showToast("图片大小不能超过2MB");
    fileList.value = [];
    return;
  }
  // 3. 准备上传数据
  const formData = new FormData();
  // 添加文件到表单数据
  formData.append("file", fileItem.file);
  try {
     // 4. 发送上传请求
    const res = await axios.post("/api/notes/uploadImg", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    if (res.data.code === 200) {
      currentNote.value.img = BASE_URL + res.data.imgUrl;
       // 更新文件列表（用于图片预览）
       fileList.value = [{
        url: currentNote.value.img,                  // 预览地址
        name: fileItem.file.name || 'note-image.png', // 文件名（优先使用原文件名）
        status: 'done',                               // 标记为上传完成
        isImage: true                                 // 标识为图片类型
      }];
      // 隐藏图片选择器
      showImagePicker.value = false;
      showToast("图片已更新");
    } else {
      showToast("图片上传失败");
    }
  } catch (e) {
    showToast("图片上传失败");
  }
};

// 移除图片
const removeImage = () => {
  currentNote.value.img = "";
  fileList.value = [];
  showImagePicker.value = false;
  showToast("图片已删除");
};

// 返回按钮点击事件
const onClickBack = () => {
  if (hasUnsavedChanges()) {
    showConfirmDialog({
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

// 检查是否有未保存的更改
const hasUnsavedChanges = () => {
  return (
    currentNote.value.title.trim() ||
    currentNote.value.content.trim() ||
    currentNote.value.img !== initialNoteState.img
  );
};

const saveNote = () => {
  showConfirmDialog({
    title: "保存确认",
    message: "确定要保存对笔记的修改吗？",
  })
    .then(async () => {
      console.log(currentNote.value.img);
      const res = await editNote(
        noteId.value,
        userInfo.id,
        currentNote.value.title,
        currentNote.value.content,
        updateTime,
        currentNote.value.img
      );
      
      
      if (res.code === 200) {
        showToast("保存成功");
        router.back();
      }
    })
    .catch((err) => {
      console.log("保存取消或出错", err);
    });
};

// 删除笔记
const DeleteNote = () => {
  showConfirmDialog({
    title: "删除确认",
    message: "确定要删除这篇笔记吗？此操作不可恢复。",
    confirmButtonColor: "#ee0a24",
  })
    .then(async () => {
      const res = await deleteNote(noteId.value, userInfo.id);
      if (res.code === 200) {
        showToast("删除成功");
        router.back();
      } else {
        showToast("删除失败");
      }
    })
    .catch(() => {
      // 取消操作
    });
};
</script>

<style scoped>
.edit-note-page {
  background-color: #f7f8fa;
  min-height: 100vh;
}

.edit-nav-bar {
  margin-bottom: 10px;
}

.edit-note-container {
  padding: 16px;
  padding-top: 0;
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
  height: 300px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

:deep(.content-input .van-field__control) {
  font-size: 16px;
  line-height: 1.6;
  color: #333;
  min-height: 300px;
}

/* 图片编辑区域 */
.image-edit-section {
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100px;
}

.image-preview {
  width: 100%;
  position: relative;
}

.image-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
}

.image-picker-content {
  padding: 16px;
}

/* 操作按钮样式 */
.action-buttons {
  position: fixed;
  bottom: 70px;
  left: 0;
  right: 0;
  padding: 0 16px;
  z-index: 1;
  display: flex;
  gap: 10px;
}

.delete-btn,
.save-btn {
  flex: 1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.delete-btn {
  background-color: #ee0a24;
  border-color: #ee0a24;
}

.delete-btn:active {
  transform: scale(0.98);
  background-color: #dc0a22;
}

.save-btn:active {
  transform: scale(0.98);
}

/* 禁用状态样式 */
:deep(.save-btn.van-button--disabled) {
  opacity: 0.6;
  box-shadow: none;
}

/* 按钮内容布局 */
:deep(.delete-btn .van-button__content),
:deep(.save-btn .van-button__content) {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
</style>
