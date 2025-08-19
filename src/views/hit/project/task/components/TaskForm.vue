<template>
  <div class="task-form">
    <el-form
      ref="taskFormRef"
      :model="form"
      :rules="rules as any"
      label-width="100px"
      v-loading="loading"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="关联项目" prop="projectId" required>
            <el-input
              v-model="selectedProjectName"
              placeholder="请选择项目"
              readonly
              @click="showProjectDialog = true"
              style="cursor: pointer"
            >
              <template #suffix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="任务名称" prop="taskName">
            <el-input
              v-model="form.taskName"
              placeholder="请输入任务名称"
              maxlength="100"
              show-word-limit
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="父任务" prop="parentTaskId">
            <el-input
              v-model="selectedParentTaskName"
              placeholder="请选择父任务"
              readonly
              @click="handleSelectParentTask"
              style="cursor: pointer"
              clearable
              @clear="clearParentTask"
              :disabled="!form.projectId"
            >
              <template #suffix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <!-- 这里可以放其他字段 -->
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="任务类型" prop="taskType">
            <el-select v-model="form.taskType" placeholder="请选择任务类型" style="width: 100%">
              <el-option
                v-for="dict in hit_task_type"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="优先级" prop="priority">
            <el-select v-model="form.priority" placeholder="请选择优先级" style="width: 100%">
              <el-option
                v-for="dict in hit_task_priority"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="状态" prop="status">
            <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
              <el-option
                v-for="dict in hit_task_status"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="负责人" prop="assigneeId">
            <el-input
              v-model="selectedAssigneeName"
              placeholder="请选择负责人"
              readonly
              @click="handleSelectAssignee"
              style="cursor: pointer"
              clearable
              @clear="clearAssignee"
              :disabled="!form.projectId"
            >
              <template #suffix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="预估工时" prop="estimatedHours">
            <el-input-number
              v-model="form.estimatedHours"
              :min="0"
              :max="999"
              :precision="2"
              placeholder="预估工时"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="进度" prop="progress">
            <el-slider
              v-model="form.progress"
              :min="0"
              :max="100"
              show-input
              :show-input-controls="false"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="开始日期" prop="startDate">
            <el-date-picker
              v-model="form.startDate"
              type="date"
              placeholder="选择开始日期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="截止日期" prop="dueDate">
            <el-date-picker
              v-model="form.dueDate"
              type="date"
              placeholder="选择截止日期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="24">
          <el-form-item label="任务描述" prop="taskDescription">
            <el-input
              v-model="form.taskDescription"
              type="textarea"
              placeholder="请输入任务描述"
              :rows="4"
              maxlength="1000"
              show-word-limit
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="标签" prop="tags">
            <el-input
              v-model="form.tags"
              placeholder="请输入标签，多个标签用逗号分隔"
              maxlength="500"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="里程碑">
            <el-switch
              v-model="isMilestone"
              active-text="是"
              inactive-text="否"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <!-- 表单操作按钮 -->
    <div class="form-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="loading">
        {{ isEdit ? '更新' : '创建' }}
      </el-button>
    </div>

    <!-- 项目选择对话框 -->
    <el-dialog
      v-model="showProjectDialog"
      title="选择项目"
      width="800px"
      @opened="loadUserProjects"
    >
      <div class="project-search">
        <el-input
          v-model="projectSearchKeyword"
          placeholder="搜索项目名称"
          clearable
          @input="filterProjects"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      <el-table
        :data="filteredProjects"
        stripe
        @current-change="handleProjectSelection"
        style="width: 100%; margin-top: 20px"
        max-height="400px"
        highlight-current-row
      >
        <el-table-column prop="projectName" label="项目名称" show-overflow-tooltip />
        <el-table-column prop="projectType" label="项目类型" width="100" />
        <el-table-column prop="status" label="状态" width="80" />
        <el-table-column prop="createTime" label="创建时间" width="120" />
      </el-table>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showProjectDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmProjectSelection" :disabled="!selectedProject">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 成员选择对话框 -->
    <el-dialog
      v-model="showMemberDialog"
      title="选择负责人"
      width="600px"
      @opened="loadProjectMembers"
    >
      <div class="member-search">
        <el-input
          v-model="memberSearchKeyword"
          placeholder="搜索成员姓名"
          clearable
          @input="filterMembers"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      <el-table
        :data="filteredMembers"
        stripe
        @current-change="handleMemberSelection"
        style="width: 100%; margin-top: 20px"
        max-height="400px"
        highlight-current-row
      >
        <el-table-column prop="userName" label="成员姓名" />
        <el-table-column prop="memberRole" label="角色" />
        <el-table-column prop="joinTime" label="加入时间" width="120" />
      </el-table>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showMemberDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmMemberSelection" :disabled="!selectedMember">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 父任务选择对话框 -->
    <el-dialog
      v-model="showParentTaskDialog"
      title="选择父任务"
      width="800px"
      @opened="loadAvailableParentTasks"
    >
      <div class="task-search">
        <el-input
          v-model="taskSearchKeyword"
          placeholder="搜索任务名称"
          clearable
          @input="filterTasks"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      <el-table
        :data="filteredTasks"
        stripe
        @current-change="handleTaskSelection"
        style="width: 100%; margin-top: 20px"
        max-height="400px"
        highlight-current-row
      >
        <el-table-column prop="taskName" label="任务名称" show-overflow-tooltip />
        <el-table-column prop="taskType" label="类型" width="100" />
        <el-table-column prop="status" label="状态" width="80" />
        <el-table-column prop="dueDate" label="截止日期" width="120" />
      </el-table>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showParentTaskDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmTaskSelection" :disabled="!selectedTask">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, getCurrentInstance, type ComponentInternalInstance } from 'vue';
import { ElMessage, type FormInstance } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import { toRefs } from 'vue';
import { addTask, updateTask, getAvailableParentTasks } from '@/api/hit/project/task';
import { TaskVO, TaskForm as TaskFormType } from '@/api/hit/project/task/types';
import { listMyMemberProjects, getProjectMemberList, type ProjectInfo, type MemberInfo } from '@/api/hit/project';

// Props
interface Props {
  taskData?: TaskVO | TaskFormType;
  projectId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  taskData: () => ({} as TaskFormType),
  projectId: ''
});

// Emits
const emit = defineEmits<{
  success: [];
  cancel: [];
}>();

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { hit_task_type, hit_task_priority, hit_task_status } = toRefs<any>(
  proxy?.useDict('hit_task_type', 'hit_task_priority', 'hit_task_status')
);

// 响应式数据
const loading = ref(false);
const taskFormRef = ref<FormInstance>();

// 对话框控制
const showProjectDialog = ref(false);
const showMemberDialog = ref(false);
const showParentTaskDialog = ref(false);

// 搜索关键词
const projectSearchKeyword = ref('');
const memberSearchKeyword = ref('');
const taskSearchKeyword = ref('');

// 选中的数据
const selectedProject = ref<ProjectInfo | null>(null);
const selectedMember = ref<MemberInfo | null>(null);
const selectedTask = ref<TaskVO | null>(null);

// 显示的名称
const selectedProjectName = ref('');
const selectedAssigneeName = ref('');
const selectedParentTaskName = ref('');

// 数据列表
const projectList = ref<ProjectInfo[]>([]);
const memberList = ref<MemberInfo[]>([]);
const taskList = ref<TaskVO[]>([]);

// 表单数据
const form = reactive<TaskFormType>({
  taskId: undefined,
  projectId: props.projectId || '',
  parentTaskId: '',
  taskName: '',
  taskDescription: '',
  taskType: 'feature',
  priority: 'medium',
  status: 'todo',
  progress: 0,
  assigneeId: '',
  creatorId: '',
  estimatedHours: 0,
  actualHours: 0,
  startDate: '',
  dueDate: '',
  completedDate: '',
  dependencies: '',
  tags: '',
  attachments: '',
  isMilestone: '0',
  userId: '',
  deptId: ''
});

// 计算属性
const isEdit = computed(() => !!form.taskId);

const isMilestone = computed({
  get: () => form.isMilestone === '1',
  set: (value: boolean) => {
    form.isMilestone = value ? '1' : '0';
  }
});

// 过滤后的数据
const filteredProjects = computed(() => {
  if (!projectSearchKeyword.value) return projectList.value;
  return projectList.value.filter(project =>
    project.projectName?.toLowerCase().includes(projectSearchKeyword.value.toLowerCase())
  );
});

const filteredMembers = computed(() => {
  if (!memberSearchKeyword.value) return memberList.value;
  return memberList.value.filter(member =>
    member.userName?.toLowerCase().includes(memberSearchKeyword.value.toLowerCase())
  );
});

const filteredTasks = computed(() => {
  if (!taskSearchKeyword.value) return taskList.value;
  return taskList.value.filter(task =>
    task.taskName?.toLowerCase().includes(taskSearchKeyword.value.toLowerCase())
  );
});

// 表单验证规则
const rules = reactive({
  projectId: [
    { required: true, message: '请选择关联项目', trigger: 'change' }
  ],
  taskName: [
    { required: true, message: '请输入任务名称', trigger: 'blur' },
    { min: 1 as number, max: 100 as number, message: '长度在 1 到 100 个字符', trigger: 'blur' }
  ],
  taskType: [
    { required: true, message: '请选择任务类型', trigger: 'change' }
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ],
  progress: [
    { type: 'number' as const, min: 0, max: 100, message: '进度必须在 0-100 之间', trigger: 'blur' }
  ],
  estimatedHours: [
    { type: 'number' as const, min: 0, message: '预估工时不能小于0', trigger: 'blur' }
  ],
  dueDate: [
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (value && form.startDate && new Date(value) < new Date(form.startDate)) {
          callback(new Error('截止日期不能早于开始日期'));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ]
});

// 方法定义
const loadUserProjects = async () => {
  try {
    loading.value = true;
    const response = await listMyMemberProjects({ pageNum: 1, pageSize: 100 });
    // 正确处理API响应数据
    projectList.value = (response as any).rows || (response as any).data || [];
    console.log("projectList", projectList.value);
    
    // 如果用户只关联一个项目，自动选中但仍需显示
    if (projectList.value.length === 1 && !form.projectId) {
      selectedProject.value = projectList.value[0];
      selectedProjectName.value = projectList.value[0].projectName || '';
      form.projectId = projectList.value[0].projectId || '';
    }
  } catch (error) {
    console.error('获取项目列表失败:', error);
    ElMessage.error('获取项目列表失败');
  } finally {
    loading.value = false;
  }
};

const loadProjectMembers = async () => {
  if (!form.projectId) return;
  
  try {
    loading.value = true;
    const response = await getProjectMemberList(form.projectId, 1, 100);
    // 正确处理API响应数据
    memberList.value = (response as any).rows || (response as any).data || [];
  } catch (error) {
    console.error('获取项目成员失败:', error);
    ElMessage.error('获取项目成员失败');
  } finally {
    loading.value = false;
  }
};

const loadAvailableParentTasks = async () => {
  if (!form.projectId) return;
  
  try {
    loading.value = true;
    const response = await getAvailableParentTasks(form.projectId);
    taskList.value = response.data || [];
    
    // 如果是编辑模式，排除自己
    if (form.taskId) {
      taskList.value = taskList.value.filter(task => task.taskId !== form.taskId);
    }
  } catch (error) {
    console.error('获取可选父任务失败:', error);
    ElMessage.error('获取可选父任务失败');
  } finally {
    loading.value = false;
  }
};

const handleProjectSelection = (project: ProjectInfo) => {
  selectedProject.value = project;
};

const handleMemberSelection = (member: MemberInfo) => {
  selectedMember.value = member;
};

const handleTaskSelection = (task: TaskVO) => {
  selectedTask.value = task;
};

const confirmProjectSelection = () => {
  if (selectedProject.value) {
    selectedProjectName.value = selectedProject.value.projectName || '';
    form.projectId = selectedProject.value.projectId || '';
    showProjectDialog.value = false;
    
    // 清空依赖项目的选择
    clearAssignee();
    clearParentTask();
  }
};

const confirmMemberSelection = () => {
  if (selectedMember.value) {
    selectedAssigneeName.value = selectedMember.value.userName || '';
    form.assigneeId = selectedMember.value.userId || '';
    showMemberDialog.value = false;
  }
};

const confirmTaskSelection = () => {
  if (selectedTask.value) {
    selectedParentTaskName.value = selectedTask.value.taskName || '';
    form.parentTaskId = selectedTask.value.taskId || '';
    showParentTaskDialog.value = false;
  }
};

const handleSelectParentTask = () => {
  if (!form.projectId) {
    ElMessage.warning('请先选择关联项目');
    return;
  }
  showParentTaskDialog.value = true;
};

const handleSelectAssignee = () => {
  if (!form.projectId) {
    ElMessage.warning('请先选择关联项目');
    return;
  }
  showMemberDialog.value = true;
};

const clearParentTask = () => {
  selectedParentTaskName.value = '';
  form.parentTaskId = '';
  selectedTask.value = null;
};

const clearAssignee = () => {
  selectedAssigneeName.value = '';
  form.assigneeId = '';
  selectedMember.value = null;
};

const filterProjects = () => {
  // 触发计算属性重新计算
};

const filterMembers = () => {
  // 触发计算属性重新计算
};

const filterTasks = () => {
  // 触发计算属性重新计算
};

// 监听props变化
watch(
  () => props.taskData,
  (newData) => {
    if (newData) {
      Object.assign(form, newData);
      // 设置显示名称 - 使用类型断言
      const taskVO = newData as any;
      if (taskVO.projectName) {
        selectedProjectName.value = taskVO.projectName;
      }
      if (taskVO.assigneeName) {
        selectedAssigneeName.value = taskVO.assigneeName;
      }
      if (taskVO.parentTaskName) {
        selectedParentTaskName.value = taskVO.parentTaskName;
      }
    }
  },
  { immediate: true }
);

// 提交表单
const submitForm = async () => {
  if (!taskFormRef.value) return;
  
  await taskFormRef.value.validate(async (valid) => {
    if (!valid) return;
    
    try {
      loading.value = true;
      if (isEdit.value) {
        await updateTask(form);
        ElMessage.success('更新任务成功');
      } else {
        await addTask(form);
        ElMessage.success('创建任务成功');
      }
      emit('success');
    } catch (error) {
      console.error('保存任务失败:', error);
      ElMessage.error('保存任务失败');
    } finally {
      loading.value = false;
    }
  });
};

const handleCancel = () => {
  emit('cancel');
};

// 暴露方法给父组件
defineExpose({
  submitForm,
  handleCancel
});

// 初始化
onMounted(() => {
  // 如果没有传入projectId，则需要用户选择项目
  if (!props.projectId) {
    // 自动加载用户项目列表
    loadUserProjects();
  } else {
    // 如果有projectId，设置对应的项目名称
    form.projectId = props.projectId;
  }
});
</script>

<style scoped lang="scss">
.task-form {
  .form-footer {
    margin-top: 24px;
    text-align: right;
    border-top: 1px solid #e4e7ed;
    padding-top: 16px;
    
    .el-button {
      margin-left: 12px;
    }
  }
  
  .dialog-footer {
    text-align: right;
  }
  
  .project-search,
  .member-search,
  .task-search {
    margin-bottom: 16px;
  }
  
  .el-input {
    &[readonly] {
      cursor: pointer;
    }
  }
}
</style>
