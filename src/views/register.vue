<template>
  <div class="register">
    <el-form ref="registerRef" :model="registerForm" :rules="registerRules" class="register-form">
      <div class="title-box">
        <h3 class="title">用户注册</h3>
        <lang-select />
      </div>
      <el-form-item prop="nickName">
        <el-input v-model="registerForm.nickName" type="text" size="large" auto-complete="off" placeholder="请输入用户昵称">
          <template #prefix><svg-icon icon-class="user" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="username">
        <el-input v-model="registerForm.username" type="text" size="large" auto-complete="off" placeholder="请输入用户名称（登录时使用）">
          <template #prefix><svg-icon icon-class="user" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="registerForm.password"
          type="password"
          size="large"
          auto-complete="off"
          placeholder="请输入密码"
          @keyup.enter="handleRegister"
        >
          <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="confirmPassword">
        <el-input
          v-model="registerForm.confirmPassword"
          type="password"
          size="large"
          auto-complete="off"
          placeholder="请确认密码"
          @keyup.enter="handleRegister"
        >
          <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item v-if="captchaEnabled" prop="code">
        <el-input
          v-model="registerForm.code"
          size="large"
          auto-complete="off"
          placeholder="请输入验证码"
          style="width: 63%"
          @keyup.enter="handleRegister"
        >
          <template #prefix><svg-icon icon-class="validCode" class="el-input__icon input-icon" /></template>
        </el-input>
        <div class="register-code">
          <img :src="codeUrl" class="register-code-img" @click="getCode" />
        </div>
      </el-form-item>
      <el-form-item style="width: 100%">
        <el-button :loading="loading" size="large" type="primary" style="width: 100%" @click.prevent="handleRegister">
          <span v-if="!loading">立即注册</span>
          <span v-else>注册中...</span>
        </el-button>
        <div style="float: right">
          <router-link class="link-type" :to="'/login'">已有账号？去登录</router-link>
        </div>
      </el-form-item>
    </el-form>
    <!--  底部  -->
    <div class="el-register-footer">
      <span>Copyright © 2018-2025 HIT项目组队通 All Rights Reserved.</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getCodeImg, register, getTenantList } from '@/api/login';
import { RegisterForm, TenantVO } from '@/api/types';
import { to } from 'await-to-js';
import { useI18n } from 'vue-i18n';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const title = import.meta.env.VITE_APP_TITLE;
const router = useRouter();

const { t } = useI18n();

const registerForm = ref<RegisterForm>({
  tenantId: '000000', // 固定租户ID
  username: '',
  nickName: '',
  password: '',
  confirmPassword: '',
  code: '',
  uuid: '',
  userType: 'sys_user',
  // 设置与张三用户一致的默认值
  deptId: '100',
  roleIds: ['3'],
  sex: '0',
  status: '0'
});

// 租户开关
const tenantEnabled = ref(false); // 关闭租户选择

const equalToPassword = (rule: any, value: string, callback: any) => {
  if (registerForm.value.password !== value) {
    callback(new Error('两次输入的密码不一致'));
  } else {
    callback();
  }
};

const registerRules: ElFormRules = {
  nickName: [
    { required: true, trigger: 'blur', message: '用户昵称不能为空' },
    { min: 2, max: 20, message: '用户昵称长度必须介于 2 和 20 之间', trigger: 'blur' }
  ],
  username: [
    { required: true, trigger: 'blur', message: '用户名称不能为空' },
    { min: 2, max: 20, message: '用户名称长度必须介于 2 和 20 之间', trigger: 'blur' }
  ],
  password: [
    { required: true, trigger: 'blur', message: '密码不能为空' },
    { min: 5, max: 20, message: '密码长度必须介于 5 和 20 之间', trigger: 'blur' },
    { pattern: /^[^<>"'|\\]+$/, message: '不能包含非法字符：< > " \' \\ |', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, trigger: 'blur', message: '确认密码不能为空' },
    { required: true, validator: equalToPassword, trigger: 'blur' }
  ],
  code: [{ required: true, trigger: 'change', message: '验证码不能为空' }]
};
const codeUrl = ref('');
const loading = ref(false);
const captchaEnabled = ref(true);
const registerRef = ref<ElFormInstance>();
// 租户列表
const tenantList = ref<TenantVO[]>([]);

const handleRegister = () => {
  registerRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true;
      const [err] = await to(register(registerForm.value));
      if (!err) {
        const username = registerForm.value.username;
        await ElMessageBox.alert(`<span style="color: green;">恭喜您，用户 "${username}" 注册成功！</span>`, '注册成功', {
          app: undefined,
          dangerouslyUseHTMLString: true,
          type: 'success'
        });
        await router.push('/login');
      } else {
        loading.value = false;
        if (captchaEnabled.value) {
          getCode();
        }
      }
    }
  });
};

const getCode = async () => {
  const res = await getCodeImg();
  const { data } = res;
  captchaEnabled.value = data.captchaEnabled === undefined ? true : data.captchaEnabled;
  if (captchaEnabled.value) {
    codeUrl.value = 'data:image/gif;base64,' + data.img;
    registerForm.value.uuid = data.uuid;
  }
};

const initTenantList = async () => {
  const { data } = await getTenantList(false);
  tenantEnabled.value = data.tenantEnabled === undefined ? true : data.tenantEnabled;
  if (tenantEnabled.value) {
    tenantList.value = data.voList;
    if (tenantList.value != null && tenantList.value.length !== 0) {
      registerForm.value.tenantId = tenantList.value[0].tenantId;
    }
  }
};

onMounted(() => {
  getCode();
  initTenantList();
});
</script>

<style lang="scss" scoped>
.register {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-size: cover;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23667eea;stop-opacity:0.8" /><stop offset="100%" style="stop-color:%23764ba2;stop-opacity:0.8" /></linearGradient></defs><rect width="1200" height="800" fill="url(%23grad1)"/><g fill="rgba(255,255,255,0.1)"><circle cx="200" cy="150" r="80"/><circle cx="800" cy="200" r="120"/><circle cx="1000" cy="600" r="100"/><circle cx="400" cy="700" r="90"/><circle cx="100" cy="500" r="60"/><circle cx="1100" cy="400" r="70"/></g></svg>') no-repeat center center;
    background-size: cover;
    opacity: 0.3;
    z-index: 0;
  }
}

.title-box {
  display: flex;

  .title {
    margin: 0px auto 30px auto;
    text-align: center;
    color: #707070;
  }

  :deep(.lang-select--style) {
    line-height: 0;
    color: #7483a3;
  }
}

.register-form {
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  width: 400px;
  padding: 30px;
  position: relative;
  z-index: 1;

  .el-input {
    height: 45px;

    input {
      height: 45px;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
      transition: all 0.3s ease;
      
      &:focus {
        border-color: #667eea;
        box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
      }
    }
  }

  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 0;
  }
  
  .el-button--primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 8px;
    height: 45px;
    font-weight: 500;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
  }
}

.register-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}

.register-code {
  width: 33%;
  height: 40px;
  float: right;

  img {
    cursor: pointer;
    vertical-align: middle;
  }
}

.el-register-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #fff;
  font-family: Arial, serif;
  font-size: 12px;
  letter-spacing: 1px;
}

.register-code-img {
  height: 40px;
  padding-left: 12px;
}
</style>
