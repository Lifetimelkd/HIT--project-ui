<template>
  <div class="my-project-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">我的项目</h1>
        <p class="page-subtitle">管理您创建的项目，跟踪项目进展</p>
        <el-button type="primary" size="large" @click="handleCreate" class="create-btn">
          <el-icon><Plus /></el-icon>
          创建新项目
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon total">
                <el-icon><Document /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ projectStats.total }}</div>
                <div class="stats-label">总项目数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon active">
                <el-icon><Promotion /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ projectStats.active }}</div>
                <div class="stats-label">进行中</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon recruiting">
                <el-icon><UserFilled /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ projectStats.recruiting }}</div>
                <div class="stats-label">招募中</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon completed">
                <el-icon><CircleCheck /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ projectStats.completed }}</div>
                <div class="stats-label">已完成</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索和筛选 -->
    <div class="filter-section">
      <el-card class="filter-card">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-input v-model="queryParams.projectName" placeholder="搜索项目名称" clearable @keyup.enter="handleQuery">
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-select v-model="queryParams.status" placeholder="项目状态" clearable>
              <el-option label="进行中" value="active" />
              <el-option label="已暂停" value="paused" />
              <el-option label="已完成" value="completed" />
              <el-option label="已取消" value="cancelled" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select v-model="queryParams.recruitmentStatus" placeholder="招募状态" clearable>
              <el-option label="招募中" value="open" />
              <el-option label="暂停招募" value="paused" />
              <el-option label="招募结束" value="closed" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              @change="handleDateChange"
            />
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="handleQuery">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
          </el-col>
        </el-row>
      </el-card>
    </div>

    <!-- 项目列表 -->
    <div class="project-list">
      <el-card class="list-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">项目列表</span>
            <div class="card-actions">
              <el-button type="primary" @click="handleBatchDelete" :disabled="!selectedProjects.length">
                <el-icon><Delete /></el-icon>
                批量删除
              </el-button>
            </div>
          </div>
        </template>

        <el-table v-loading="loading" :data="projectList" @selection-change="handleSelectionChange" style="width: 100%">
          <el-table-column type="selection" width="55" />
          <el-table-column label="项目封面" width="120">
            <template #default="{ row }">
              <div class="project-cover-mini">
                <img :src="row.coverImage || '/default-project-cover.jpg'" :alt="row.projectName" class="cover-image" />
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="projectName" label="项目名称" min-width="200">
            <template #default="{ row }">
              <div class="project-name-cell">
                <div class="project-name">{{ row.projectName }}</div>
                <div class="project-description">{{ row.projectDescription }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="projectType" label="项目类型" width="120">
            <template #default="{ row }">
              <el-tag :type="getProjectTypeColor(row.projectType)">
                {{ getProjectTypeText(row.projectType) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="团队情况" width="120">
            <template #default="{ row }">
              <div class="team-info">
                <div class="team-size">{{ row.currentMembers }}/{{ row.teamSizeMax }}</div>
                <div class="team-label">成员</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="recruitmentStatus" label="招募状态" width="120">
            <template #default="{ row }">
              <el-tag :type="getRecruitmentStatusColor(row.recruitmentStatus)">
                {{ getRecruitmentStatusText(row.recruitmentStatus) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="项目状态" width="120">
            <template #default="{ row }">
              <el-tag :type="getProjectStatusColor(row.status)">
                {{ getProjectStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="数据统计" width="150">
            <template #default="{ row }">
              <div class="stats-mini">
                <div class="stat-item">
                  <el-icon><View /></el-icon>
                  <span>{{ row.viewCount }}</span>
                </div>
                <div class="stat-item">
                  <el-icon><Star /></el-icon>
                  <span>{{ row.likeCount }}</span>
                </div>
                <div class="stat-item">
                  <el-icon><UserFilled /></el-icon>
                  <span>{{ row.applyCount }}</span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="120">
            <template #default="{ row }">
              {{ formatDate(row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button type="primary" size="small" @click="handleView(row.projectId)"> 查看 </el-button>
                <el-button type="warning" size="small" @click="handleEdit(row.projectId)"> 编辑 </el-button>
                <el-button type="info" size="small" @click="handleManageMembers(row.projectId)"> 成员 </el-button>
                <el-dropdown @command="(command) => handleMoreAction(command, row)">
                  <el-button type="info" size="small">
                    更多<el-icon><ArrowDown /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="applications">申请管理</el-dropdown-item>
                      <el-dropdown-item command="clone">克隆项目</el-dropdown-item>
                      <el-dropdown-item command="export">导出数据</el-dropdown-item>
                      <el-dropdown-item command="delete" divided>删除项目</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container" v-if="total > 0">
          <el-pagination
            v-model:current-page="queryParams.pageNum"
            v-model:page-size="queryParams.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { listMyProject, delProject, ProjectInfo, ProjectQuery } from '@/api/hit/project';

const router = useRouter();

// 响应式数据
const loading = ref(false);
const projectList = ref<ProjectInfo[]>([]);
const total = ref(0);
const selectedProjects = ref<ProjectInfo[]>([]);
const dateRange = ref<[Date, Date] | null>(null);

// 项目统计
const projectStats = reactive({
  total: 0,
  active: 0,
  recruiting: 0,
  completed: 0
});

// 查询参数
const queryParams = reactive<ProjectQuery>({
  pageNum: 1,
  pageSize: 10,
  projectName: '',
  status: '',
  recruitmentStatus: '',
  beginCreateTime: '',
  endCreateTime: ''
});

// 获取项目列表
const getProjectList = async () => {
  loading.value = true;
  try {
    const response = await listMyProject(queryParams);

    console.log('我的项目API响应数据:', response);

    // 参考项目广场页面的数据解析逻辑
    // 由于axios响应拦截器已经提取了data，response就是实际的数据
    // API返回格式: { code: 200, msg: "查询成功", rows: [...], total: 4 }
    const responseData = response as any;
    if (responseData && typeof responseData === 'object') {
      // 直接从response中获取rows和total
      if ('rows' in responseData && 'total' in responseData) {
        projectList.value = responseData.rows || [];
        total.value = responseData.total || 0;
      }
      // 如果response本身就是数组
      else if (Array.isArray(responseData)) {
        projectList.value = responseData;
        total.value = responseData.length;
      } else {
        console.warn('未识别的响应格式:', responseData);
        projectList.value = [];
        total.value = 0;
      }
    } else {
      projectList.value = [];
      total.value = 0;
    }

    console.log('解析后的我的项目列表:', projectList.value);
    console.log('总数:', total.value);

    // 计算统计数据
    calculateStats();
  } catch (error) {
    console.error('获取项目列表失败:', error);
    ElMessage.error('获取项目列表失败');
    projectList.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

// 计算统计数据
const calculateStats = () => {
  projectStats.total = projectList.value.length;
  projectStats.active = projectList.value.filter((p) => p.status === 'active').length;
  projectStats.recruiting = projectList.value.filter((p) => p.recruitmentStatus === 'open').length;
  projectStats.completed = projectList.value.filter((p) => p.status === 'completed').length;
};

// 搜索
const handleQuery = () => {
  queryParams.pageNum = 1;
  getProjectList();
};

// 日期范围变化
const handleDateChange = (dates: [Date, Date] | null) => {
  if (dates) {
    queryParams.beginCreateTime = dates[0].toISOString().split('T')[0];
    queryParams.endCreateTime = dates[1].toISOString().split('T')[0];
  } else {
    queryParams.beginCreateTime = '';
    queryParams.endCreateTime = '';
  }
};

// 分页
const handleSizeChange = (size: number) => {
  queryParams.pageSize = size;
  getProjectList();
};

const handleCurrentChange = (page: number) => {
  queryParams.pageNum = page;
  getProjectList();
};

// 选择变化
const handleSelectionChange = (selection: ProjectInfo[]) => {
  selectedProjects.value = selection;
};

// 创建项目
const handleCreate = () => {
  router.push('/hit/project/create');
};

// 查看项目
const handleView = (projectId: number) => {
  router.push(`/hit/project/detail/${projectId}`);
};

// 编辑项目
const handleEdit = (projectId: number) => {
  router.push(`/hit/project/edit/${projectId}`);
};

// 管理成员
const handleManageMembers = (projectId: number) => {
  router.push(`/hit/project/members/${projectId}`);
};

// 更多操作
const handleMoreAction = (command: string, row: ProjectInfo) => {
  switch (command) {
    case 'applications':
      router.push(`/hit/project/applications/${row.projectId}`);
      break;
    case 'clone':
      handleCloneProject(row);
      break;
    case 'export':
      handleExportProject(row);
      break;
    case 'delete':
      handleDeleteProject(row.projectId!);
      break;
  }
};

// 克隆项目
const handleCloneProject = (project: ProjectInfo) => {
  ElMessage.info('克隆功能开发中...');
};

// 导出项目数据
const handleExportProject = (project: ProjectInfo) => {
  ElMessage.info('导出功能开发中...');
};

// 删除项目
const handleDeleteProject = (projectId: number) => {
  ElMessageBox.confirm('确定要删除这个项目吗？删除后无法恢复。', '确认删除', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await delProject([projectId]);
      ElMessage.success('删除成功');
      getProjectList();
    } catch (error) {
      console.error('删除失败:', error);
      ElMessage.error('删除失败');
    }
  });
};

// 批量删除
const handleBatchDelete = () => {
  if (selectedProjects.value.length === 0) {
    ElMessage.warning('请选择要删除的项目');
    return;
  }

  ElMessageBox.confirm(`确定要删除选中的 ${selectedProjects.value.length} 个项目吗？删除后无法恢复。`, '确认批量删除', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const projectIds = selectedProjects.value.map((p) => p.projectId!);
      await delProject(projectIds);
      ElMessage.success('批量删除成功');
      getProjectList();
    } catch (error) {
      console.error('批量删除失败:', error);
      ElMessage.error('批量删除失败');
    }
  });
};

// 工具函数
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('zh-CN');
};

const getProjectTypeText = (type: string) => {
  const types: Record<string, string> = {
    academic: '学术研究',
    competition: '竞赛项目',
    practice: '实践项目',
    graduation: '毕业设计',
    course: '课程项目'
  };
  return types[type] || type;
};

const getProjectTypeColor = (type: string): 'success' | 'info' | 'warning' | 'danger' => {
  const colors: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
    academic: 'info',
    competition: 'warning',
    practice: 'success',
    graduation: 'danger',
    course: 'info'
  };
  return colors[type] || 'info';
};

const getRecruitmentStatusText = (status: string) => {
  const statuses: Record<string, string> = {
    open: '招募中',
    paused: '暂停招募',
    closed: '招募结束'
  };
  return statuses[status] || status;
};

const getRecruitmentStatusColor = (status: string): 'success' | 'warning' | 'danger' => {
  const colors: Record<string, 'success' | 'warning' | 'danger'> = {
    open: 'success',
    paused: 'warning',
    closed: 'danger'
  };
  return colors[status] || 'warning';
};

const getProjectStatusText = (status: string) => {
  const statuses: Record<string, string> = {
    active: '进行中',
    paused: '已暂停',
    completed: '已完成',
    cancelled: '已取消'
  };
  return statuses[status] || status;
};

const getProjectStatusColor = (status: string): 'success' | 'info' | 'warning' | 'danger' => {
  const colors: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
    active: 'success',
    paused: 'warning',
    completed: 'info',
    cancelled: 'danger'
  };
  return colors[status] || 'info';
};

// 生命周期
onMounted(() => {
  getProjectList();
});
</script>

<style scoped lang="scss">
.my-project-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-bottom: 40px;
}

.page-header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 40px 0;
  color: white;
  text-align: center;
  margin-bottom: 30px;

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .page-title {
    font-size: 3rem;
    font-weight: bold;
    margin: 0 0 10px 0;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .page-subtitle {
    font-size: 1.2rem;
    margin: 0 0 30px 0;
    opacity: 0.9;
  }

  .create-btn {
    font-size: 1.1rem;
    padding: 12px 30px;
    border-radius: 25px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }
}

.stats-section {
  max-width: 1200px;
  margin: 0 auto 30px auto;
  padding: 0 20px;

  .stats-card {
    border-radius: 15px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s;

    &:hover {
      transform: translateY(-5px);
    }

    .stats-content {
      display: flex;
      align-items: center;
      padding: 10px;

      .stats-icon {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        color: white;
        margin-right: 15px;

        &.total {
          background: linear-gradient(135deg, #667eea, #764ba2);
        }

        &.active {
          background: linear-gradient(135deg, #f093fb, #f5576c);
        }

        &.recruiting {
          background: linear-gradient(135deg, #4facfe, #00f2fe);
        }

        &.completed {
          background: linear-gradient(135deg, #43e97b, #38f9d7);
        }
      }

      .stats-info {
        flex: 1;

        .stats-number {
          font-size: 2rem;
          font-weight: bold;
          color: #333;
          line-height: 1;
        }

        .stats-label {
          font-size: 0.9rem;
          color: #666;
          margin-top: 5px;
        }
      }
    }
  }
}

.filter-section,
.project-list {
  max-width: 1200px;
  margin: 0 auto 30px auto;
  padding: 0 20px;

  .filter-card,
  .list-card {
    border-radius: 15px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .card-title {
    font-size: 1.2rem;
    font-weight: bold;
    color: #333;
  }
}

.project-cover-mini {
  .cover-image {
    width: 80px;
    height: 50px;
    object-fit: cover;
    border-radius: 8px;
  }
}

.project-name-cell {
  .project-name {
    font-weight: bold;
    color: #333;
    margin-bottom: 5px;
  }

  .project-description {
    font-size: 0.9rem;
    color: #666;
    line-height: 1.4;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}

.team-info {
  text-align: center;

  .team-size {
    font-weight: bold;
    color: #333;
  }

  .team-label {
    font-size: 0.8rem;
    color: #666;
  }
}

.stats-mini {
  display: flex;
  flex-direction: column;
  gap: 5px;

  .stat-item {
    display: flex;
    align-items: center;
    font-size: 0.9rem;
    color: #666;

    .el-icon {
      margin-right: 5px;
      font-size: 14px;
    }
  }
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;

  .el-button {
    padding: 5px 10px;
  }
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table__header) {
  background: #f8f9fa;
}

:deep(.el-card__body) {
  padding: 20px;
}
</style>
