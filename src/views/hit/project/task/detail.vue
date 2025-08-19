<template>
  <div class="app-container">
    <el-row :gutter="20" v-loading="loading">
      <!-- 任务基本信息 -->
      <el-col :span="16">
        <el-card class="mb-4">
          <template #header>
            <div class="card-header">
              <span>{{ taskDetail.taskName }}</span>
              <div class="task-actions">
                <el-button type="primary" icon="Edit" @click="handleEdit">编辑</el-button>
                <el-button type="success" icon="Check" @click="handleComplete" v-if="taskDetail.status !== 'completed'">完成</el-button>
                <el-dropdown @command="handleAction">
                  <el-button type="info" icon="MoreFilled">更多</el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="copy" icon="CopyDocument">复制任务</el-dropdown-item>
                      <el-dropdown-item command="archive" icon="Box">归档</el-dropdown-item>
                      <el-dropdown-item command="delete" icon="Delete" divided>删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
          </template>

          <div class="task-content">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="任务类型">
                <dict-tag :options="hit_task_type" :value="taskDetail.taskType" />
              </el-descriptions-item>
              <el-descriptions-item label="优先级">
                <dict-tag :options="hit_task_priority" :value="taskDetail.priority" />
              </el-descriptions-item>
              <el-descriptions-item label="状态">
                <dict-tag :options="hit_task_status" :value="taskDetail.status" />
              </el-descriptions-item>
              <el-descriptions-item label="进度">
                <el-progress :percentage="taskDetail.progress" :stroke-width="8" />
              </el-descriptions-item>
              <el-descriptions-item label="负责人">
                <div class="assignee-info">
                  <el-avatar :size="24" :src="taskDetail.assigneeAvatar">
                    {{ taskDetail.assigneeName?.charAt(0) }}
                  </el-avatar>
                  <span>{{ taskDetail.assigneeName || '未分配' }}</span>
                </div>
              </el-descriptions-item>
              <el-descriptions-item label="创建人">
                {{ taskDetail.creatorName }}
              </el-descriptions-item>
              <el-descriptions-item label="开始日期">
                {{ taskDetail.startDate || '未设置' }}
              </el-descriptions-item>
              <el-descriptions-item label="截止日期">
                <span :class="{ 'overdue': isOverdue(taskDetail.dueDate) }">
                  {{ taskDetail.dueDate || '未设置' }}
                </span>
              </el-descriptions-item>
              <el-descriptions-item label="预估工时">
                {{ taskDetail.estimatedHours || 0 }} 小时
              </el-descriptions-item>
              <el-descriptions-item label="实际工时">
                {{ taskDetail.actualHours || 0 }} 小时
              </el-descriptions-item>
            </el-descriptions>

            <div class="task-description mt-4" v-if="taskDetail.taskDescription">
              <h4>任务描述</h4>
              <div class="description-content">
                {{ taskDetail.taskDescription }}
              </div>
            </div>

            <div class="task-dependencies mt-4" v-if="dependencyList.length > 0">
              <h4>依赖任务</h4>
              <div class="dependency-list">
                <el-tag
                  v-for="dep in dependencyList"
                  :key="dep.taskId"
                  class="dependency-tag"
                  type="info"
                  @click="goToTask(dep.taskId)"
                >
                  {{ dep.taskName }}
                </el-tag>
              </div>
            </div>

            <div class="task-tags mt-4" v-if="taskDetail.tags">
              <h4>标签</h4>
              <div class="tag-list">
                <el-tag
                  v-for="tag in tagList"
                  :key="tag"
                  class="task-tag"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 子任务列表 -->
        <el-card v-if="subTasks.length > 0">
          <template #header>
            <span>子任务 ({{ subTasks.length }})</span>
          </template>
          <el-table :data="subTasks" border>
            <el-table-column label="任务名称" prop="taskName" min-width="200">
              <template #default="scope">
                <el-link type="primary" @click="goToTask(scope.row.taskId)">
                  {{ scope.row.taskName }}
                </el-link>
              </template>
            </el-table-column>
            <el-table-column label="状态" prop="status" width="100">
              <template #default="scope">
                <dict-tag :options="hit_task_status" :value="scope.row.status" />
              </template>
            </el-table-column>
            <el-table-column label="负责人" prop="assigneeName" width="120" />
            <el-table-column label="进度" prop="progress" width="120">
              <template #default="scope">
                <el-progress :percentage="scope.row.progress" :stroke-width="6" />
              </template>
            </el-table-column>
            <el-table-column label="截止日期" prop="dueDate" width="120" />
          </el-table>
        </el-card>
      </el-col>

      <!-- 侧边栏 -->
      <el-col :span="8">
        <!-- 快速操作 -->
        <el-card class="mb-4">
          <template #header>
            <span>快速操作</span>
          </template>
          <div class="quick-actions">
            <el-button type="primary" icon="Edit" @click="handleEdit" block>编辑任务</el-button>
            <el-button type="success" icon="Check" @click="handleComplete" block v-if="taskDetail.status !== 'completed'">
              标记完成
            </el-button>
            <el-button type="warning" icon="User" @click="showAssignDialog = true" block>
              重新分配
            </el-button>
            <el-button type="info" icon="Clock" @click="showProgressDialog = true" block>
              更新进度
            </el-button>
          </div>
        </el-card>

        <!-- 项目信息 -->
        <el-card class="mb-4">
          <template #header>
            <span>项目信息</span>
          </template>
          <div class="project-info">
            <p><strong>项目名称：</strong>{{ taskDetail.projectName }}</p>
            <p><strong>创建时间：</strong>{{ formatDateTime(taskDetail.createTime) }}</p>
            <p><strong>更新时间：</strong>{{ formatDateTime(taskDetail.updateTime) }}</p>
          </div>
        </el-card>

        <!-- 统计信息 -->
        <el-card>
          <template #header>
            <span>统计信息</span>
          </template>
          <div class="stats-info">
            <div class="stat-item">
              <span class="stat-label">子任务数量：</span>
              <span class="stat-value">{{ taskDetail.subTaskCount || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">评论数量：</span>
              <span class="stat-value">{{ taskDetail.commentCount || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">工时效率：</span>
              <span class="stat-value">
                {{ taskDetail.estimatedHours > 0 ? Math.round((taskDetail.actualHours / taskDetail.estimatedHours) * 100) : 0 }}%
              </span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 分配任务对话框 -->
    <el-dialog title="重新分配任务" v-model="showAssignDialog" width="400px">
      <el-form :model="assignForm" label-width="80px">
        <el-form-item label="负责人">
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
        <el-button @click="showAssignDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAssign">确定</el-button>
      </template>
    </el-dialog>

    <!-- 更新进度对话框 -->
    <el-dialog title="更新进度" v-model="showProgressDialog" width="400px">
      <el-form :model="progressForm" label-width="80px">
        <el-form-item label="进度">
          <el-slider v-model="progressForm.progress" :max="100" show-input />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showProgressDialog = false">取消</el-button>
        <el-button type="primary" @click="handleUpdateProgress">确定</el-button>
      </template>
    </el-dialog>

    <!-- 编辑任务对话框 -->
    <el-dialog title="编辑任务" v-model="showEditDialog" width="800px">
      <TaskForm
        v-if="showEditDialog"
        ref="taskFormRef"
        :task-data="taskDetail"
        :project-id="taskDetail.projectId"
        @success="handleEditSuccess"
        @cancel="showEditDialog = false"
      />
    </el-dialog>
  </div>
</template>

<script setup name="TaskDetail" lang="ts">
import { getCurrentInstance, ref, reactive, onMounted, computed, toRefs, type ComponentInternalInstance } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRoute, useRouter } from 'vue-router';
import { MoreFilled } from '@element-plus/icons-vue';
import { getTask, updateTaskStatus, updateTaskProgress, assignTask, copyTask, archiveTask, delTask, getSubTasks, getTaskDependencies } from '@/api/hit/project/task';
import { TaskVO } from '@/api/hit/project/task/types';
import TaskForm from './components/TaskForm.vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { hit_task_type, hit_task_priority, hit_task_status } = toRefs<any>(
  proxy?.useDict('hit_task_type', 'hit_task_priority', 'hit_task_status')
);

const route = useRoute();
const router = useRouter();

// 响应式数据
const loading = ref(true);
const taskDetail = ref<TaskVO>({} as TaskVO);
const subTasks = ref<TaskVO[]>([]);
const dependencyList = ref<TaskVO[]>([]);
const userList = ref<any[]>([]);
const showAssignDialog = ref(false);
const showProgressDialog = ref(false);
const showEditDialog = ref(false);

// 表单数据
const assignForm = reactive({
  assigneeId: ''
});

const progressForm = reactive({
  progress: 0
});

const taskFormRef = ref<InstanceType<typeof TaskForm>>();

// 计算属性
const tagList = computed(() => {
  return taskDetail.value.tags ? taskDetail.value.tags.split(',').filter(tag => tag.trim()) : [];
});

/** 检查是否逾期 */
const isOverdue = (dueDate: string) => {
  return dueDate && new Date(dueDate) < new Date();
};

/** 格式化日期时间 */
const formatDateTime = (dateTime: string) => {
  return dateTime ? new Date(dateTime).toLocaleString() : '';
};

/** 获取任务详情 */
const getTaskDetail = async () => {
  const taskId = route.query.taskId as string;
  if (!taskId) {
    ElMessage.error('任务ID不能为空');
    router.back();
    return;
  }

  loading.value = true;
  try {
    const response = await getTask(taskId);
    taskDetail.value = response.data;
    
    // 获取子任务
    if (taskDetail.value.subTaskCount > 0) {
      const subTaskResponse = await getSubTasks(taskId);
      subTasks.value = subTaskResponse.data || [];
    }
    
    // 获取依赖任务
    if (taskDetail.value.dependencies) {
      const depResponse = await getTaskDependencies(taskId);
      dependencyList.value = depResponse.data || [];
    }
  } catch (error) {
    console.error('获取任务详情失败:', error);
    ElMessage.error('获取任务详情失败');
  } finally {
    loading.value = false;
  }
};

/** 编辑任务 */
const handleEdit = () => {
  showEditDialog.value = true;
};

/** 完成任务 */
const handleComplete = async () => {
  try {
    await ElMessageBox.confirm('确认将此任务标记为已完成？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    await updateTaskStatus(taskDetail.value.taskId, 'completed');
    ElMessage.success('任务已完成');
    await getTaskDetail();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败');
    }
  }
};

/** 处理更多操作 */
const handleAction = async (command: string) => {
  switch (command) {
    case 'copy':
      try {
        const { value: newTaskName } = await ElMessageBox.prompt('请输入新任务名称', '复制任务', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputValue: `${taskDetail.value.taskName} - 副本`
        });

        if (newTaskName) {
          await copyTask(taskDetail.value.taskId, newTaskName);
          ElMessage.success('复制成功');
        }
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('复制失败');
        }
      }
      break;
    case 'archive':
      try {
        await ElMessageBox.confirm('确认归档此任务？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });

        await archiveTask(taskDetail.value.taskId);
        ElMessage.success('归档成功');
        router.back();
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('归档失败');
        }
      }
      break;
    case 'delete':
      try {
        await ElMessageBox.confirm('确认删除此任务？删除后无法恢复！', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'error'
        });

        await delTask(taskDetail.value.taskId);
        ElMessage.success('删除成功');
        router.back();
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败');
        }
      }
      break;
  }
};

/** 分配任务 */
const handleAssign = async () => {
  if (!assignForm.assigneeId) {
    ElMessage.warning('请选择负责人');
    return;
  }

  try {
    await assignTask(taskDetail.value.taskId, assignForm.assigneeId);
    ElMessage.success('分配成功');
    showAssignDialog.value = false;
    await getTaskDetail();
  } catch (error) {
    ElMessage.error('分配失败');
  }
};

/** 更新进度 */
const handleUpdateProgress = async () => {
  try {
    await updateTaskProgress(taskDetail.value.taskId, progressForm.progress);
    ElMessage.success('进度更新成功');
    showProgressDialog.value = false;
    await getTaskDetail();
  } catch (error) {
    ElMessage.error('进度更新失败');
  }
};

/** 跳转到任务 */
const goToTask = (taskId: string) => {
  router.push({
    path: '/hit/project/task/detail',
    query: { taskId }
  });
};

/** 编辑成功回调 */
const handleEditSuccess = () => {
  showEditDialog.value = false;
  getTaskDetail();
};

onMounted(() => {
  getTaskDetail();
});
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-actions {
  display: flex;
  gap: 8px;
}

.assignee-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.overdue {
  color: #f56c6c;
  font-weight: bold;
}

.description-content {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 4px;
  white-space: pre-wrap;
}

.dependency-list,
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.dependency-tag {
  cursor: pointer;
}

.dependency-tag:hover {
  opacity: 0.8;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.project-info p,
.stats-info .stat-item {
  margin: 8px 0;
}

.stat-item {
  display: flex;
  justify-content: space-between;
}

.stat-label {
  color: #606266;
}

.stat-value {
  font-weight: bold;
  color: #303133;
}

.mb-4 {
  margin-bottom: 16px;
}

.mt-4 {
  margin-top: 16px;
}
</style>
