<template>
  <div class="create-project-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <el-button @click="handleBack" class="back-btn">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h1 class="page-title">创建项目</h1>
        <p class="page-subtitle">发布您的项目，寻找志同道合的团队成员</p>
      </div>
    </div>

    <!-- 创建表单 -->
    <div class="form-container">
      <el-card class="form-card">
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="120px"
          size="large"
        >
          <!-- 基本信息 -->
          <div class="form-section">
            <h3 class="section-title">
              <el-icon><Document /></el-icon>
              基本信息
            </h3>
            
            <el-form-item label="项目名称" prop="projectName">
              <el-input
                v-model="form.projectName"
                placeholder="请输入项目名称"
                maxlength="50"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="项目描述" prop="projectDescription">
              <el-input
                v-model="form.projectDescription"
                type="textarea"
                :rows="4"
                placeholder="请简要描述您的项目"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="详细介绍" prop="projectContent">
              <el-input
                v-model="projectContent"
                type="textarea"
                :rows="8"
                placeholder="请输入项目的详细介绍..."
              />
            </el-form-item>

            <el-form-item label="项目封面">
              <el-upload
                class="cover-uploader"
                :show-file-list="false"
                :on-success="handleCoverSuccess"
                :before-upload="beforeCoverUpload"
                :action="uploadUrl"
                :headers="uploadHeaders"
              >
                <img v-if="form.coverImage" :src="form.coverImage" class="cover-image" />
                <div v-else class="upload-placeholder">
                  <el-icon class="upload-icon"><Plus /></el-icon>
                  <div class="upload-text">上传封面</div>
                </div>
              </el-upload>
            </el-form-item>
          </div>

          <!-- 项目分类 -->
          <div class="form-section">
            <h3 class="section-title">
              <el-icon><Grid /></el-icon>
              项目分类
            </h3>

            <el-form-item label="项目类型" prop="projectType">
              <el-select v-model="form.projectType" placeholder="请选择项目类型">
                <el-option label="学术研究" value="academic" />
                <el-option label="竞赛项目" value="competition" />
                <el-option label="实践项目" value="practice" />
                <el-option label="毕业设计" value="graduation" />
                <el-option label="课程项目" value="course" />
              </el-select>
            </el-form-item>

            <el-form-item label="难度等级" prop="difficultyLevel">
              <el-select v-model="form.difficultyLevel" placeholder="请选择难度等级">
                <el-option label="入门" :value="1" />
                <el-option label="进阶" :value="2" />
                <el-option label="专业" :value="3" />
                <el-option label="挑战" :value="4" />
              </el-select>
            </el-form-item>

            <el-form-item label="技能标签" prop="skillTags">
              <el-select
                v-model="extraFields.skillTags"
                multiple
                filterable
                allow-create
                placeholder="请选择或输入技能标签"
                style="width: 100%"
              >
                <el-option
                  v-for="tag in skillTagOptions"
                  :key="tag.value"
                  :label="tag.label"
                  :value="tag.value"
                />
              </el-select>
            </el-form-item>
          </div>

          <!-- 团队信息 -->
          <div class="form-section">
            <h3 class="section-title">
              <el-icon><UserFilled /></el-icon>
              团队信息
            </h3>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="团队规模" prop="teamSizeMax">
                  <el-input-number
                    v-model="form.teamSizeMax"
                    :min="2"
                    :max="20"
                    placeholder="最大成员数"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="当前成员" prop="currentMembers">
                  <el-input-number
                    v-model="extraFields.currentMembers"
                    :min="1"
                    :max="form.teamSizeMax"
                    placeholder="当前成员数"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="招募岗位">
              <div class="position-list">
                <div
                  v-for="(position, index) in extraFields.recruitmentPositions"
                  :key="index"
                  class="position-item"
                >
                  <el-input
                    v-model="position.positionName"
                    placeholder="岗位名称"
                    style="width: 200px; margin-right: 10px"
                  />
                  <el-input-number
                    v-model="position.requiredCount"
                    :min="1"
                    :max="10"
                    placeholder="需求人数"
                    style="width: 120px; margin-right: 10px"
                  />
                  <el-input
                    v-model="position.requirements"
                    placeholder="岗位要求"
                    style="width: 300px; margin-right: 10px"
                  />
                  <el-button
                    type="danger"
                    @click="removePosition(index)"
                    :disabled="extraFields.recruitmentPositions.length <= 1"
                  >
                    删除
                  </el-button>
                </div>
                <el-button type="primary" @click="addPosition" class="add-position-btn">
                  <el-icon><Plus /></el-icon>
                  添加岗位
                </el-button>
              </div>
            </el-form-item>
          </div>

          <!-- 项目设置 -->
          <div class="form-section">
            <h3 class="section-title">
              <el-icon><Setting /></el-icon>
              项目设置
            </h3>

            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="开始时间" prop="startDate">
                  <el-date-picker
                    v-model="form.startDate"
                    type="date"
                    placeholder="选择开始时间"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="结束时间" prop="endDate">
                  <el-date-picker
                    v-model="form.endDate"
                    type="date"
                    placeholder="选择结束时间"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="招募截止" prop="recruitmentDeadline">
                  <el-date-picker
                    v-model="extraFields.recruitmentDeadline"
                    type="date"
                    placeholder="招募截止时间"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="项目状态" prop="recruitmentStatus">
              <el-radio-group v-model="form.recruitmentStatus">
                <el-radio value="open">开放招募</el-radio>
                <el-radio value="paused">暂停招募</el-radio>
                <el-radio value="closed">关闭招募</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="特殊标记">
              <el-checkbox-group v-model="specialFlags">
                <el-checkbox value="featured">精选项目</el-checkbox>
                <el-checkbox value="urgent">紧急招募</el-checkbox>
                <el-checkbox value="credit">学分认定</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="联系方式" prop="contactInfo">
              <el-input
                v-model="extraFields.contactInfo"
                placeholder="请输入联系方式（QQ、微信、邮箱等）"
                maxlength="100"
              />
            </el-form-item>
          </div>

          <!-- 提交按钮 -->
          <div class="form-actions">
            <el-button size="large" @click="handleCancel">取消</el-button>
            <el-button type="primary" size="large" @click="handleSubmit" :loading="submitting">
              创建项目
            </el-button>
          </div>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { addProject, ProjectForm } from '@/api/hit/project';
import { getSkillTagList } from '@/api/hit/skillTag';
import { globalHeaders } from '@/utils/request';

// 引入富文本编辑器
// import { Editor } from '@wangeditor/editor';
// import '@wangeditor/editor/dist/css/style.css';

const router = useRouter();
const formRef = ref();
const editorRef = ref();
const submitting = ref(false);

// 添加图片上传相关配置
const uploadUrl = ref(import.meta.env.VITE_APP_BASE_API + '/resource/oss/upload')
const uploadHeaders = ref(globalHeaders())

// 表单数据
const form = reactive<ProjectForm>({
  projectName: '',
  projectDescription: '',
  projectBackground: '',
  projectGoals: '',
  expectedOutcome: '',
  coverImage: '',
  projectType: '',
  difficultyLevel: undefined,
  teamSizeMax: 5,
  recruitmentStatus: 'open',
  startDate: '',
  endDate: '',
  visibility: 'public',
  approvalMode: 'auto'
});

// 额外的表单字段（不在ProjectForm中但需要的）
const extraFields = reactive({
  skillTags: [] as string[],
  currentMembers: 1,
  recruitmentPositions: [
    {
      positionName: '',
      requiredCount: 1,
      requirements: ''
    }
  ],
  recruitmentDeadline: '',
  contactInfo: ''
});

// 特殊标记
const specialFlags = ref<string[]>([]);

// 技能标签选项
const skillTagOptions = ref<{ label: string; value: string }[]>([]);

// 富文本编辑器相关（简化处理，不使用wangeditor）
const projectContent = ref('');

// 表单验证规则
const rules = {
  projectName: [
    { required: true, message: '请输入项目名称', trigger: 'blur' },
    { min: 2, max: 50, message: '项目名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  projectDescription: [
    { required: true, message: '请输入项目描述', trigger: 'blur' },
    { min: 10, max: 200, message: '项目描述长度在 10 到 200 个字符', trigger: 'blur' }
  ],
  projectType: [
    { required: true, message: '请选择项目类型', trigger: 'change' }
  ],
  difficultyLevel: [
    { required: true, message: '请选择难度等级', trigger: 'change' }
  ],
  teamSizeMax: [
    { required: true, message: '请输入团队规模', trigger: 'blur' }
  ],
  startDate: [
    { required: true, message: '请选择开始时间', trigger: 'change' }
  ],
  endDate: [
    { required: true, message: '请选择结束时间', trigger: 'change' }
  ],
  recruitmentStatus: [
    { required: true, message: '请选择项目状态', trigger: 'change' }
  ]
};

// 初始化富文本编辑器（简化处理）
const initEditor = () => {
  // 简化处理，使用普通textarea
  console.log('编辑器初始化');
};

// 获取技能标签选项
const getSkillTagOptions = async () => {
  try {
    const response = await getSkillTagList({ pageNum: 1, pageSize: 100 });
    skillTagOptions.value = response.data.rows?.map((tag: any) => ({
      label: tag.tagName!,
      value: tag.tagName!
    })) || [];
  } catch (error) {
    console.error('获取技能标签失败:', error);
  }
};

// 添加招募岗位
const addPosition = () => {
  extraFields.recruitmentPositions.push({
    positionName: '',
    requiredCount: 1,
    requirements: ''
  });
};

// 删除招募岗位
const removePosition = (index: number) => {
  extraFields.recruitmentPositions.splice(index, 1);
};

// 封面上传成功
const handleCoverSuccess = (response: any) => {
  if (response.code === 200) {
    form.coverImage = response.data.url;
    ElMessage.success('封面上传成功');
  } else {
    ElMessage.error('封面上传失败');
  }
};

// 封面上传前验证
const beforeCoverUpload = (file: File) => {
  const isImage = file.type.startsWith('image/');
  const isLt5M = file.size / 1024 / 1024 < 5;

  if (!isImage) {
    ElMessage.error('只能上传图片文件!');
    return false;
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!');
    return false;
  }
  return true;
};

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value?.validate();
    
    submitting.value = true;
    
    // 处理特殊标记
    form.isFeatured = specialFlags.value.includes('featured') ? '1' : '0';
    form.isUrgent = specialFlags.value.includes('urgent') ? '1' : '0';
    form.isCredit = specialFlags.value.includes('credit') ? '1' : '0';
    
    // 处理日期格式
    if (form.startDate) {
      form.startDate = new Date(form.startDate).toISOString().split('T')[0];
    }
    if (form.endDate) {
      form.endDate = new Date(form.endDate).toISOString().split('T')[0];
    }
    
    // 设置项目背景为详细介绍内容
    form.projectBackground = projectContent.value;
    
    await addProject(form);
    
    ElMessage.success('项目创建成功！');
    router.push('/hit/project');
  } catch (error) {
    console.error('创建项目失败:', error);
    ElMessage.error('创建项目失败，请检查表单信息');
  } finally {
    submitting.value = false;
  }
};

// 取消创建
const handleCancel = () => {
  ElMessageBox.confirm('确定要取消创建吗？已填写的信息将丢失。', '确认取消', {
    confirmButtonText: '确定',
    cancelButtonText: '继续编辑',
    type: 'warning'
  }).then(() => {
    router.back();
  });
};

// 返回上一页
const handleBack = () => {
  handleCancel();
};

// 生命周期
onMounted(() => {
  getSkillTagOptions();
  initEditor();
});
</script>

<style scoped lang="scss">
.create-project-container {
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
    max-width: 1200px;
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

.form-container {
  max-width: 1000px;
  margin: 30px auto;
  padding: 0 20px;

  .form-card {
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    border-radius: 15px;
    overflow: hidden;
  }
}

.form-section {
  margin-bottom: 40px;
  
  &:last-child {
    margin-bottom: 0;
  }

  .section-title {
    display: flex;
    align-items: center;
    font-size: 1.3rem;
    color: #333;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid #f0f0f0;

    .el-icon {
      margin-right: 8px;
      color: #667eea;
    }
  }
}

.editor-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;

  .editor {
    min-height: 300px;
  }
}

.cover-uploader {
  .cover-image {
    width: 200px;
    height: 120px;
    object-fit: cover;
    border-radius: 8px;
  }

  .upload-placeholder {
    width: 200px;
    height: 120px;
    border: 2px dashed #d3d3d3;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      border-color: #667eea;
      color: #667eea;
    }

    .upload-icon {
      font-size: 28px;
      margin-bottom: 8px;
    }

    .upload-text {
      font-size: 14px;
    }
  }
}

.position-list {
  .position-item {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
  }

  .add-position-btn {
    margin-top: 10px;
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

:deep(.el-input__inner) {
  border-radius: 8px;
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-textarea__inner) {
  border-radius: 8px;
}

:deep(.el-date-editor) {
  width: 100%;
}
</style> 