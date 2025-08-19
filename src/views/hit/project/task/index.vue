<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!-- 搜索区域 -->
      <el-col :span="24" class="search-wrapper">
        <el-form :model="queryParams" ref="queryFormRef" :inline="true" v-show="showSearch" label-width="68px">
          <el-form-item label="任务名称" prop="taskName">
            <el-input
              v-model="queryParams.taskName"
              placeholder="请输入任务名称"
              clearable
              style="width: 200px"
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="任务类型" prop="taskType">
            <el-select v-model="queryParams.taskType" placeholder="请选择任务类型" clearable style="width: 150px">
              <el-option
                v-for="dict in hit_task_type"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="优先级" prop="priority">
            <el-select v-model="queryParams.priority" placeholder="请选择优先级" clearable style="width: 150px">
              <el-option
                v-for="dict in hit_task_priority"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 150px">
              <el-option
                v-for="dict in hit_task_status"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="负责人" prop="assigneeId">
            <el-select v-model="queryParams.assigneeId" placeholder="请选择负责人" clearable style="width: 150px">
              <el-option
                v-for="user in userList"
                :key="user.userId"
                :label="user.nickName"
                :value="user.userId"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="截止日期" style="width: 308px">
            <el-date-picker
              v-model="daterangeDueDate"
              value-format="YYYY-MM-DD"
              type="daterange"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            ></el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </el-col>

      <!-- 操作按钮区域 -->
      <el-col :span="24" class="toolbar-wrapper">
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
              type="primary"
              plain
              icon="Plus"
              @click="handleAdd"
              v-hasPermi="['hit:project:task:add']"
            >新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="success"
              plain
              icon="Edit"
              :disabled="single"
              @click="handleUpdate()"
              v-hasPermi="['hit:project:task:edit']"
            >修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="danger"
              plain
              icon="Delete"
              :disabled="multiple"
              @click="handleDelete()"
              v-hasPermi="['hit:project:task:remove']"
            >删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="warning"
              plain
              icon="Download"
              @click="handleExport"
              v-hasPermi="['hit:project:task:export']"
            >导出</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="info"
              plain
              icon="View"
              @click="handleKanbanView"
            >看板视图</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </el-col>

      <!-- 任务列表 -->
      <el-col :span="24">
        <el-table 
          v-loading="loading" 
          :data="taskList" 
          @selection-change="handleSelectionChange"
          @row-click="handleRowClick"
          row-key="taskId"
        >
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="任务名称" prop="taskName" :show-overflow-tooltip="true" min-width="200">
            <template #default="scope">
              <div class="task-name-cell">
                <el-tag v-if="scope.row.isMilestone === '1'" type="warning" size="small" class="milestone-tag">
                  里程碑
                </el-tag>
                <span class="task-name" @click="handleTaskDetail(scope.row)">{{ scope.row.taskName }}</span>
                <el-tag v-if="scope.row.subTaskCount > 0" type="info" size="small" class="subtask-tag">
                  {{ scope.row.subTaskCount }}个子任务
                </el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="项目" prop="projectName" :show-overflow-tooltip="true" width="150" />
          <el-table-column label="类型" prop="taskType" width="100" align="center">
            <template #default="scope">
              <dict-tag :options="hit_task_type" :value="scope.row.taskType" />
            </template>
          </el-table-column>
          <el-table-column label="优先级" prop="priority" width="100" align="center">
            <template #default="scope">
              <dict-tag :options="hit_task_priority" :value="scope.row.priority" />
            </template>
          </el-table-column>
          <el-table-column label="状态" prop="status" width="100" align="center">
            <template #default="scope">
              <dict-tag :options="hit_task_status" :value="scope.row.status" />
            </template>
          </el-table-column>
          <el-table-column label="进度" prop="progress" width="120" align="center">
            <template #default="scope">
              <el-progress 
                :percentage="scope.row.progress" 
                :color="getProgressColor(scope.row.progress)"
                :stroke-width="8"
              />
            </template>
          </el-table-column>
          <el-table-column label="负责人" prop="assigneeName" width="100" align="center" />
          <el-table-column label="截止日期" prop="dueDate" width="120" align="center">
            <template #default="scope">
              <span v-if="scope.row.dueDate" :class="getDueDateClass(scope.row.dueDate, scope.row.status)">
                {{ scope.row.dueDate }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="评论" prop="commentCount" width="80" align="center">
            <template #default="scope">
              <el-badge :value="scope.row.commentCount" :hidden="scope.row.commentCount === 0">
                <el-icon><ChatDotRound /></el-icon>
              </el-badge>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width">
            <template #default="scope">
              <el-tooltip content="修改" placement="top">
                <el-button 
                  link 
                  type="primary" 
                  icon="Edit" 
                  @click.stop="handleUpdate(scope.row)" 
                  v-hasPermi="['hit:project:task:edit']"
                ></el-button>
              </el-tooltip>
              <el-tooltip content="删除" placement="top">
                <el-button 
                  link 
                  type="danger" 
                  icon="Delete" 
                  @click.stop="handleDelete(scope.row)" 
                  v-hasPermi="['hit:project:task:remove']"
                ></el-button>
              </el-tooltip>
              <el-tooltip content="分配" placement="top">
                <el-button 
                  link 
                  type="warning" 
                  icon="User" 
                  @click.stop="handleAssign(scope.row)" 
                  v-hasPermi="['hit:project:task:assign']"
                ></el-button>
              </el-tooltip>
              <el-tooltip content="复制" placement="top">
                <el-button 
                  link 
                  type="info" 
                  icon="CopyDocument" 
                  @click.stop="handleCopy(scope.row)" 
                  v-hasPermi="['hit:project:task:add']"
                ></el-button>
              </el-tooltip>
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
      </el-col>
    </el-row>

    <!-- 添加或修改任务对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="800px" append-to-body>
      <TaskForm
        v-if="dialog.visible"
        ref="taskFormRef"
        :task-data="dialog.data"
        :project-id="String(currentProjectId)"
        @success="handleFormSuccess"
        @cancel="dialog.visible = false"
      />
    </el-dialog>

    <!-- 任务分配对话框 -->
    <el-dialog title="分配任务" v-model="assignDialog.visible" width="400px" append-to-body>
      <el-form :model="assignForm" label-width="80px">
        <el-form-item label="负责人" required>
          <el-select v-model="assignForm.assigneeId" placeholder="请选择负责人" style="width: 100%">
            <el-option
              v-for="user in userList"
              :key="user.userId"
              :label="user.nickName"
              :value="user.userId"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="assignDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="handleAssignConfirm">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="TaskList" lang="ts">
import { getCurrentInstance, ref, reactive, toRefs, onMounted, type ComponentInternalInstance } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus';
import { useRouter, useRoute } from 'vue-router';
import { ChatDotRound } from '@element-plus/icons-vue';
import { listTask, delTask, assignTask, copyTask } from '@/api/hit/project/task';
import { TaskVO, TaskQuery, TaskForm as TaskFormType } from '@/api/hit/project/task/types';
import TaskForm from './components/TaskForm.vue';
import { getProject } from '@/api/hit/project';
import { getUserProfileByUserId } from '@/api/hit/userProfile';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const router = useRouter();
const route = useRoute();
const { hit_task_type, hit_task_priority, hit_task_status } = toRefs<any>(
  proxy?.useDict('hit_task_type', 'hit_task_priority', 'hit_task_status')
);

// 响应式数据
const taskList = ref<TaskVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const daterangeDueDate = ref<[string, string]>(['', '']);
const userList = ref<any[]>([]);
const currentProjectId = ref<string | number>('');

// 查询参数
const queryParams = ref<TaskQuery>({
  pageNum: 1,
  pageSize: 10,
  taskName: '',
  taskType: '',
  priority: '',
  status: '',
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

// 分配对话框数据
const assignDialog = reactive({
  visible: false
});

const assignForm = reactive({
  taskIds: [] as Array<string>,
  assigneeId: ''
});

const queryFormRef = ref<FormInstance>();
const taskFormRef = ref<InstanceType<typeof TaskForm>>();

/** 补充任务数据（项目名称和负责人名称） */
const enrichTaskData = async (tasks: TaskVO[]) => {
  if (!tasks || tasks.length === 0) return;
  
  try {
    // 收集所有需要查询的项目ID和用户ID
    const projectIds = [...new Set(tasks.filter(task => task.projectId).map(task => task.projectId))];
    const userIds = [...new Set(tasks.filter(task => task.assigneeId).map(task => task.assigneeId))];
    
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
    
    // 查询用户信息
    const userMap = new Map<string, string>();
    for (const userId of userIds) {
      try {
        const userResponse = await getUserProfileByUserId(userId);
        if (userResponse.data) {
          userMap.set(userId, userResponse.data.realName || userId);
        }
      } catch (error) {
        console.warn(`获取用户信息失败 (ID: ${userId}):`, error);
      }
    }
    
    // 为任务补充名称信息
    tasks.forEach(task => {
      if (task.projectId && !task.projectName) {
        task.projectName = projectMap.get(task.projectId) || task.projectId;
      }
      if (task.assigneeId && !task.assigneeName) {
        task.assigneeName = userMap.get(task.assigneeId) || task.assigneeId;
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
    // 处理日期范围
    if (daterangeDueDate.value && daterangeDueDate.value.length === 2) {
      queryParams.value.beginDueDate = daterangeDueDate.value[0];
      queryParams.value.endDueDate = daterangeDueDate.value[1];
    } else {
      queryParams.value.beginDueDate = '';
      queryParams.value.endDueDate = '';
    }

    const response = await listTask(queryParams.value);
    taskList.value = response.rows;
    total.value = response.total;
    console.log('任务列表数据:', response.rows);
    console.log('第一个任务数据:', response.rows?.[0]);
    
    // 补充项目名称和负责人名称
    await enrichTaskData(taskList.value);
  } catch (error) {
    console.error('获取任务列表失败:', error);
    ElMessage.error('获取任务列表失败');
  } finally {
    loading.value = false;
  }
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  daterangeDueDate.value = ['', ''];
  queryFormRef.value?.resetFields();
  queryParams.value.pageNum = 1;
  handleQuery();
};

/** 多选框选中数据 */
const handleSelectionChange = (selection: TaskVO[]) => {
  ids.value = selection.map(item => item.taskId);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
};

/** 行点击事件 */
const handleRowClick = (row: TaskVO) => {
  handleTaskDetail(row);
};

/** 新增按钮操作 */
const handleAdd = () => {
  dialog.title = '添加任务';
  dialog.data = {} as TaskFormType;
  dialog.visible = true;
};

/** 修改按钮操作 */
const handleUpdate = (row?: TaskVO) => {
  const taskId = row?.taskId || ids.value[0];
  if (!taskId) {
    ElMessage.warning('请选择要修改的任务');
    return;
  }

  dialog.title = '修改任务';
  dialog.data = row || taskList.value.find(item => item.taskId === taskId) || {} as TaskVO;
  dialog.visible = true;
};

/** 删除按钮操作 */
const handleDelete = async (row?: TaskVO) => {
  const taskIds = row?.taskId ? [row.taskId] : ids.value;
  if (!taskIds.length) {
    ElMessage.warning('请选择要删除的任务');
    return;
  }

  try {
    await ElMessageBox.confirm('是否确认删除选中的任务？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    await delTask(taskIds);
    ElMessage.success('删除成功');
    await getList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除任务失败:', error);
      ElMessage.error('删除任务失败');
    }
  }
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('/hit/project/task/export', {
    ...queryParams.value
  }, `task_${new Date().getTime()}.xlsx`);
};

/** 表单提交成功 */
const handleFormSuccess = () => {
  dialog.visible = false;
  getList();
};

/** 任务详情 */
const handleTaskDetail = (row: TaskVO) => {
  // 跳转到任务详情页面
  router.push({
    path: '/hit/task/detail',
    query: { taskId: row.taskId }
  });
};

/** 看板视图 */
const handleKanbanView = () => {
  // 跳转到看板视图页面
  router.push({
    path: '/hit/project/task/kanban',
    query: { projectId: currentProjectId.value }
  });
};

/** 分配任务 */
const handleAssign = (row: TaskVO) => {
  assignForm.taskIds = [row.taskId];
  assignForm.assigneeId = '';
  assignDialog.visible = true;
};

/** 确认分配 */
const handleAssignConfirm = async () => {
  if (!assignForm.assigneeId) {
    ElMessage.warning('请选择负责人');
    return;
  }

  try {
    for (const taskId of assignForm.taskIds) {
      await assignTask(taskId, assignForm.assigneeId);
    }
    ElMessage.success('分配成功');
    assignDialog.visible = false;
    await getList();
  } catch (error) {
    console.error('分配任务失败:', error);
    ElMessage.error('分配任务失败');
  }
};

/** 复制任务 */
const handleCopy = async (row: TaskVO) => {
  try {
    const { value: newTaskName } = await ElMessageBox.prompt('请输入新任务名称', '复制任务', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: `${row.taskName} - 副本`
    });

    if (newTaskName) {
      await copyTask(row.taskId, newTaskName);
      ElMessage.success('复制成功');
      await getList();
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('复制任务失败:', error);
      ElMessage.error('复制任务失败');
    }
  }
};

/** 获取进度颜色 */
const getProgressColor = (progress: number) => {
  if (progress < 30) return '#f56c6c';
  if (progress < 70) return '#e6a23c';
  return '#67c23a';
};

/** 获取截止日期样式 */
const getDueDateClass = (dueDate: string, status: string) => {
  if (status === 'done') return '';

  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'overdue';
  if (diffDays <= 3) return 'due-soon';
  return '';
};

/** 初始化 */
onMounted(() => {
  // 从路由参数获取项目ID
  const projectId = route.query.projectId;
  if (projectId) {
    currentProjectId.value = projectId as string;
    queryParams.value.projectId = projectId as string;
  }

  getList();
  // 这里可以加载用户列表用于分配任务
  // loadUserList();
});
</script>

<style scoped lang="scss">
.app-container {
  padding: 20px;
}

.search-wrapper {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toolbar-wrapper {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.task-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;

  .milestone-tag {
    flex-shrink: 0;
  }

  .task-name {
    flex: 1;
    cursor: pointer;
    color: #409eff;

    &:hover {
      text-decoration: underline;
    }
  }

  .subtask-tag {
    flex-shrink: 0;
  }
}

.overdue {
  color: #f56c6c;
  font-weight: bold;
}

.due-soon {
  color: #e6a23c;
  font-weight: bold;
}

:deep(.el-table) {
  .el-table__row {
    cursor: pointer;

    &:hover {
      background-color: #f5f7fa;
    }
  }
}

:deep(.el-progress) {
  .el-progress__text {
    font-size: 12px;
  }
}

.dialog-footer {
  text-align: right;
}
</style>
