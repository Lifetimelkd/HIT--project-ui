<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!-- 统计卡片 -->
      <el-col :span="24" class="mb-4">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-number">{{ statistics.total }}</div>
                <div class="stat-label">总任务数</div>
              </div>
              <el-icon class="stat-icon" color="#409EFF"><Document /></el-icon>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-number">{{ statistics.pending }}</div>
                <div class="stat-label">待处理</div>
              </div>
              <el-icon class="stat-icon" color="#E6A23C"><Clock /></el-icon>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-number">{{ statistics.inProgress }}</div>
                <div class="stat-label">进行中</div>
              </div>
              <el-icon class="stat-icon" color="#67C23A"><Loading /></el-icon>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-number">{{ statistics.completed }}</div>
                <div class="stat-label">已完成</div>
              </div>
              <el-icon class="stat-icon" color="#67C23A"><Check /></el-icon>
            </el-card>
          </el-col>
        </el-row>
      </el-col>

      <!-- 筛选区域 -->
      <el-col :span="24" class="mb-4">
        <el-card>
          <el-form :model="queryParams" :inline="true" label-width="80px">
            <el-form-item label="任务状态">
              <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 150px">
                <el-option label="全部" value="" />
                <el-option
                  v-for="dict in hit_task_status"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="优先级">
              <el-select v-model="queryParams.priority" placeholder="请选择优先级" clearable style="width: 150px">
                <el-option label="全部" value="" />
                <el-option
                  v-for="dict in hit_task_priority"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="到期时间">
              <el-date-picker
                v-model="daterangeDueDate"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
                style="width: 240px"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 任务列表 -->
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>我的任务</span>
              <el-button type="primary" icon="Plus" @click="handleAdd">新建任务</el-button>
            </div>
          </template>

          <el-table v-loading="loading" :data="taskList" border>
            <el-table-column label="任务名称" prop="taskName" min-width="200">
              <template #default="scope">
                <el-link type="primary" @click="handleTaskDetail(scope.row)">
                  {{ scope.row.taskName }}
                </el-link>
              </template>
            </el-table-column>
            <el-table-column label="项目" prop="projectName" width="150" />
            <el-table-column label="类型" prop="taskType" width="100">
              <template #default="scope">
                <dict-tag :options="hit_task_type" :value="scope.row.taskType" />
              </template>
            </el-table-column>
            <el-table-column label="优先级" prop="priority" width="100">
              <template #default="scope">
                <dict-tag :options="hit_task_priority" :value="scope.row.priority" />
              </template>
            </el-table-column>
            <el-table-column label="状态" prop="status" width="100">
              <template #default="scope">
                <dict-tag :options="hit_task_status" :value="scope.row.status" />
              </template>
            </el-table-column>
            <el-table-column label="进度" prop="progress" width="120">
              <template #default="scope">
                <el-progress :percentage="scope.row.progress" :stroke-width="8" />
              </template>
            </el-table-column>
            <el-table-column label="到期时间" prop="dueDate" width="120" />
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="scope">
                <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)">编辑</el-button>
                <el-button link type="success" icon="Check" @click="handleComplete(scope.row)" v-if="scope.row.status !== 'completed'">完成</el-button>
                <el-button link type="info" icon="View" @click="handleTaskDetail(scope.row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>

          <pagination
            v-show="total > 0"
            :total="total"
            v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize"
            @pagination="getList"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- 添加或修改任务对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="800px" append-to-body>
      <TaskForm
        v-if="dialog.visible"
        ref="taskFormRef"
        :task-data="dialog.data"
        :project-id="currentProjectId"
        @success="handleFormSuccess"
        @cancel="dialog.visible = false"
      />
    </el-dialog>
  </div>
</template>

<script setup name="MyTasks" lang="ts">
import { getCurrentInstance, ref, reactive, toRefs, onMounted, type ComponentInternalInstance } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus';
import { useRouter } from 'vue-router';
import { Document, Clock, Loading, Check } from '@element-plus/icons-vue';
import { getMyAssignedTasks, updateTask, updateTaskStatus } from '@/api/hit/project/task';
import { TaskVO, TaskQuery, TaskForm as TaskFormType } from '@/api/hit/project/task/types';
import TaskForm from './components/TaskForm.vue';
import { getProject } from '@/api/hit/project';
import { getUserProfileByUserId } from '@/api/hit/userProfile';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const router = useRouter();
const { hit_task_type, hit_task_priority, hit_task_status } = toRefs<any>(
  proxy?.useDict('hit_task_type', 'hit_task_priority', 'hit_task_status')
);

// 响应式数据
const taskList = ref<TaskVO[]>([]);
const loading = ref(true);
const total = ref(0);
const daterangeDueDate = ref<[string, string]>(['', '']);
const currentProjectId = ref<string>('');

// 统计数据
const statistics = ref({
  total: 0,
  pending: 0,
  inProgress: 0,
  completed: 0
});

// 查询参数
const queryParams = reactive<TaskQuery>({
  pageNum: 1,
  pageSize: 10,
  taskName: '',
  taskType: '',
  status: '',
  priority: '',
  assigneeId: '',
  projectId: '',
  parentTaskId: '',
  creatorId: '',
  isMilestone: '',
  beginStartDate: '',
  endStartDate: '',
  beginDueDate: '',
  endDueDate: ''
});

// 对话框数据
const dialog = reactive({
  visible: false,
  title: '',
  data: {} as TaskVO | TaskFormType
});

const taskFormRef = ref<InstanceType<typeof TaskForm>>();

/** 补充任务数据（项目名称和负责人名称） */
const enrichTaskData = async (tasks: TaskVO[]) => {
  if (!tasks || tasks.length === 0) return;
  
  try {
    // 收集所有需要查询的项目ID
    const projectIds = [...new Set(tasks.filter(task => task.projectId).map(task => task.projectId))];
    
    // 查询项目信息
    const projectMap = new Map<string, string>();
    for (const projectId of projectIds) {
      try {
        const projectResponse = await getProject(projectId);
        if (projectResponse.data) {
          projectMap.set(projectId, projectResponse.data.projectName || '');
        }
      } catch (error) {
        console.warn(`获取项目信息失败 (ID: ${projectId}):`, error);
      }
    }
    
    // 为任务补充项目名称信息
    tasks.forEach(task => {
      if (task.projectId && !task.projectName) {
        task.projectName = projectMap.get(task.projectId) || task.projectId;
      }
    });
  } catch (error) {
    console.warn('补充任务数据失败:', error);
  }
};

/** 查询任务列表 */
const getList = async () => {
  loading.value = true;
  try {
    if (daterangeDueDate.value && daterangeDueDate.value.length === 2) {
      queryParams.beginDueDate = daterangeDueDate.value[0];
      queryParams.endDueDate = daterangeDueDate.value[1];
    } else {
      queryParams.beginDueDate = '';
      queryParams.endDueDate = '';
    }

    const response = await getMyAssignedTasks(queryParams);
    // 统一处理响应数据格式：如果是分页格式用rows，否则用data
    const tasks = (response as any).rows || (response as any).data || [];
    
    taskList.value = tasks;
    total.value = (response as any).total || tasks.length;
    
    // 补充项目名称
    await enrichTaskData(taskList.value);
    
    // 计算统计数据
    updateStatistics();
  } catch (error) {
    console.error('获取任务列表失败:', error);
    ElMessage.error('获取任务列表失败');
  } finally {
    loading.value = false;
  }
};

/** 更新统计数据 */
const updateStatistics = () => {
  statistics.value.total = taskList.value.length;
  statistics.value.pending = taskList.value.filter(task => task.status === 'pending').length;
  statistics.value.inProgress = taskList.value.filter(task => task.status === 'in_progress').length;
  statistics.value.completed = taskList.value.filter(task => task.status === 'completed').length;
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  daterangeDueDate.value = ['', ''];
  Object.assign(queryParams, {
    pageNum: 1,
    pageSize: 10,
    taskName: '',
    taskType: '',
    status: '',
    priority: '',
    assigneeId: '',
    projectId: '',
    parentTaskId: '',
    creatorId: '',
    isMilestone: '',
    beginStartDate: '',
    endStartDate: '',
    beginDueDate: '',
    endDueDate: ''
  });
  handleQuery();
};

/** 新增按钮操作 */
const handleAdd = () => {
  dialog.title = '添加任务';
  dialog.data = {} as TaskFormType;
  dialog.visible = true;
};

/** 修改按钮操作 */
const handleUpdate = (row: TaskVO) => {
  dialog.title = '修改任务';
  dialog.data = { ...row };
  dialog.visible = true;
};

/** 完成任务 */
const handleComplete = async (row: TaskVO) => {
  try {
    await ElMessageBox.confirm('确认将此任务标记为已完成？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    await updateTaskStatus(row.taskId, 'completed');
    ElMessage.success('任务已完成');
    await getList();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败');
    }
  }
};

/** 任务详情 */
const handleTaskDetail = (row: TaskVO) => {
  // 跳转到任务详情页面
  router.push({
    path: '/hit/task/detail',
    query: { taskId: row.taskId }
  });
};

/** 表单提交成功 */
const handleFormSuccess = () => {
  dialog.visible = false;
  getList();
};

onMounted(() => {
  getList();
});
</script>

<style scoped>
.stat-card {
  position: relative;
  overflow: hidden;
}

.stat-content {
  position: relative;
  z-index: 2;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.stat-icon {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 40px;
  opacity: 0.3;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mb-4 {
  margin-bottom: 16px;
}
</style>
