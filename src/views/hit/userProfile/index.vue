<template>
  <div class="user-profile-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>

    <!-- 页面内容 -->
    <div v-else>
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="page-title">
          <el-icon class="title-icon"><User /></el-icon>
          个人档案管理
        </div>
        <div class="page-description">完善您的个人信息，让团队更好地了解您</div>
      </div>

      <!-- 简化的内容区域 -->
      <el-card class="profile-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span class="card-title">个人信息</span>
            <el-button type="primary" @click="handleEdit">编辑资料</el-button>
          </div>
        </template>

        <div class="profile-info">
          <div class="info-item">
            <span class="label">姓名：</span>
            <span class="value">{{ userProfile.realName || '未设置' }}</span>
          </div>
          <div class="info-item">
            <span class="label">学号：</span>
            <span class="value">{{ userProfile.studentId || '未设置' }}</span>
          </div>
          <div class="info-item">
            <span class="label">学院：</span>
            <span class="value">{{ collegeLabel || '未设置' }}</span>
          </div>
          <div class="info-item">
            <span class="label">专业：</span>
            <span class="value">{{ userProfile.major || '未设置' }}</span>
          </div>
          <div class="info-item">
            <span class="label">年级：</span>
            <span class="value">{{ gradeLabel || '未设置' }}</span>
          </div>
          <div class="info-item">
            <span class="label">邮箱：</span>
            <span class="value">{{ userProfile.email || '未设置' }}</span>
          </div>
          <div class="info-item">
            <span class="label">手机：</span>
            <span class="value">{{ userProfile.phone || '未设置' }}</span>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 简化的编辑对话框 -->
    <el-dialog v-model="isEditing" title="编辑个人信息" width="600px">
      <el-form ref="profileFormRef" :model="userProfile" label-width="80px">
        <el-form-item label="姓名">
          <el-input v-model="userProfile.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="学号">
          <el-input v-model="userProfile.studentId" placeholder="请输入学号" />
        </el-form-item>
        <el-form-item label="学院">
          <el-select v-model="userProfile.college" placeholder="请选择学院">
            <el-option v-for="item in hit_college" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="年级">
          <el-select v-model="userProfile.grade" placeholder="请选择年级">
            <el-option v-for="item in hit_grade" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="专业">
          <el-input v-model="userProfile.major" placeholder="请输入专业" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="userProfile.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机">
          <el-input v-model="userProfile.phone" placeholder="请输入手机号" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="isEditing = false">取消</el-button>
          <el-button type="primary" @click="handleSave" :loading="loading">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="UserProfile">
import { ref, reactive, computed, onMounted, getCurrentInstance, toRefs } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, User, Edit, Share, Message, Phone, Link } from '@element-plus/icons-vue';
import { getCurrentUserProfile, updateUserProfile, addUserProfile } from '@/api/hit/userProfile';
import { getToken } from '@/utils/auth';
import { globalHeaders } from '@/utils/request';
import { getDicts } from '@/api/system/dict/data';
import { useDictStore } from '@/store/modules/dict';

const { proxy } = getCurrentInstance() as any;
const dictStore = useDictStore();

// 字典数据
const hit_college = ref([]);
const hit_grade = ref([]);

// 加载字典数据
const loadDictData = async () => {
  try {
    // 加载学院字典
    const collegeRes = await getDicts('hit_college');
    if (collegeRes.code === 200 && collegeRes.data) {
      const collegeData = collegeRes.data.map((item) => ({
        label: item.dictLabel,
        value: item.dictValue
      }));
      hit_college.value = collegeData;
      dictStore.setDict('hit_college', collegeData);
    }

    // 加载年级字典
    const gradeRes = await getDicts('hit_grade');
    if (gradeRes.code === 200 && gradeRes.data) {
      const gradeData = gradeRes.data.map((item) => ({
        label: item.dictLabel,
        value: item.dictValue
      }));
      hit_grade.value = gradeData;
      dictStore.setDict('hit_grade', gradeData);
    }

    console.log('字典数据加载完成:', { hit_college: hit_college.value, hit_grade: hit_grade.value });
  } catch (error) {
    console.error('字典数据加载失败:', error);
    hit_college.value = [];
    hit_grade.value = [];
  }
};

// 响应式数据
const profileFormRef = ref();
const isEditing = ref(false);
const loading = ref(false);
const uploadUrl = ref(import.meta.env.VITE_APP_BASE_API + '/resource/oss/upload');
const uploadHeaders = ref(globalHeaders());

// 用户档案数据
const userProfile = reactive({
  profileId: undefined,
  userId: undefined,
  studentId: '',
  realName: '',
  college: '',
  major: '',
  grade: '',
  className: '',
  phone: '',
  email: '',
  qq: '',
  wechat: '',
  github: '',
  linkedin: '',
  personalIntro: '',
  careerPlan: '',
  avatarUrl: '',
  coverUrl: '',
  reputationScore: 0,
  totalProjects: 0,
  completedProjects: 0,
  status: '0'
});

// 原始数据备份
const originalProfile = ref({});

// 表单验证规则
const rules = reactive({
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  studentId: [{ required: true, message: '请输入学号', trigger: 'blur' }],
  college: [{ required: true, message: '请选择学院', trigger: 'change' }],
  email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }],
  phone: [{ pattern: /^1[3456789]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }]
});

// 计算属性
const collegeLabel = computed(() => {
  if (!hit_college.value || !Array.isArray(hit_college.value)) {
    return '未设置学院';
  }
  const collegeDict = hit_college.value.find((item) => item.value === userProfile.college);
  return collegeDict ? collegeDict.label : '未设置学院';
});

const gradeLabel = computed(() => {
  if (!hit_grade.value || !Array.isArray(hit_grade.value)) {
    return '未设置年级';
  }
  const gradeDict = hit_grade.value.find((item) => item.value === userProfile.grade);
  return gradeDict ? gradeDict.label : '未设置年级';
});

// 方法
const loadUserProfile = async () => {
  try {
    loading.value = true;
    console.log('开始加载用户档案...');
    const response = await getCurrentUserProfile();
    console.log('用户档案API响应:', response);

    if (response && response.code === 200) {
      if (response.data) {
        Object.assign(userProfile, response.data);
        console.log('用户档案数据加载成功:', userProfile);
      } else {
        // 如果没有数据，说明用户还没有创建档案
        console.log('用户还没有创建档案，将使用默认值');
      }
    } else {
      console.error('获取用户档案失败:', response?.msg || '未知错误');
      ElMessage.error(response?.msg || '获取用户档案失败');
    }
  } catch (error) {
    console.error('获取用户档案失败:', error);
    ElMessage.error('获取用户档案失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

const toggleEdit = () => {
  if (isEditing.value) {
    // 取消编辑，恢复原始数据
    Object.assign(userProfile, originalProfile.value);
  } else {
    // 开始编辑，备份当前数据
    originalProfile.value = { ...userProfile };
  }
  isEditing.value = !isEditing.value;
};

const handleEdit = () => {
  originalProfile.value = { ...userProfile };
  isEditing.value = true;
};

const handleSave = async () => {
  try {
    await profileFormRef.value.validate();
    loading.value = true;

    let response;
    if (userProfile.profileId) {
      response = await updateUserProfile(userProfile);
    } else {
      response = await addUserProfile(userProfile);
    }

    if (response.code === 200) {
      ElMessage.success('保存成功');
      isEditing.value = false;
      await loadUserProfile();
    } else {
      ElMessage.error(response.msg || '保存失败');
    }
  } catch (error) {
    console.error('保存失败:', error);
    ElMessage.error('保存失败');
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  Object.assign(userProfile, originalProfile.value);
  isEditing.value = false;
};

const handleShare = () => {
  ElMessage.info('分享功能开发中...');
};

const handleAvatarSuccess = (response: any) => {
  if (response.code === 200) {
    userProfile.avatarUrl = response.data.url;
    ElMessage.success('头像上传成功');
  } else {
    ElMessage.error('头像上传失败');
  }
};

const beforeAvatarUpload = (file: File) => {
  const isImage = file.type.startsWith('image/');
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isImage) {
    ElMessage.error('只能上传图片文件!');
    return false;
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!');
    return false;
  }
  return true;
};

// 生命周期
onMounted(async () => {
  console.log('个人档案页面开始加载...');
  try {
    // 先加载字典数据
    await loadDictData();
    // 再加载用户档案数据
    await loadUserProfile();
    console.log('个人档案数据:', userProfile);
  } catch (error) {
    console.error('页面加载失败:', error);
  }
});
</script>

<style scoped lang="scss">
.user-profile-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);

  .loading-container {
    padding: 20px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .page-header {
    margin-bottom: 20px;
    background: white;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .page-title {
      display: flex;
      align-items: center;
      font-size: 24px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 8px;

      .title-icon {
        margin-right: 12px;
        color: #005bac;
      }
    }

    .page-description {
      color: #606266;
      font-size: 14px;
    }
  }

  .profile-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .card-title {
        font-weight: 600;
        font-size: 16px;
      }
    }

    .profile-info {
      .info-item {
        display: flex;
        margin-bottom: 16px;

        .label {
          width: 80px;
          font-weight: 500;
          color: #606266;
        }

        .value {
          color: #303133;
        }
      }
    }
  }
}
</style>
