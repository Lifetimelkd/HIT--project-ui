<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!-- 工具栏 -->
      <el-col :span="24" class="mb-4">
        <el-card>
          <el-form :model="queryParams" :inline="true" label-width="80px">
            <el-form-item label="项目">
              <el-select v-model="queryParams.projectId" placeholder="请选择项目" clearable style="width: 200px">
                <el-option label="全部项目" value="" />
                <el-option
                  v-for="project in userProjects"
                  :key="project.projectId"
                  :label="project.projectName"
                  :value="project.projectId"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="任务范围">
              <el-switch
                v-model="showMyTasksOnly"
                active-text="只看我的"
                inactive-text="看全部"
                @change="handleQuery"
              />
            </el-form-item>
            <el-form-item label="优先级">
              <el-select v-model="queryParams.priority" placeholder="请选择优先级" clearable style="width: 120px">
                <el-option label="全部" value="" />
                <el-option
                  v-for="dict in hit_task_priority"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
              <el-button type="success" icon="Plus" @click="handleAdd">新建任务</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 看板区域 -->
      <el-col :span="24">
        <div class="kanban-container">
          <div class="kanban-column" v-for="column in kanbanColumns" :key="column.status">
            <div class="column-header" :style="{ backgroundColor: column.color }">
              <h3>{{ column.title }}</h3>
              <el-badge :value="getTaskCountByStatus(column.status)" class="task-count" />
            </div>
            
            <div class="column-content" v-loading="loading">
              <draggable
                v-model="column.tasks"
                group="tasks"
                @change="handleTaskMove"
                item-key="taskId"
                class="task-list"
              >
                <template #item="{ element: task }">
                  <div class="task-card" @click="handleTaskDetail(task)">
                    <div class="task-header">
                      <span class="task-name">{{ task.taskName }}</span>
                      <el-dropdown @command="(command) => handleTaskAction(command, task)">
                        <el-icon class="task-menu"><MoreFilled /></el-icon>
                        <template #dropdown>
                          <el-dropdown-menu>
                            <el-dropdown-item command="edit" icon="Edit">编辑</el-dropdown-item>
                            <el-dropdown-item command="detail" icon="View">详情</el-dropdown-item>
                            <el-dropdown-item command="delete" icon="Delete">删除</el-dropdown-item>
                          </el-dropdown-menu>
                        </template>
                      </el-dropdown>
                    </div>
                    
                    <div class="task-meta">
                      <el-tag size="small" :type="getPriorityType(task.priority) as any">
                        {{ getPriorityLabel(task.priority) }}
                      </el-tag>
                      <span class="task-project">{{ task.projectName }}</span>
                    </div>
                    
                    <div class="task-progress" v-if="task.progress > 0">
                      <el-progress :percentage="task.progress" :stroke-width="6" :show-text="false" />
                      <span class="progress-text">{{ task.progress }}%</span>
                    </div>
                    
                    <div class="task-footer">
                      <div class="task-assignee">
                        <el-avatar :size="24" :src="task.assigneeAvatar">
                          {{ task.assigneeName?.charAt(0) }}
                        </el-avatar>
                        <span>{{ task.assigneeName }}</span>
                      </div>
                      <div class="task-due" v-if="task.dueDate">
                        <el-icon><Calendar /></el-icon>
                        <span :class="{ 'overdue': isOverdue(task.dueDate) }">
                          {{ formatDate(task.dueDate) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </template>
              </draggable>
              
              <!-- 空状态 -->
              <div v-if="column.tasks.length === 0" class="empty-column">
                <el-empty description="暂无任务" :image-size="80" />
              </div>
              
              <!-- 分页加载更多 -->
              <div v-if="column.hasMore" class="load-more">
                <el-button @click="loadMoreTasks(column.status)" :loading="column.loading" text>
                  加载更多
                </el-button>
              </div>
            </div>
          </div>
        </div>
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

<script setup name="TaskKanban" lang="ts">
import { getCurrentInstance, ref, reactive, toRefs, onMounted, computed, type ComponentInternalInstance } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
import { MoreFilled, Calendar } from '@element-plus/icons-vue';
import draggable from 'vuedraggable';
import { listTask, updateTaskStatus, delTask, getProjectTasks } from '@/api/hit/project/task';
import { TaskVO, TaskQuery, TaskForm as TaskFormType } from '@/api/hit/project/task/types';
import TaskForm from './components/TaskForm.vue';
import { getProject, listMyMemberProjects, type ProjectInfo } from '@/api/hit/project';
import { getUserProfileByUserId } from '@/api/hit/userProfile';
import { useUserStore } from '@/store/modules/user';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const router = useRouter();
const userStore = useUserStore();
const { hit_task_priority, hit_task_status } = toRefs<any>(
  proxy?.useDict('hit_task_priority', 'hit_task_status')
);

// 响应式数据
const loading = ref(true);
const currentUserId = computed(() => userStore.userId);
const currentProjectId = ref<string>('');
const showMyTasksOnly = ref(false); // 默认关闭（显示全部）
const userProjects = ref<ProjectInfo[]>([]);

// 查询参数
const queryParams = reactive<TaskQuery>({
  pageNum: 1,
  pageSize: 20, // 分页大小
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

// 看板列配置 - 动态生成
const kanbanColumns = ref<Array<{
  status: string;
  title: string;
  color: string;
  tasks: TaskVO[];
  hasMore: boolean;
  loading: boolean;
  pageNum: number;
}>>([]);

const taskFormRef = ref<InstanceType<typeof TaskForm>>();

// 根据状态值获取颜色
const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    'todo': '#E6A23C',
    'pending': '#E6A23C',
    'in_progress': '#409EFF',
    'doing': '#409EFF',
    'testing': '#909399',
    'review': '#F56C6C',
    'completed': '#67C23A',
    'done': '#67C23A',
    'cancelled': '#C0C4CC',
    'blocked': '#F56C6C'
  };
  return colorMap[status] || '#909399';
};

// 根据字典数据生成看板列
const generateKanbanColumns = () => {
  if (!hit_task_status.value) return;
  
  kanbanColumns.value = hit_task_status.value.map((statusDict: any) => ({
    status: statusDict.value,
    title: statusDict.label,
    color: getStatusColor(statusDict.value),
    tasks: [],
    hasMore: false,
    loading: false,
    pageNum: 1
  }));
};

// 获取用户参与的项目列表
const loadUserProjects = async () => {
  try {
    const response = await listMyMemberProjects({ pageNum: 1, pageSize: 100 });
    userProjects.value = (response as any).rows || (response as any).data || [];
  } catch (error) {
    console.error('获取用户项目失败:', error);
    ElMessage.error('获取用户项目失败');
  }
};

// 获取用户关联项目的所有任务
const getUserProjectTasks = async (): Promise<TaskVO[]> => {
  const allTasks: TaskVO[] = [];
  
  try {
    // 如果选择了特定项目
    if (queryParams.projectId) {
      const tasks = await getProjectTasks(queryParams.projectId);
      allTasks.push(...(tasks.data || []));
    } else {
      // 获取所有用户项目的任务
      for (const project of userProjects.value) {
        if (project.projectId) {
          try {
            const tasks = await getProjectTasks(project.projectId);
            allTasks.push(...(tasks.data || []));
          } catch (error) {
            console.warn(`获取项目 ${project.projectName} 任务失败:`, error);
          }
        }
      }
    }
    
    // 根据"只展示我的任务"开关过滤
    if (showMyTasksOnly.value && currentUserId.value) {
      return allTasks.filter(task => task.assigneeId === currentUserId.value);
    }
    
    // 根据其他筛选条件过滤
    let filteredTasks = allTasks;
    if (queryParams.priority) {
      filteredTasks = filteredTasks.filter(task => task.priority === queryParams.priority);
    }
    
    return filteredTasks;
  } catch (error) {
    console.error('获取用户项目任务失败:', error);
    return [];
  }
};

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

/** 获取指定状态的任务数量 */
const getTaskCountByStatus = (status: string) => {
  const column = kanbanColumns.value.find(col => col.status === status);
  return column ? column.tasks.length : 0;
};

/** 获取优先级类型 */
const getPriorityType = (priority: string) => {
  const typeMap: Record<string, string> = {
    'high': 'danger',
    'medium': 'warning',
    'low': 'info'
  };
  return typeMap[priority] || 'info';
};

/** 获取优先级标签 */
const getPriorityLabel = (priority: string) => {
  const option = hit_task_priority.value?.find((item: any) => item.value === priority);
  return option?.label || priority;
};

/** 检查是否逾期 */
const isOverdue = (dueDate: string) => {
  return new Date(dueDate) < new Date();
};

/** 格式化日期 */
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

/** 查询任务列表 */
const getList = async () => {
  loading.value = true;
  try {
    // 清空所有列的任务
    kanbanColumns.value.forEach(column => {
      column.tasks = [];
      column.hasMore = false;
      column.pageNum = 1;
    });
    
    // 获取用户项目任务
    const tasks = await getUserProjectTasks();
    
    // 按状态分组任务
    tasks.forEach((task: TaskVO) => {
      const column = kanbanColumns.value.find(col => col.status === task.status);
      if (column) {
        column.tasks.push(task);
      }
    });

    // 补充任务数据
    await enrichTaskData(tasks);

  } catch (error) {
    console.error('获取任务列表失败:', error);
    ElMessage.error('获取任务列表失败');
  } finally {
    loading.value = false;
  }
};

/** 加载更多任务 */
const loadMoreTasks = async (status: string) => {
  const column = kanbanColumns.value.find(col => col.status === status);
  if (!column || column.loading) return;
  
  column.loading = true;
  try {
    column.pageNum++;
    // 这里可以根据需要实现分页加载逻辑
    // 暂时设置为没有更多数据
    column.hasMore = false;
  } catch (error) {
    console.error('加载更多任务失败:', error);
    ElMessage.error('加载更多任务失败');
  } finally {
    column.loading = false;
  }
};

/** 搜索按钮操作 */
const handleQuery = () => {
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  Object.assign(queryParams, {
    pageNum: 1,
    pageSize: 20,
    projectId: '',
    priority: ''
  });
  showMyTasksOnly.value = false;
  handleQuery();
};

/** 新增按钮操作 */
const handleAdd = () => {
  dialog.title = '添加任务';
  dialog.data = {} as TaskFormType;
  dialog.visible = true;
};

/** 任务拖拽移动 */
const handleTaskMove = async (event: any) => {
  if (event.added) {
    const task = event.added.element;
    const newStatus = kanbanColumns.value.find(col => 
      col.tasks.some(t => t.taskId === task.taskId)
    )?.status;
    
    if (newStatus && newStatus !== task.status) {
      try {
        await updateTaskStatus(task.taskId, newStatus);
        task.status = newStatus;
        ElMessage.success('任务状态已更新');
      } catch (error) {
        ElMessage.error('更新任务状态失败');
        // 回滚操作
        getList();
      }
    }
  }
};

/** 任务操作 */
const handleTaskAction = async (command: string, task: TaskVO) => {
  switch (command) {
    case 'edit':
      dialog.title = '修改任务';
      dialog.data = { ...task };
      dialog.visible = true;
      break;
    case 'detail':
      handleTaskDetail(task);
      break;
    case 'delete':
      try {
        await ElMessageBox.confirm('确认删除此任务？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        await delTask(task.taskId);
        ElMessage.success('删除成功');
        await getList();
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败');
        }
      }
      break;
  }
};

/** 任务详情 */
const handleTaskDetail = (task: TaskVO) => {
  // 跳转到任务详情页面
  router.push({
    path: '/hit/task/detail',
    query: { taskId: task.taskId }
  });
};

/** 表单提交成功 */
const handleFormSuccess = () => {
  dialog.visible = false;
  getList();
};

onMounted(async () => {
  // 等待字典数据加载完成
  await new Promise(resolve => {
    const checkDict = () => {
      if (hit_task_status.value) {
        resolve(true);
      } else {
        setTimeout(checkDict, 100);
      }
    };
    checkDict();
  });
  
  // 生成看板列
  generateKanbanColumns();
  
  // 加载用户项目
  await loadUserProjects();
  
  // 加载任务数据
  getList();
});
</script>

<style scoped>
.kanban-container {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 16px;
}

.kanban-column {
  flex: 1;
  min-width: 300px;
  background: #f5f7fa;
  border-radius: 8px;
  overflow: hidden;
}

.column-header {
  padding: 16px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.column-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.task-count {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 4px 8px;
  font-size: 12px;
}

.column-content {
  padding: 16px;
  min-height: 500px;
}

.task-list {
  min-height: 400px;
}

.task-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s;
}

.task-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.task-name {
  font-weight: 600;
  color: #303133;
  flex: 1;
  margin-right: 8px;
}

.task-menu {
  color: #909399;
  cursor: pointer;
}

.task-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.task-project {
  font-size: 12px;
  color: #909399;
}

.task-progress {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-text {
  font-size: 12px;
  color: #606266;
}

.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-assignee {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #606266;
}

.task-due {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;
}

.overdue {
  color: #f56c6c !important;
}

.empty-column {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.load-more {
  text-align: center;
  margin-top: 16px;
}

.mb-4 {
  margin-bottom: 16px;
}
</style>
