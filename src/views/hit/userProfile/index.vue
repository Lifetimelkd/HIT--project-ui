<template>
  <div class="user-profile-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-section">
      <div class="glass-card">
        <el-skeleton :rows="8" animated />
      </div>
    </div>

    <!-- 页面内容 -->
    <div v-else>
      <!-- 页面头部 -->
      <div class="glass-card header-card">
        <!-- 来自项目申请的提示 -->
        <div v-if="isFromProjectApply" class="apply-notice">
          <el-alert
            title="完善个人档案后即可申请加入项目"
            description="请填写下方必填信息，完善后系统将自动返回项目申请页面"
            type="info"
            :closable="false"
            show-icon
            class="apply-alert"
          />
        </div>
        
        <div class="page-header">
          <div class="header-content">
            <div class="page-title">
              <el-icon class="title-icon"><User /></el-icon>
              个人档案管理
            </div>
            <div class="page-description">
              {{ isFromProjectApply ? '请完善以下必填信息以申请加入项目' : '完善您的个人信息，让团队更好地了解您' }}
            </div>
          </div>
          <div class="header-actions">
            <el-button v-if="isFromProjectApply && returnUrl" @click="handleReturnToProject" class="return-btn">
              <el-icon class="mr-2"><Close /></el-icon>
              返回项目
            </el-button>
            <el-button type="primary" @click="handleEdit" class="edit-btn">
              <el-icon class="mr-2"><Edit /></el-icon>
              {{ isFromProjectApply ? '立即完善' : '编辑资料' }}
            </el-button>
          </div>
        </div>
      </div>

      <!-- 简化的内容区域 -->
      <div class="glass-card profile-card">
        <div class="card-header">
          <h3 class="card-title">个人信息</h3>
          <div class="card-subtitle">您的基本信息展示</div>
        </div>

        <div class="profile-info">
          <div class="info-grid">
            <div class="info-item">
              <div class="info-card">
                <div class="info-icon">
                  <el-icon><User /></el-icon>
                </div>
                <div class="info-content">
                  <div class="label">姓名</div>
                  <div class="value">{{ userProfile.realName || '未设置' }}</div>
                </div>
              </div>
            </div>
            <div class="info-item">
              <div class="info-card">
                <div class="info-icon">
                  <el-icon><Message /></el-icon>
                </div>
                <div class="info-content">
                  <div class="label">学号</div>
                  <div class="value">{{ userProfile.studentId || '未设置' }}</div>
                </div>
              </div>
            </div>
            <div class="info-item">
              <div class="info-card">
                <div class="info-icon">
                  <el-icon><Share /></el-icon>
                </div>
                <div class="info-content">
                  <div class="label">学院</div>
                  <div class="value">{{ collegeLabel || '未设置学院' }}</div>
                </div>
              </div>
            </div>
            <div class="info-item">
              <div class="info-card">
                <div class="info-icon">
                  <el-icon><Plus /></el-icon>
                </div>
                <div class="info-content">
                  <div class="label">专业</div>
                  <div class="value">{{ userProfile.major || '未设置' }}</div>
                </div>
              </div>
            </div>
            <div class="info-item">
              <div class="info-card">
                <div class="info-icon">
                  <el-icon><Edit /></el-icon>
                </div>
                <div class="info-content">
                  <div class="label">年级</div>
                  <div class="value">{{ gradeLabel || '未设置年级' }}</div>
                </div>
              </div>
            </div>
            <div class="info-item">
              <div class="info-card">
                <div class="info-icon">
                  <el-icon><Message /></el-icon>
                </div>
                <div class="info-content">
                  <div class="label">邮箱</div>
                  <div class="value">{{ userProfile.email || '未设置' }}</div>
                </div>
              </div>
            </div>
            <div class="info-item">
              <div class="info-card">
                <div class="info-icon">
                  <el-icon><Phone /></el-icon>
                </div>
                <div class="info-content">
                  <div class="label">手机</div>
                  <div class="value">{{ userProfile.phone || '未设置' }}</div>
                </div>
              </div>
            </div>
            <div class="info-item">
              <div class="info-card">
                <div class="info-icon">
                  <el-icon><Plus /></el-icon>
                </div>
                <div class="info-content">
                  <div class="label">班级</div>
                  <div class="value">{{ userProfile.className || '未设置' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 简化的编辑对话框 -->
    <el-dialog v-model="isEditing" title="编辑个人信息" width="800px" class="profile-dialog">
      <div class="dialog-content">
        <el-form ref="profileFormRef" :model="userProfile" :rules="rules" label-width="100px" class="profile-form">
          <div class="form-grid">
            <el-form-item label="姓名" prop="realName">
              <el-input v-model="userProfile.realName" placeholder="请输入真实姓名" />
            </el-form-item>
            <el-form-item label="学号" prop="studentId">
              <el-input v-model="userProfile.studentId" placeholder="请输入学号" />
            </el-form-item>
            <el-form-item label="学院" prop="college">
              <el-select v-model="userProfile.college" placeholder="请选择学院" style="width: 100%">
                <el-option v-for="item in hit_college" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="年级" prop="grade">
              <el-select v-model="userProfile.grade" placeholder="请选择年级" style="width: 100%">
                <el-option v-for="item in hit_grade" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="专业" prop="major">
              <el-input v-model="userProfile.major" placeholder="请输入专业" />
            </el-form-item>
            <el-form-item label="班级" prop="className">
              <el-input v-model="userProfile.className" placeholder="请输入班级" />
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="userProfile.email" placeholder="请输入邮箱" />
            </el-form-item>
            <el-form-item label="手机" prop="phone">
              <el-input v-model="userProfile.phone" placeholder="请输入手机号" />
            </el-form-item>
            <el-form-item label="QQ号" prop="qq">
              <el-input v-model="userProfile.qq" placeholder="请输入QQ号" />
            </el-form-item>
            <el-form-item label="微信号" prop="wechat">
              <el-input v-model="userProfile.wechat" placeholder="请输入微信号" />
            </el-form-item>
            <el-form-item label="GitHub" prop="github">
              <el-input v-model="userProfile.github" placeholder="请输入GitHub地址" />
            </el-form-item>
            <el-form-item label="LinkedIn" prop="linkedin">
              <el-input v-model="userProfile.linkedin" placeholder="请输入LinkedIn地址" />
            </el-form-item>
          </div>
          <el-form-item label="个人简介" prop="personalIntro">
            <el-input v-model="userProfile.personalIntro" type="textarea" :rows="3" placeholder="请输入个人简介" />
          </el-form-item>
          <el-form-item label="职业规划" prop="careerPlan">
            <el-input v-model="userProfile.careerPlan" type="textarea" :rows="3" placeholder="请输入职业规划" />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCancel" class="cancel-btn">
            <el-icon class="mr-2"><Close /></el-icon>
            取消
          </el-button>
          <el-button type="primary" @click="handleSave" :loading="loading" class="submit-btn">
            <el-icon class="mr-2"><Check /></el-icon>
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="UserProfile">
import { ref, reactive, computed, onMounted, getCurrentInstance, toRefs } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, User, Edit, Share, Message, Phone, Link, Close, Check } from '@element-plus/icons-vue';
import { getCurrentUserProfile, updateUserProfile, addUserProfile } from '@/api/hit/userProfile';
import { getToken } from '@/utils/auth';
import { globalHeaders } from '@/utils/request';
import { getDicts } from '@/api/system/dict/data';
import { useDictStore } from '@/store/modules/dict';

const { proxy } = getCurrentInstance() as any;
const dictStore = useDictStore();
const router = useRouter();
const route = useRoute();

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

// 路由参数处理
const returnUrl = ref('');
const isFromProjectApply = ref(false);

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
  realName: [{ required: true, message: '真实姓名不能为空', trigger: 'blur' }],
  studentId: [{ required: true, message: '学号不能为空', trigger: 'blur' }],
  college: [{ required: true, message: '所属学院不能为空', trigger: 'change' }],
  major: [{ required: true, message: '专业不能为空', trigger: 'blur' }],
  grade: [{ required: true, message: '年级不能为空', trigger: 'change' }],
  className: [{ required: false, message: '班级不能为空', trigger: 'blur' }],
  phone: [
    { required: true, message: '手机号不能为空', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ] as any,   
  email: [
    { required: false, message: '邮箱不能为空', trigger: 'blur' },
    { type: 'email' as const, message: '请输入正确的邮箱格式', trigger: 'blur' }
  ] as any,
  qq: [
    { required: false, message: 'QQ号不能为空', trigger: 'blur' },
    { pattern: /^[1-9]\d{4,10}$/, message: '请输入正确的QQ号格式', trigger: 'blur' }
  ] as any,
  wechat: [{ required: false, message: '微信号不能为空', trigger: 'blur' }],
  github: [{ required: false, message: 'GitHub地址不能为空', trigger: 'blur' }],
  linkedin: [{ required: false, message: 'LinkedIn地址不能为空', trigger: 'blur' }],
  personalIntro: [
    { required: false, message: '个人简介不能为空', trigger: 'blur' },
    { min: 10, max: 500, message: '个人简介长度应在10-500个字符之间', trigger: 'blur' }
  ] as any,
  careerPlan: [
    { required: false, message: '职业规划不能为空', trigger: 'blur' },
    { min: 10, max: 500, message: '职业规划长度应在10-500个字符之间', trigger: 'blur' }
  ] as any
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

// 初始化路由参数
const initRouteParams = () => {
  // 检查是否从项目申请页面跳转过来
  const returnParam = route.query.return as string;
  const actionParam = route.query.action as string;
  
  if (returnParam) {
    returnUrl.value = decodeURIComponent(returnParam);
    isFromProjectApply.value = actionParam === 'complete';
    console.log('检测到返回参数:', { returnUrl: returnUrl.value, isFromProjectApply: isFromProjectApply.value });
  }
};

// 返回项目页面
const handleReturnToProject = () => {
  if (returnUrl.value) {
    router.push(returnUrl.value);
  } else {
    router.back();
  }
};

// 检查档案完整性并处理返回
const checkProfileCompleteAndReturn = async () => {
  if (!isFromProjectApply.value || !returnUrl.value) return;
  
  // 检查必填项是否都已填写
  const requiredFields = ['realName', 'studentId', 'college', 'major', 'grade', 'phone'];
  const isComplete = requiredFields.every(field => {
    const value = userProfile[field];
    return value && (typeof value === 'string' ? value.trim() !== '' : true);
  });
  
  if (isComplete) {
    // 档案已完整，提示用户可以返回申请
    await ElMessageBox.confirm(
      '您的个人档案已完善！现在可以申请加入项目了。',
      '档案完善成功',
      {
        confirmButtonText: '立即申请',
        cancelButtonText: '稍后再说',
        type: 'success',
        center: true
      }
    );
    
    // 返回项目页面
    router.push(returnUrl.value);
  }
};

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
      
      // 如果是从项目申请页面跳转过来的，检查是否可以返回
      try {
        await checkProfileCompleteAndReturn();
      } catch (error) {
        // 用户取消返回操作，忽略错误
        if (error !== 'cancel') {
          console.warn('检查档案完整性时出错:', error);
        }
      }
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
    // 初始化路由参数
    initRouteParams();
    
    // 先加载字典数据
    await loadDictData();
    // 再加载用户档案数据
    await loadUserProfile();
    console.log('个人档案数据:', userProfile);
    
    // 如果是从项目申请跳转过来且档案不完整，自动打开编辑模式
    if (isFromProjectApply.value) {
      const requiredFields = ['realName', 'studentId', 'college', 'major', 'grade', 'phone'];
      const hasIncompleteFields = requiredFields.some(field => {
        const value = userProfile[field];
        return !value || (typeof value === 'string' && value.trim() === '');
      });
      
      if (hasIncompleteFields) {
        console.log('检测到档案不完整，自动进入编辑模式');
        // 延迟一下，让页面先渲染完成
        setTimeout(() => {
          handleEdit();
        }, 500);
      }
    }
  } catch (error) {
    console.error('页面加载失败:', error);
  }
});
</script>

<style scoped lang="scss">
.user-profile-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;

  .loading-section {
    margin-bottom: 20px;
  }

  .glass-card {
    background: #ffffff;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    margin-bottom: 20px;

    &:hover {
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }

    &.header-card {
      .apply-notice {
        margin-bottom: 20px;
        
        .apply-alert {
          border-radius: 8px;
          border: 1px solid #b3d8ff;
          background: #ecf5ff;
          
          :deep(.el-alert__icon) {
            color: #409eff;
          }
          
          :deep(.el-alert__title) {
            color: #303133;
            font-weight: 600;
          }
          
          :deep(.el-alert__description) {
            color: #606266;
            margin-top: 4px;
          }
        }
      }
      
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 20px;

        .header-content {
          flex: 1;

          .page-title {
            display: flex;
            align-items: center;
            font-size: 24px;
            font-weight: 600;
            color: #303133;
            margin-bottom: 8px;

            .title-icon {
              margin-right: 12px;
              color: #409eff;
            }
          }

          .page-description {
            color: #909399;
            font-size: 14px;
          }
        }

        .header-actions {
          display: flex;
          gap: 12px;
          
          .edit-btn, .return-btn {
            border-radius: 4px;
            padding: 12px 20px;
          }
          
          .return-btn {
            background: #f5f7fa;
            border-color: #dcdfe6;
            color: #606266;
            
            &:hover {
              background: #ecf5ff;
              border-color: #b3d8ff;
              color: #409eff;
            }
          }
        }
      }
    }

    &.profile-card {
      .card-header {
        margin-bottom: 24px;
        padding-bottom: 20px;
        border-bottom: 1px solid #ebeef5;

        .card-title {
          font-size: 20px;
          font-weight: 600;
          color: #303133;
          margin: 0 0 8px 0;
        }

        .card-subtitle {
          color: #909399;
          font-size: 14px;
          margin: 0;
        }
      }

      .profile-info {
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;

          .info-item {
            .info-card {
              background: #fafbfc;
              border: 1px solid #e4e7ed;
              border-radius: 6px;
              padding: 20px;
              display: flex;
              align-items: center;
              gap: 16px;
              transition: all 0.3s ease;

              &:hover {
                background: #f5f7fa;
                border-color: #c0c4cc;
              }

              .info-icon {
                width: 40px;
                height: 40px;
                background: #409eff;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #fff;
                font-size: 18px;
                flex-shrink: 0;
              }

              .info-content {
                flex: 1;
                min-width: 0;

                .label {
                  font-size: 12px;
                  color: #909399;
                  margin-bottom: 4px;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                  font-weight: 500;
                }

                .value {
                  font-size: 16px;
                  font-weight: 500;
                  color: #303133;
                  word-break: break-all;
                }
              }
            }
          }
        }
      }
    }
  }
}

// 对话框样式
:deep(.profile-dialog) {
  .el-dialog {
    background: #ffffff;
    border: 1px solid #ebeef5;
    border-radius: 8px;

    .el-dialog__header {
      background: #f5f7fa;
      border-bottom: 1px solid #ebeef5;

      .el-dialog__title {
        color: #303133;
        font-weight: 600;
        font-size: 18px;
      }
    }

    .el-dialog__body {
      background: #ffffff;

      .dialog-content {
        .profile-form {
          .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
          }

          .el-form-item {
            margin-bottom: 20px;

            .el-form-item__label {
              color: #606266;
              font-weight: 500;
            }
          }
        }
      }
    }

    .el-dialog__footer {
      background: #f5f7fa;
      border-top: 1px solid #ebeef5;

      .dialog-footer {
        text-align: center;

        .submit-btn, .cancel-btn {
          border-radius: 4px;
          padding: 12px 24px;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .user-profile-container {
    padding: 12px;

    .glass-card {
      padding: 16px;

      &.header-card {
        .page-header {
          flex-direction: column;
          gap: 16px;
          text-align: center;

          .header-content {
            .page-title {
              justify-content: center;
            }
          }
        }
      }

      &.profile-card {
        .profile-info {
          .info-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
        }
      }
    }
  }

  :deep(.profile-dialog) {
    .el-dialog {
      width: 95% !important;
      margin: 20px auto !important;

      .dialog-content {
        .profile-form {
          .form-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }
      }
    }
  }
}

// 动画效果
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.glass-card {
  animation: fadeInUp 0.6s ease-out;
}

// 滚动条样式
:deep(::-webkit-scrollbar) {
  width: 6px;
  height: 6px;
}

:deep(::-webkit-scrollbar-track) {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

:deep(::-webkit-scrollbar-thumb) {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;

  &:hover {
    background: rgba(255, 255, 255, 0.5);
  }
}
</style>
