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

    <!-- 进度指示器 -->
    <div class="progress-container">
      <div class="progress-steps">
        <div 
          v-for="(step, index) in steps" 
          :key="index"
          class="step"
          :class="{ 
            active: currentStep === index + 1, 
            completed: currentStep > index + 1 
          }"
        >
          <div class="step-icon">
            <el-icon>
              <component :is="step.icon" />
            </el-icon>
          </div>
          <span class="step-label">{{ step.label }}</span>
        </div>
        <div 
          v-for="index in steps.length - 1" 
          :key="`line-${index}`"
          class="step-line"
          :class="{ active: currentStep > index }"
        ></div>
      </div>
    </div>

    <!-- 分步表单内容 -->
    <div class="form-container">
      <div class="form-card">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" size="large">
          <!-- 第一步：基本信息 -->
          <div v-show="currentStep === 1" class="form-step">
            <div class="step-header">
              <h3 class="step-title">
                <el-icon><Document /></el-icon>
                项目基本信息
              </h3>
              <p class="step-description">请填写项目的基本信息，让团队成员了解您的项目</p>
            </div>

            <div class="form-content">
              <el-form-item label="项目名称" prop="projectName">
                <el-input v-model="form.projectName" placeholder="请输入项目名称" maxlength="50" show-word-limit />
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
                <el-input v-model="projectContent" type="textarea" :rows="8" placeholder="请输入项目的详细介绍..." />
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

            <div class="step-actions">
              <el-button type="primary" @click="nextStep" :disabled="!canProceedToStep(1)">
                下一步
                <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
          </div>

          <!-- 第二步：项目分类 -->
          <div v-show="currentStep === 2" class="form-step">
            <div class="step-header">
              <h3 class="step-title">
                <el-icon><Grid /></el-icon>
                项目分类设置
              </h3>
              <p class="step-description">选择项目类型和难度等级，添加相关技能标签</p>
            </div>

            <div class="form-content">
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
                <div class="difficulty-cards">
                  <div 
                    v-for="level in difficultyLevels" 
                    :key="level.value"
                    class="difficulty-card"
                    :class="{ selected: form.difficultyLevel === level.value }"
                    @click="selectDifficulty(level.value)"
                  >
                    <div class="difficulty-icon" :class="`difficulty-${level.class}`">
                      <el-icon><component :is="level.icon" /></el-icon>
                    </div>
                    <h4 class="difficulty-title">{{ level.label }}</h4>
                    <p class="difficulty-desc">{{ level.description }}</p>
                  </div>
                </div>
              </el-form-item>

              <el-form-item label="技能标签" prop="skillTags">
                <el-select v-model="extraFields.skillTags" multiple filterable allow-create placeholder="请选择或输入技能标签" style="width: 100%">
                  <el-option v-for="tag in skillTagOptions" :key="tag.value" :label="tag.label" :value="tag.value" />
                </el-select>
              </el-form-item>
            </div>

            <div class="step-actions">
              <el-button @click="prevStep">
                <el-icon><ArrowLeft /></el-icon>
                上一步
              </el-button>
              <el-button type="primary" @click="nextStep" :disabled="!canProceedToStep(2)">
                下一步
                <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
          </div>

          <!-- 第三步：团队信息 -->
          <div v-show="currentStep === 3" class="form-step">
            <div class="step-header">
              <h3 class="step-title">
                <el-icon><UserFilled /></el-icon>
                团队配置
              </h3>
              <p class="step-description">设置团队规模和招募岗位，寻找合适的团队成员</p>
            </div>

            <div class="form-content">
              <el-form-item label="团队规模" prop="teamSizeMax">
                <div class="team-size-selector">
                  <div 
                    v-for="size in teamSizes" 
                    :key="size.value"
                    class="team-size-card"
                    :class="{ selected: form.teamSizeMax === size.value }"
                    @click="selectTeamSize(size.value)"
                  >
                    <div class="team-size-icon">
                      <el-icon><User /></el-icon>
                    </div>
                    <div class="team-size-info">
                      <h4 class="team-size-number">{{ size.value }}人</h4>
                      <p class="team-size-desc">{{ size.description }}</p>
                    </div>
                  </div>
                </div>
              </el-form-item>

              <el-form-item label="当前成员" prop="currentMembers">
                <div class="current-members-info">
                  <el-input-number
                    v-model="extraFields.currentMembers"
                    :min="1"
                    :max="form.teamSizeMax"
                    placeholder="当前成员数"
                    style="width: 200px"
                    disabled
                  />
                  <span class="members-note">（项目负责人已包含）</span>
                </div>
              </el-form-item>

              <!-- 团队成员说明 -->
              <el-form-item>
                <div class="team-members-info">
                  <el-alert type="info" show-icon :closable="false" class="position-info">
                    <template #title>团队成员说明</template>
                    <template #default>
                      <div class="info-content">
                        <p>• 项目创建后，您将自动成为项目负责人</p>
                        <p>• 其他成员将默认设置为"组员"角色</p>
                        <p>• 成员加入后，您可以在成员管理页面自定义设置成员角色</p>
                      </div>
                    </template>
                  </el-alert>
                </div>
              </el-form-item>
            </div>

            <div class="step-actions">
              <el-button @click="prevStep">
                <el-icon><ArrowLeft /></el-icon>
                上一步
              </el-button>
              <el-button type="primary" @click="nextStep" :disabled="!canProceedToStep(3)">
                下一步
                <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
          </div>

          <!-- 第四步：项目设置 -->
          <div v-show="currentStep === 4" class="form-step">
            <div class="step-header">
              <h3 class="step-title">
                <el-icon><Setting /></el-icon>
                项目设置
              </h3>
              <p class="step-description">设置项目时间、状态和特殊标记，完善项目信息</p>
            </div>

            <div class="form-content">
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="开始时间" prop="startDate">
                    <el-date-picker v-model="form.startDate" type="date" placeholder="选择开始时间" style="width: 100%" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="结束时间" prop="endDate">
                    <el-date-picker v-model="form.endDate" type="date" placeholder="选择结束时间" style="width: 100%" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="招募截止" prop="recruitmentDeadline">
                    <el-date-picker v-model="extraFields.recruitmentDeadline" type="date" placeholder="招募截止时间" style="width: 100%" />
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

              <!-- <el-form-item label="特殊标记">
                <div class="special-flags">
                  <el-checkbox-group v-model="specialFlags">
                    <div class="flag-options">
                      <el-checkbox value="featured" class="flag-checkbox">
                        <div class="flag-content">
                          <el-icon><Star /></el-icon>
                          <span>精选项目</span>
                        </div>
                      </el-checkbox>
                      <el-checkbox value="urgent" class="flag-checkbox">
                        <div class="flag-content">
                          <el-icon><Warning /></el-icon>
                          <span>紧急招募</span>
                        </div>
                      </el-checkbox>
                      <el-checkbox value="credit" class="flag-checkbox">
                        <div class="flag-content">
                          <el-icon><Medal /></el-icon>
                          <span>学分认定</span>
                        </div>
                      </el-checkbox>
                    </div>
                  </el-checkbox-group>
                </div>
              </el-form-item> -->

              <el-form-item label="联系方式" prop="contactInfo">
                <el-input v-model="extraFields.contactInfo" placeholder="请输入联系方式（QQ、微信、邮箱等）" maxlength="100" />
              </el-form-item>
            </div>

            <div class="step-actions">
              <el-button @click="prevStep">
                <el-icon><ArrowLeft /></el-icon>
                上一步
              </el-button>
              <el-button type="primary" @click="nextStep" :disabled="!canProceedToStep(4)">
                下一步
                <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
          </div>

          <!-- 第五步：确认创建 -->
          <div v-show="currentStep === 5" class="form-step">
            <div class="step-header">
              <h3 class="step-title">
                <el-icon><Check /></el-icon>
                确认创建项目
              </h3>
              <p class="step-description">请确认项目信息无误后创建项目</p>
            </div>

            <div class="form-content">
              <div class="confirmation-summary">
                <!-- 基本信息确认 -->
                <div class="summary-section">
                  <h4 class="summary-title">
                    <el-icon><Document /></el-icon>
                    基本信息
                  </h4>
                  <div class="summary-content">
                    <div class="summary-item">
                      <span class="summary-label">项目名称：</span>
                      <span class="summary-value">{{ form.projectName }}</span>
                    </div>
                    <div class="summary-item">
                      <span class="summary-label">项目类型：</span>
                      <span class="summary-value">{{ getProjectTypeLabel(form.projectType) }}</span>
                    </div>
                    <div class="summary-item">
                      <span class="summary-label">难度等级：</span>
                      <span class="summary-value">{{ getDifficultyLabel(form.difficultyLevel) }}</span>
                    </div>
                    <div class="summary-item">
                      <span class="summary-label">团队规模：</span>
                      <span class="summary-value">{{ form.teamSizeMax }}人</span>
                    </div>
                  </div>
                </div>

                <!-- 技能标签确认 -->
                <div class="summary-section" v-if="extraFields.skillTags.length > 0">
                  <h4 class="summary-title">
                    <el-icon><Grid /></el-icon>
                    技能标签
                  </h4>
                  <div class="skill-tags-summary">
                    <el-tag v-for="tag in extraFields.skillTags" :key="tag" class="skill-tag">{{ tag }}</el-tag>
                  </div>
                </div>

                <!-- 团队成员确认 -->
                <div class="summary-section">
                  <h4 class="summary-title">
                    <el-icon><UserFilled /></el-icon>
                    团队成员
                  </h4>
                  <div class="positions-summary">
                    <div class="position-summary">
                      <div class="position-name">项目负责人</div>
                      <div class="position-count">1人</div>
                    </div>
                    <div class="position-summary">
                      <div class="position-name">组员</div>
                      <div class="position-count">{{ form.teamSizeMax - 1 }}人</div>
                    </div>
                  </div>
                </div>

                <!-- 项目描述预览 -->
                <div class="summary-section">
                  <h4 class="summary-title">
                    <el-icon><Document /></el-icon>
                    项目描述
                  </h4>
                  <div class="description-preview">
                    <p>{{ form.projectDescription }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="step-actions">
              <el-button @click="prevStep">
                <el-icon><ArrowLeft /></el-icon>
                上一步
              </el-button>
              <el-button type="primary" @click="handleSubmit" :loading="submitting">
                <el-icon><Plus /></el-icon>
                创建项目
              </el-button>
            </div>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { addProject, ProjectForm } from '@/api/hit/project';
import { getSkillTagList } from '@/api/hit/skillTag';
import { globalHeaders } from '@/utils/request';
import { 
  Document, 
  Grid, 
  UserFilled, 
  Setting, 
  Check, 
  ArrowLeft, 
  ArrowRight, 
  Plus, 
  User, 
  Star, 
  Warning, 
  Medal 
} from '@element-plus/icons-vue';

const router = useRouter();
const formRef = ref();
const editorRef = ref();
const submitting = ref(false);
const currentStep = ref(1);

// 步骤配置
const steps = ref([
  { label: '基本信息', icon: 'Document' },
  { label: '项目分类', icon: 'Grid' },
  { label: '团队配置', icon: 'UserFilled' },
  { label: '项目设置', icon: 'Setting' },
  { label: '确认创建', icon: 'Check' }
]);

// 难度等级配置
const difficultyLevels = ref([
  { 
    value: 1, 
    label: '入门', 
    description: '适合初学者，基础技能即可参与',
    class: 'beginner',
    icon: 'Star'
  },
  { 
    value: 2, 
    label: '进阶', 
    description: '需要一定经验，适合有基础的同学',
    class: 'intermediate',
    icon: 'TrendCharts'
  },
  { 
    value: 3, 
    label: '专业', 
    description: '需要专业技能，适合有经验的同学',
    class: 'advanced',
    icon: 'Lightning'
  },
  { 
    value: 4, 
    label: '挑战', 
    description: '高难度项目，需要专家级技能',
    class: 'expert',
    icon: 'Crown'
  }
]);

// 团队规模配置
const teamSizes = ref([
  { value: 2, description: '小型团队，适合简单项目' },
  { value: 3, description: '紧凑团队，沟通效率高' },
  { value: 4, description: '标准团队，分工明确' },
  { value: 5, description: '中型团队，功能完整' },
  { value: 6, description: '大型团队，适合复杂项目' }
]);

// 添加图片上传相关配置
const uploadUrl = ref(import.meta.env.VITE_APP_BASE_API + '/resource/oss/upload');
const uploadHeaders = ref(globalHeaders());

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
  recruitmentDeadline: '',
  contactInfo: ''
});

// 特殊标记
const specialFlags = ref<string[]>([]);

// 技能标签选项
const skillTagOptions = ref<{ label: string; value: string }[]>([]);

// 富文本编辑器相关（简化处理，不使用wangeditor）
const projectContent = ref('');

// 步骤导航方法
const nextStep = () => {
  if (currentStep.value < 5) {
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

// 检查是否可以进入下一步
const canProceedToStep = (step: number) => {
  switch (step) {
    case 1:
      return form.projectName && form.projectDescription;
    case 2:
      return form.projectType && form.difficultyLevel;
    case 3:
      return form.teamSizeMax && form.teamSizeMax > 0;
    case 4:
      return form.startDate && form.endDate;
    default:
      return true;
  }
};

// 选择难度等级
const selectDifficulty = (level: number) => {
  form.difficultyLevel = level;
};

// 选择团队规模
const selectTeamSize = (size: number) => {
  form.teamSizeMax = size;
};

// 获取项目类型标签
const getProjectTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    academic: '学术研究',
    competition: '竞赛项目',
    practice: '实践项目',
    graduation: '毕业设计',
    course: '课程项目'
  };
  return typeMap[type] || type;
};

// 获取难度等级标签
const getDifficultyLabel = (level: number) => {
  const levelMap: Record<number, string> = {
    1: '入门',
    2: '进阶',
    3: '专业',
    4: '挑战'
  };
  return levelMap[level] || '未选择';
};

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
  projectType: [{ required: true, message: '请选择项目类型', trigger: 'change' }],
  difficultyLevel: [{ required: true, message: '请选择难度等级', trigger: 'change' }],
  teamSizeMax: [{ required: true, message: '请输入团队规模', trigger: 'blur' }],
  startDate: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
  recruitmentStatus: [{ required: true, message: '请选择项目状态', trigger: 'change' }]
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
    skillTagOptions.value =
      response.data.rows?.map((tag: any) => ({
        label: tag.tagName!,
        value: tag.tagName!
      })) || [];
  } catch (error) {
    console.error('获取技能标签失败:', error);
  }
};

// 组员人数计算
const memberCount = computed(() => {
  return form.teamSizeMax > 1 ? form.teamSizeMax - 1 : 0;
});

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

    // 验证团队规模
    if (!form.teamSizeMax || form.teamSizeMax < 2) {
      ElMessage.error('团队规模至少需要2人（包括项目负责人）');
      return;
    }

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

    // 创建项目
    const projectResult = await addProject(form);
    const projectId = projectResult.data;

    if (projectId) {
      try {
        // 导入项目角色创建API
        const { createProjectRole } = await import('@/api/hit/project');

        // 创建默认的组员角色
        await createProjectRole({
          projectId: projectId,
          roleName: '组员',
          roleDescription: '项目组普通成员',
          requiredCount: form.teamSizeMax - 1, // 除去项目负责人
          isLeader: '0', // 不是领导角色
          status: '0' // 招募中
        });

        ElMessage.success('项目创建成功！');
      } catch (roleError) {
        console.warn('创建默认角色失败，但项目创建成功:', roleError);
        ElMessage.success('项目创建成功，但默认角色创建失败，您可以稍后在成员管理中设置');
      }
    } else {
      ElMessage.success('项目创建成功！');
    }

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

// 进度指示器
.progress-container {
  position: relative;
  padding: 30px 0;

  .progress-steps {
    display: flex;
    align-items: center;
    justify-content: center;
    max-width: 800px;
    margin: 0 auto;
    padding: 0 20px;

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;

      .step-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid rgba(255, 255, 255, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: rgba(255, 255, 255, 0.7);
        margin-bottom: 8px;
        transition: all 0.3s ease;
      }

      .step-label {
        color: rgba(255, 255, 255, 0.7);
        font-size: 14px;
        font-weight: 500;
        transition: all 0.3s ease;
      }

      &.active {
        .step-icon {
          background: rgba(255, 255, 255, 0.2);
          border-color: #fff;
          color: #fff;
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.4);
        }

        .step-label {
          color: #fff;
        }
      }

      &.completed {
        .step-icon {
          background: rgba(76, 175, 80, 0.2);
          border-color: #4caf50;
          color: #4caf50;
        }

        .step-label {
          color: #4caf50;
        }
      }
    }

    .step-line {
      width: 60px;
      height: 2px;
      background: rgba(255, 255, 255, 0.2);
      margin: 0 15px;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 0;
        background: #fff;
        transition: width 0.5s ease;
      }

      &.active::after {
        width: 100%;
      }
    }
  }
}

// 表单容器
.form-container {
  max-width: 1000px;
  margin: 30px auto;
  padding: 0 20px;

  .form-card {
    background: #fff;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    padding: 40px;
  }
}

// 表单步骤样式
.form-step {
  animation: fadeIn 0.3s ease-out;

  .step-header {
    text-align: center;
    margin-bottom: 30px;

    .step-title {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.8rem;
      font-weight: bold;
      color: #333;
      margin-bottom: 10px;

      .el-icon {
        margin-right: 10px;
        color: #667eea;
        font-size: 1.6rem;
      }
    }

    .step-description {
      color: #666;
      font-size: 1rem;
      margin: 0;
    }
  }

  .form-content {
    margin-bottom: 30px;
  }

  .step-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 20px;
    border-top: 1px solid #f0f0f0;

    .el-button {
      min-width: 100px;
      transition: all 0.3s ease;

      &.el-button--primary {
        background-color: #667eea;
        border-color: #667eea;

        &:hover {
          background-color: #5a6edb;
          border-color: #5a6edb;
        }

        &:disabled {
          opacity: 0.6;
        }
      }
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

// 难度等级卡片
.difficulty-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, auto);
  gap: 20px;
  margin-top: 16px;

  .difficulty-card {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 10px;
    padding: 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      border-color: #667eea;
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.15);
    }

    &.selected {
      border-color: #667eea;
      background: rgba(102, 126, 234, 0.05);
      box-shadow: 0 0 15px rgba(102, 126, 234, 0.2);
    }

    .difficulty-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 12px;
      font-size: 20px;
      color: white;

      &.difficulty-beginner {
        background: #4caf50;
      }

      &.difficulty-intermediate {
        background: #ff9800;
      }

      &.difficulty-advanced {
        background: #f44336;
      }

      &.difficulty-expert {
        background: #9c27b0;
      }
    }

    .difficulty-title {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      margin-bottom: 6px;
    }

    .difficulty-desc {
      font-size: 13px;
      color: #666;
      line-height: 1.4;
      margin: 0;
    }
  }
}

// 团队规模选择器
.team-size-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, auto);
  gap: 15px;
  margin-top: 16px;

  .team-size-card {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 10px;
    padding: 15px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 12px;

    &:hover {
      transform: translateY(-2px);
      border-color: #667eea;
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.15);
    }

    &.selected {
      border-color: #667eea;
      background: rgba(102, 126, 234, 0.05);
      box-shadow: 0 0 15px rgba(102, 126, 234, 0.2);
    }

    .team-size-icon {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #667eea;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 18px;
      flex-shrink: 0;
    }

    .team-size-info {
      flex: 1;

      .team-size-number {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin: 0 0 3px 0;
      }

      .team-size-desc {
        font-size: 12px;
        color: #666;
        margin: 0;
        line-height: 1.3;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
}

// 当前成员信息
.current-members-info {
  display: flex;
  align-items: center;
  gap: 12px;

  .members-note {
    color: #666;
    font-size: 14px;
  }
}

// 特殊标记样式
.special-flags {
  .flag-options {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;

    .flag-checkbox {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 10px;
      padding: 12px;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        border-color: #667eea;
        background: rgba(102, 126, 234, 0.05);
      }

      .flag-content {
        display: flex;
        align-items: center;
        gap: 10px;
        color: #333;

        .el-icon {
          color: #667eea;
          font-size: 16px;
        }

        span {
          font-weight: 500;
        }
      }
    }
  }
}

// 确认页面样式
.confirmation-summary {
  .summary-section {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 10px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    .summary-title {
      display: flex;
      align-items: center;
      font-size: 16px;
      font-weight: 600;
      color: #333;
      margin-bottom: 15px;
      border-bottom: 1px solid #e9ecef;
      padding-bottom: 10px;

      .el-icon {
        margin-right: 8px;
        color: #667eea;
      }
    }

    .summary-content {
      .summary-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .summary-label {
          color: #666;
          font-weight: 500;
        }

        .summary-value {
          color: #333;
          font-weight: 600;
        }
      }
    }

    .skill-tags-summary {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .skill-tag {
        background: rgba(102, 126, 234, 0.1);
        color: #667eea;
        border: 1px solid rgba(102, 126, 234, 0.3);
        border-radius: 20px;
        padding: 4px 12px;
        font-size: 12px;
        font-weight: 500;
      }
    }

    .positions-summary {
      .position-summary {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .position-name {
          color: #333;
          font-weight: 500;
        }

        .position-count {
          color: #667eea;
          font-weight: 600;
        }
      }
    }

    .description-preview {
      background: #f0f2f5;
      border-radius: 8px;
      padding: 15px;

      p {
        color: #333;
        line-height: 1.6;
        margin: 0;
      }
    }
  }
}

// 封面上传样式
.cover-uploader {
  .cover-image {
    width: 200px;
    height: 120px;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid #dcdfe6;
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
    background: #f8f9fa;

    &:hover {
      border-color: #667eea;
      background: rgba(102, 126, 234, 0.05);
    }

    .upload-icon {
      font-size: 28px;
      margin-bottom: 8px;
      color: #667eea;
    }

    .upload-text {
      font-size: 14px;
      color: #666;
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

.role-settings {
  .role-tip {
    margin-bottom: 20px;

    .el-alert {
      p {
        margin: 5px 0;
        line-height: 1.6;

        &:first-child {
          margin-top: 0;
        }

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }

  .role-list {
    .role-item {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
      padding: 15px;
      background-color: #f8f9fa;
      border-radius: 10px;
      border: 1px solid #e9ecef;
      transition: all 0.3s ease;

      &:hover {
        background-color: #f1f3f4;
        border-color: #667eea;
      }

      .el-input {
        margin-right: 10px;
      }

      .el-input-number {
        margin-right: 10px;
      }

      .el-input-number .el-input__inner {
        width: 100px;
      }

      .el-input-number .el-input__inner.is-disabled {
        background-color: #f5f7fa;
        border-color: #e9e9eb;
        color: #c0c4cc;
      }

      .el-tag {
        margin-right: 10px;
      }
    }

    .add-role-btn {
      margin-top: 10px;
      width: 100%;

      &.is-disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }
}

.recruitment-positions {
  .position-info {
    margin-bottom: 20px;

    .info-content {
      p {
        margin: 8px 0;
        line-height: 1.6;
        font-size: 14px;

        &:first-child {
          margin-top: 0;
        }

        &:last-child {
          margin-bottom: 0;
        }

        strong {
          color: #409eff;
          font-weight: 600;
        }
      }
    }
  }

  .position-items {
    margin-bottom: 20px;

    .position-item {
      margin-bottom: 20px;
      padding: 20px;
      background-color: #fafbfc;
      border-radius: 12px;
      border: 1px solid #e1e8ed;
      transition: all 0.3s ease;

      &:hover {
        background-color: #f5f7fa;
        border-color: #667eea;
        box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
      }

      .position-row {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        align-items: flex-end;

        .field-group {
          display: flex;
          flex-direction: column;

          .field-label {
            font-size: 13px;
            font-weight: 600;
            color: #606266;
            margin-bottom: 8px;
            white-space: nowrap;
          }

          &.action-group {
            justify-content: flex-end;
            padding-bottom: 4px;
          }
        }
      }
    }
  }

  .add-position-btn {
    width: 100%;
    height: 44px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 8px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    color: white;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    &:active {
      transform: translateY(0);
    }

    .el-icon {
      margin-right: 8px;
      font-size: 18px;
    }
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

// Element Plus 组件样式覆盖
:deep(.el-form-item__label) {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

:deep(.el-input__inner) {
  border-radius: 8px;
  color: #333;

  &::placeholder {
    color: #999;
  }
}

:deep(.el-textarea__inner) {
  border-radius: 8px;
  color: #333;

  &::placeholder {
    color: #999;
  }
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-date-editor) {
  width: 100%;
}

:deep(.el-radio-group) {
  .el-radio {
    color: #333;
    margin-right: 20px;

    .el-radio__input.is-checked .el-radio__inner {
      background-color: #667eea;
      border-color: #667eea;
    }
  }
}

:deep(.el-checkbox-group) {
  .el-checkbox {
    color: #333;

    .el-checkbox__input.is-checked .el-checkbox__inner {
      background-color: #667eea;
      border-color: #667eea;
    }
  }
}

:deep(.el-alert) {
  background: #f0f2f5;
  border: 1px solid #e9ecef;
  color: #333;

  .el-alert__title {
    color: #333;
    font-weight: 600;
  }

  .el-alert__content {
    color: #666;
  }
}
</style>
