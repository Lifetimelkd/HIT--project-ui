<template>
  <div class="apply-project-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <el-button @click="handleBack" class="back-btn">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h1 class="page-title">申请加入项目</h1>
        <p class="page-subtitle" v-if="projectInfo">{{ projectInfo.projectName }}</p>
      </div>
    </div>

    <!-- 项目信息概览 -->
    <div class="project-overview" v-if="projectInfo" v-loading="projectLoading">
      <el-card class="project-card">
        <div class="project-info">
          <div class="project-cover">
            <img :src="projectInfo.coverImage || '/default-project-cover.jpg'" :alt="projectInfo.projectName" />
          </div>
          <div class="project-details">
            <h3 class="project-name">{{ projectInfo.projectName }}</h3>
            <p class="project-description">{{ projectInfo.projectDescription }}</p>
            <div class="project-meta">
              <div class="meta-item">
                <el-icon><User /></el-icon>
                <span>负责人：{{ projectInfo.creatorName }}</span>
              </div>
              <div class="meta-item">
                <el-icon><UserFilled /></el-icon>
                <span>团队规模：{{ projectInfo.currentMembers }}/{{ projectInfo.teamSizeMax }}</span>
              </div>
              <div class="meta-item">
                <el-tag :type="getStatusType(projectInfo.recruitmentStatus!)">
                  {{ getStatusText(projectInfo.recruitmentStatus!) }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 申请表单 -->
    <div class="application-form">
      <el-card class="form-card">
        <template #header>
          <h3>
            <el-icon><Edit /></el-icon> 申请信息
          </h3>
        </template>

        <el-form ref="formRef" :model="applicationForm" :rules="formRules" label-width="120px" size="large">
          <el-form-item label="申请岗位" prop="roleId">
            <el-select v-model="applicationForm.roleId" placeholder="请选择您要申请的岗位" style="width: 100%" :loading="rolesLoading">
              <el-option
                v-for="role in availableRoles"
                :key="role.roleId"
                :label="`${role.roleName} (${role.currentCount}/${role.requiredCount})`"
                :value="role.roleId"
              >
                <div class="role-option">
                  <div class="role-name">{{ role.roleName }}</div>
                  <div class="role-info">
                    <span class="role-count">{{ role.currentCount }}/{{ role.requiredCount }}</span>
                    <span v-if="role.experienceRequired" class="role-exp">{{ role.experienceRequired }}</span>
                  </div>
                  <div v-if="role.roleDescription" class="role-desc">{{ role.roleDescription }}</div>
                </div>
              </el-option>
            </el-select>
            <div class="field-tip">请选择一个您感兴趣且符合要求的岗位</div>
          </el-form-item>

          <el-form-item label="申请理由" prop="applicationReason">
            <el-input
              v-model="applicationForm.applicationReason"
              type="textarea"
              :rows="4"
              placeholder="请详细说明您申请加入该项目的理由和动机"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="自我介绍" prop="selfIntroduction">
            <el-input
              v-model="applicationForm.selfIntroduction"
              type="textarea"
              :rows="4"
              placeholder="请介绍您的基本情况、专业背景、技能特长等"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="相关经验" prop="relevantExperience">
            <el-input
              v-model="applicationForm.relevantExperience"
              type="textarea"
              :rows="4"
              placeholder="请描述您在相关领域的项目经验、技术背景等"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="预期贡献" prop="expectedContribution">
            <el-input
              v-model="applicationForm.expectedContribution"
              type="textarea"
              :rows="3"
              placeholder="请说明您能为项目带来什么价值和贡献"
              maxlength="300"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="可投入时间" prop="availableTime">
            <el-input v-model="applicationForm.availableTime" placeholder="如：每周20小时，周末全天等" maxlength="100" />
          </el-form-item>

          <el-form-item label="联系方式" prop="contactInfo">
            <el-input v-model="applicationForm.contactInfo" placeholder="请提供QQ、微信、邮箱等联系方式" maxlength="200" />
          </el-form-item>

          <el-form-item label="简历附件">
            <el-upload
              class="resume-uploader"
              :action="uploadUrl"
              :headers="uploadHeaders"
              :show-file-list="false"
              :on-success="handleResumeSuccess"
              :before-upload="beforeResumeUpload"
              accept=".pdf,.doc,.docx"
            >
              <el-button type="primary" :loading="resumeUploading">
                <el-icon><Upload /></el-icon>
                {{ applicationForm.resumeUrl ? '重新上传简历' : '上传简历' }}
              </el-button>
              <div v-if="applicationForm.resumeUrl" class="upload-success">
                <el-icon><SuccessFilled /></el-icon>
                <span>简历已上传</span>
              </div>
            </el-upload>
            <div class="upload-tip">支持PDF、Word格式，大小不超过10MB</div>
          </el-form-item>

          <el-form-item label="作品集地址">
            <el-input v-model="applicationForm.portfolioUrl" placeholder="请提供GitHub、个人网站等作品展示地址（可选）" maxlength="500" />
          </el-form-item>

          <div class="form-actions">
            <el-button size="large" @click="handleCancel">取消申请</el-button>
            <el-button type="primary" size="large" @click="handleSubmit" :loading="submitting"> 提交申请 </el-button>
          </div>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getPublicProject, ProjectInfo, applyToProject, ApplicationForm, getAvailableProjectRoles, ProjectRole } from '@/api/hit/project';
import { globalHeaders } from '@/utils/request';

const router = useRouter();
const route = useRoute();
const formRef = ref();

const projectId = route.params.id as string;
const projectLoading = ref(false);
const submitting = ref(false);
const resumeUploading = ref(false);
const rolesLoading = ref(false);
const projectInfo = ref<ProjectInfo | null>(null);
const availableRoles = ref<ProjectRole[]>([]);

// 上传配置
const uploadUrl = ref(import.meta.env.VITE_APP_BASE_API + '/resource/oss/upload');
const uploadHeaders = ref(globalHeaders());

// 申请表单
const applicationForm = reactive<ApplicationForm>({
  projectId: projectId,
  roleId: '',
  applicationReason: '',
  selfIntroduction: '',
  relevantExperience: '',
  expectedContribution: '',
  availableTime: '',
  contactInfo: '',
  resumeUrl: '',
  portfolioUrl: ''
});

// 表单验证规则
const formRules = {
  roleId: [{ required: true, message: '请选择申请岗位', trigger: 'change' }],
  applicationReason: [
    { required: true, message: '请填写申请理由', trigger: 'blur' },
    { min: 20, max: 500, message: '申请理由长度在 20 到 500 个字符', trigger: 'blur' }
  ],
  selfIntroduction: [
    { required: true, message: '请填写自我介绍', trigger: 'blur' },
    { min: 20, max: 500, message: '自我介绍长度在 20 到 500 个字符', trigger: 'blur' }
  ],
  relevantExperience: [
    { required: true, message: '请填写相关经验', trigger: 'blur' },
    { min: 10, max: 500, message: '相关经验长度在 10 到 500 个字符', trigger: 'blur' }
  ],
  expectedContribution: [
    { required: true, message: '请填写预期贡献', trigger: 'blur' },
    { min: 10, max: 300, message: '预期贡献长度在 10 到 300 个字符', trigger: 'blur' }
  ],
  availableTime: [{ required: true, message: '请填写可投入时间', trigger: 'blur' }],
  contactInfo: [{ required: true, message: '请填写联系方式', trigger: 'blur' }]
};

// 获取项目信息
const getProjectInfo = async () => {
  projectLoading.value = true;
  try {
    const response = await getPublicProject(projectId);
    projectInfo.value = response.data;

    // 检查项目是否可申请
    if (projectInfo.value?.recruitmentStatus !== 'open') {
      ElMessage.warning('该项目暂不接受申请');
      router.back();
    }
  } catch (error) {
    console.error('获取项目信息失败:', error);
    ElMessage.error('获取项目信息失败');
    router.back();
  } finally {
    projectLoading.value = false;
  }
};

// 获取可申请岗位
const getAvailableRoles = async () => {
  rolesLoading.value = true;
  try {
    console.log('正在获取项目可用岗位，项目ID:', projectId);
    const response = await getAvailableProjectRoles(projectId);
    console.log('可用岗位API响应:', response);

    if (response && response.code === 200) {
      availableRoles.value = response.data || [];
      console.log('可用岗位列表:', availableRoles.value);
    } else {
      console.warn('获取可申请岗位响应异常:', response);
      availableRoles.value = [];
    }
  } catch (error) {
    console.error('获取可申请岗位失败:', error);
    ElMessage.error('获取可申请岗位失败');
  } finally {
    rolesLoading.value = false;
  }
};

// 简历上传成功
const handleResumeSuccess = (response: any) => {
  resumeUploading.value = false;
  if (response.code === 200) {
    applicationForm.resumeUrl = response.data.url;
    ElMessage.success('简历上传成功');
  } else {
    ElMessage.error('简历上传失败');
  }
};

// 简历上传前验证
const beforeResumeUpload = (file: File) => {
  const isValidType = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(
    file.type
  );
  const isLt10M = file.size / 1024 / 1024 < 10;

  if (!isValidType) {
    ElMessage.error('只能上传PDF、Word格式的文件!');
    return false;
  }
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过 10MB!');
    return false;
  }

  resumeUploading.value = true;
  return true;
};

// 提交申请
const handleSubmit = async () => {
  try {
    await formRef.value?.validate();

    await ElMessageBox.confirm('确定要提交申请吗？提交后将等待项目负责人审核。', '确认提交', {
      confirmButtonText: '确定提交',
      cancelButtonText: '再检查一下',
      type: 'success'
    });

    submitting.value = true;

    console.log('正在提交申请，表单数据:', applicationForm);
    await applyToProject(applicationForm);

    ElMessage.success('申请提交成功！请等待项目负责人审核。');
    router.push(`/hit/project/detail/${projectId}`);
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('提交申请失败:', error);
      ElMessage.error(error.message || '提交申请失败，请重试');
    }
  } finally {
    submitting.value = false;
  }
};

// 取消申请
const handleCancel = () => {
  ElMessageBox.confirm('确定要取消申请吗？已填写的信息将丢失。', '确认取消', {
    confirmButtonText: '确定',
    cancelButtonText: '继续填写',
    type: 'warning'
  }).then(() => {
    router.back();
  });
};

// 返回
const handleBack = () => {
  handleCancel();
};

// 工具函数
const getStatusType = (status: string): 'success' | 'warning' | 'danger' => {
  const types: Record<string, 'success' | 'warning' | 'danger'> = {
    open: 'success',
    paused: 'warning',
    closed: 'danger'
  };
  return types[status] || 'warning';
};

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    open: '招募中',
    paused: '暂停招募',
    closed: '招募结束'
  };
  return texts[status] || status;
};

// 生命周期
onMounted(() => {
  if (!projectId) {
    ElMessage.error('项目ID无效');
    router.back();
    return;
  }
  getProjectInfo();
  getAvailableRoles();
});
</script>

<style scoped lang="scss">
.apply-project-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-bottom: 40px;
}

.page-header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 30px 0;
  color: white;
  position: relative;

  .header-content {
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 20px;
    text-align: center;
  }

  .back-btn {
    position: absolute;
    left: 20px;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }

  .page-title {
    font-size: 2.5rem;
    font-weight: bold;
    margin: 0 0 10px 0;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .page-subtitle {
    font-size: 1.1rem;
    margin: 0;
    opacity: 0.9;
  }
}

.project-overview,
.application-form {
  max-width: 1000px;
  margin: 0 auto 30px auto;
  padding: 0 20px;

  .project-card,
  .form-card {
    border-radius: 15px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
    border: none;
  }
}

.project-info {
  display: flex;
  align-items: flex-start;
  gap: 20px;

  .project-cover {
    img {
      width: 150px;
      height: 100px;
      object-fit: cover;
      border-radius: 10px;
    }
  }

  .project-details {
    flex: 1;

    .project-name {
      font-size: 1.5rem;
      font-weight: bold;
      color: #333;
      margin: 0 0 10px 0;
    }

    .project-description {
      color: #666;
      line-height: 1.6;
      margin-bottom: 15px;
    }

    .project-meta {
      display: flex;
      gap: 20px;
      align-items: center;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 5px;
        color: #666;
        font-size: 0.9rem;

        .el-icon {
          font-size: 16px;
        }
      }
    }
  }
}

.form-card {
  :deep(.el-card__header) {
    border-bottom: 2px solid #f0f2f5;
    padding: 20px 25px;

    h3 {
      margin: 0;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1.2rem;
      color: #2c3e50;

      .el-icon {
        color: #667eea;
      }
    }
  }

  :deep(.el-card__body) {
    padding: 30px;
  }
}

.resume-uploader {
  .upload-success {
    margin-top: 10px;
    display: flex;
    align-items: center;
    gap: 5px;
    color: #67c23a;
    font-size: 0.9rem;
  }
}

.upload-tip {
  margin-top: 5px;
  font-size: 0.8rem;
  color: #999;
}

.field-tip {
  margin-top: 5px;
  font-size: 0.8rem;
  color: #666;
}

.role-option {
  padding: 8px 0;

  .role-name {
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 4px;
  }

  .role-info {
    display: flex;
    gap: 10px;
    margin-bottom: 4px;

    .role-count {
      color: #409eff;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .role-exp {
      color: #e6a23c;
      font-size: 0.85rem;
    }
  }

  .role-desc {
    color: #666;
    font-size: 0.85rem;
    line-height: 1.4;
  }
}

.form-actions {
  text-align: center;
  padding-top: 30px;
  border-top: 1px solid #f0f0f0;

  .el-button {
    min-width: 120px;
    margin: 0 10px;
  }
}

:deep(.el-form-item__label) {
  font-weight: 600;
  color: #333;
}

:deep(.el-textarea__inner) {
  border-radius: 8px;
  line-height: 1.6;
}

:deep(.el-input__inner) {
  border-radius: 8px;
}

// 响应式设计
@media (max-width: 768px) {
  .project-info {
    flex-direction: column;

    .project-cover {
      align-self: center;
    }
  }

  .project-meta {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 10px !important;
  }

  .page-header .page-title {
    font-size: 2rem;
  }
}
</style>
