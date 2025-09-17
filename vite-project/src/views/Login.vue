<template>
  <div class="container">
    <h2>用户登录</h2>
    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field
          v-model="username"
          name="username"
          label="用户名"
          placeholder="请输入用户名"
          :rules="[{ required: true, message: '请填写用户名' }]"
        />
        <van-field
          v-model="password"
          type="password"
          name="password"
          label="密码"
          placeholder="请输入密码"
          :rules="[
            { required: true, message: '请填写密码' },
            { validator: validatePwd, message: '密码必须由英文+数字' },
          ]"
        />
      </van-cell-group>
      <div style="margin: 16px">
        <van-button round block type="primary" native-type="submit"> 登录 </van-button>
      </div>
    </van-form>

    <div class="action-links">
      <a @click="onForgetPassword">忘记密码?</a>
      <a @click="onRegister">注册新账号</a>
    </div>

    <!-- 注册、忘记密码弹窗 -->
    <van-dialog
      v-model:show="showDialog"
      :title="dialogTitle"
      show-cancel-button
      :before-close="beforeDialogClose"
    >
      <van-form ref="dialogFormRef">
        <van-cell-group inset>
          <van-field
            v-model="dialogForm.username"
            label="用户名"
            placeholder="请输入用户名"
            :rules="[{ required: true, message: '请填写用户名' }]"
          />
          <van-field
            v-model="dialogForm.password"
            v-if="!isForgetPassword"
            type="password"
            label="密码"
            placeholder="请输入密码"
            :rules="[
              { required: true, message: '请填写密码' },
              { validator: validatePwd, message: '密码必须由英文+数字' },
            ]"
          />
          <van-field
            v-if="!isForgetPassword"
            v-model="dialogForm.confirmPassword"
            type="password"
            label="确认密码"
            placeholder="请再次输入密码"
            :rules="[
              { required: true, message: '请再次输入密码' },
              {
                validator: validateRegisterConfirmPassword,
                message: '两次密码输入不一致',
              },
            ]"
          />
          <van-field
            v-if="isForgetPassword"
            v-model="dialogForm.oldPassword"
            type="password"
            label="旧密码"
            placeholder="请输入旧密码"
            :rules="[{ required: true, message: '请填写旧密码' }]"
          />
          <van-field
            v-if="isForgetPassword"
            v-model="dialogForm.newPassword"
            type="password"
            label="新密码"
            placeholder="请输入新密码"
            :rules="[
              { required: true, message: '请填写新密码' },
              { validator: validatePwd, message: '密码必须由英文+数字' },
            ]"
          />
        </van-cell-group>
      </van-form>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { register, login ,updatePassword} from "@/api/userApi";
import { useRouter } from "vue-router";
const router = useRouter();
const isForgetPassword = ref(false);
const dialogTitle = computed(() => (isForgetPassword.value ? "忘记密码" : "用户注册"));
// 登录表单
const username = ref("");
const password = ref("");

// 注册相关
const showDialog = ref(false);
const dialogFormRef = ref(null);
const dialogForm = reactive({
  username: "",
  password: "",
  confirmPassword: "",
  oldPassword: "",
  newPassword: "",
});
// 点击忘记密码
const onForgetPassword = () => {
  isForgetPassword.value = true;
  showDialog.value = true;
};
// 点击注册
const onRegister = () => {
  isForgetPassword.value = false;
  showDialog.value = true;
};
// 验证密码格式（英文+数字）
const validatePwd = (value) => {
  return /^(?=.*[a-zA-Z])(?=.*\d).+$/.test(value);
};

// 验证确认密码
const validateRegisterConfirmPassword = () => {
  return dialogForm.password === dialogForm.confirmPassword;
};

// 注册提交前的验证
const beforeDialogClose = async (action) => {
  if (action === "confirm") {
    try {
      // 1. 验证表单规则
      await dialogFormRef.value.validate();
      if (isForgetPassword.value) {
        // 忘记密码逻辑
        const res = await updatePassword(
          dialogForm.username,
          dialogForm.oldPassword,
          dialogForm.newPassword
        );
        console.log(res);
        if (res.code === 200) {
          showToast("密码修改成功");
          // 自动填充修改后的账号密码
          username.value = res.data.name;
          password.value = res.data.pwd;
          // 清空表单
          Object.assign(dialogForm, {
            username: "",
            oldPassword: "",
            newPassword: "",
          });
          return true;
        }
        else {
          showToast(res.msg);
          return false;
        }
      } else {
        // 注册逻辑
        // 2. 额外检查两次密码是否一致
        if (dialogForm.password !== dialogForm.confirmPassword) {
          showToast("两次密码输入不一致");
          return false;
        }
        const res = await register(dialogForm.username, dialogForm.password);
        if (res.code === 200) {
          showToast("注册成功");
          username.value = dialogForm.username;
          password.value = dialogForm.password;
          // 清空表单
          Object.assign(dialogForm, {
            username: "",
            password: "",
            confirmPassword: "",
          });
          return true;
        } else {
          showToast(res.msg);
          return false;
        }
      }
    } catch (error) {
      console.error("验证失败", error);
      return false; // 阻止弹窗关闭
    }
  }
  return true; // 允许取消操作关闭弹窗
};

// 登录提交（示例，需要补充实现）
const onSubmit = async () => {
  try {
    const res = await login(username.value, password.value);
    console.log(res);
    if (res.code === 200) {
      // 存储token
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userInfo", JSON.stringify(res.data.userInfo));
      showToast("登录成功");
      // 跳转到首页
      router.push("/home");
    } else {
      // 显示错误信息
      showToast(res.msg);
    }
  } catch (error) {
    console.error("登录失败:", error);
    showToast("登录失败，请重试");
  }
};
</script>

<style scoped>
/* 样式保持不变 */
.container {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  text-align: center;
  margin: 20px 0 30px;
  font-size: 24px;
  color: #333;
}

.action-links {
  display: flex;
  justify-content: space-between;
  margin: 20px 30px;
}

.action-links a {
  color: #1989fa;
  font-size: 14px;
  text-decoration: none;
}

.action-links a:hover {
  text-decoration: underline;
}
</style>
