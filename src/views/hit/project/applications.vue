<template>
  <div class="project-applications-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <el-button @click="handleBack" class="back-btn">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h1 class="page-title">申请管理</h1>
        <p class="page-subtitle" v-if="projectInfo">{{ projectInfo.projectName }} - 申请者管理</p>
      </div>
    </div>

    <!-- 项目基本信息 -->
    <div class="project-info-section" v-if="projectInfo">
      <el-card class="project-info-card">
        <div class="project-basic-info">
          <div class="project-cover">
            <img :src="projectInfo.coverImage || '/default-project-cover.jpg'" :alt="projectInfo.projectName" />
          </div>
          <div class="project-details">
            <h3 class="project-name">{{ projectInfo.projectName }}</h3>
            <p class="project-description">{{ projectInfo.projectDescription }}</p>
            <div class="project-stats">
              <div class="stat-item">
                <span class="stat-label">当前成员：</span>
                <span class="stat-value">{{ projectInfo.currentMembers }}/{{ projectInfo.teamSizeMax }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">申请人数：</span>
                <span class="stat-value">{{ total }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">招募状态：</span>
                <el-tag :type="getRecruitmentStatusColor(projectInfo.recruitmentStatus!)">
                  {{ getRecruitmentStatusText(projectInfo.recruitmentStatus!) }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 申请筛选 -->
    <div class="filter-section">
      <el-card class="filter-card">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-input v-model="queryParams.applicantName" placeholder="搜索申请人姓名" clearable @keyup.enter="handleQuery">
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-select v-model="queryParams.status" placeholder="申请状态" clearable>
              <el-option label="待审核" value="pending" />
              <el-option label="已通过" value="approved" />
              <el-option label="已拒绝" value="rejected" />
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
          <el-col :span="4">
            <el-button type="success" @click="handleBatchApprove" :disabled="!selectedApplications.length">
              <el-icon><Check /></el-icon>
              批量通过
            </el-button>
          </el-col>
        </el-row>
      </el-card>
    </div>

    <!-- 申请列表 -->
    <div class="applications-list">
      <el-card class="list-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">申请列表</span>
            <div class="card-actions">
              <el-button type="danger" @click="handleBatchReject" :disabled="!selectedApplications.length">
                <el-icon><Close /></el-icon>
                批量拒绝
              </el-button>
            </div>
          </div>
        </template>

        <el-table v-loading="loading" :data="applicationsList" @selection-change="handleSelectionChange" style="width: 100%">
          <el-table-column type="selection" width="55" />
          <el-table-column label="申请人" width="200">
            <template #default="{ row }">
              <div class="applicant-info">
                <div class="applicant-avatar">
                  <img :src="row.applicantAvatar || '/default-avatar.jpg'" :alt="row.applicantName" />
                </div>
                <div class="applicant-details">
                  <div class="applicant-name">{{ row.applicantName }}</div>
                  <div class="applicant-title">{{ row.applicantTitle || '暂无职位' }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="appliedPosition" label="申请岗位" width="120" />
          <el-table-column prop="motivation" label="申请理由" min-width="200">
            <template #default="{ row }">
              <el-tooltip :content="row.motivation" placement="top" :show-after="500">
                <div class="motivation-text">{{ row.motivation }}</div>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column label="技能标签" width="200">
            <template #default="{ row }">
              <div class="skills-tags">
                <el-tag
                  v-for="skill in (row.skills || '').split(',')"
                  :key="skill"
                  size="small"
                  type="info"
                  style="margin-right: 5px; margin-bottom: 5px"
                >
                  {{ skill }}
                </el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="experience" label="相关经验" width="100">
            <template #default="{ row }">
              <el-rate v-model="row.experienceLevel" disabled show-score text-color="#ff9900" />
            </template>
          </el-table-column>
          <el-table-column prop="status" label="申请状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getApplicationStatusColor(row.status)">
                {{ getApplicationStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="applyTime" label="申请时间" width="120">
            <template #default="{ row }">
              {{ formatDate(row.applyTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button type="primary" size="small" @click="handleViewProfile(row.applicantId)"> 查看档案 </el-button>
                <el-button v-if="row.status === 'pending'" type="success" size="small" @click="handleApprove(row)"> 通过 </el-button>
                <el-button v-if="row.status === 'pending'" type="danger" size="small" @click="handleReject(row)"> 拒绝 </el-button>
                <el-button v-if="row.status === 'approved'" type="warning" size="small" @click="handleRevoke(row)"> 撤销 </el-button>
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

    <!-- 申请详情对话框 -->
    <el-dialog v-model="dialogVisible" title="申请详情" width="60%" :close-on-click-modal="false">
      <div class="application-detail" v-if="currentApplication">
        <div class="detail-section">
          <h4>申请人信息</h4>
          <div class="applicant-profile">
            <img :src="currentApplication.applicantAvatar || '/default-avatar.jpg'" class="profile-avatar" />
            <div class="profile-info">
              <h5>{{ currentApplication.applicantName }}</h5>
              <p>{{ currentApplication.applicantTitle }}</p>
              <p>{{ currentApplication.applicantEmail }}</p>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4>申请信息</h4>
          <el-form label-width="100px">
            <el-form-item label="申请岗位：">
              <span>{{ currentApplication.appliedPosition }}</span>
            </el-form-item>
            <el-form-item label="申请理由：">
              <p>{{ currentApplication.motivation }}</p>
            </el-form-item>
            <el-form-item label="相关经验：">
              <el-rate v-model="currentApplication.experienceLevel" disabled show-score />
            </el-form-item>
            <el-form-item label="技能标签：">
              <div class="skills-display">
                <el-tag v-for="skill in (currentApplication.skills || '').split(',')" :key="skill" style="margin-right: 8px">
                  {{ skill }}
                </el-tag>
              </div>
            </el-form-item>
          </el-form>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
          <el-button v-if="currentApplication?.status === 'pending'" type="success" @click="handleApprove(currentApplication)"> 通过申请 </el-button>
          <el-button v-if="currentApplication?.status === 'pending'" type="danger" @click="handleReject(currentApplication)"> 拒绝申请 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';

// 改为导入完整的API接口定义
import {
  getProject,
  ProjectInfo,
  getProjectApplicationsList,
  approveProjectApplication,
  rejectProjectApplication,
  revokeProjectApplication,
  batchApproveApplications,
  batchRejectApplications,
  ApplicationInfo,
  ApplicationQuery
} from '@/api/hit/project';

const router = useRouter();
const route = useRoute();

const projectId = Number(route.params.id);

// 响应式数据
const loading = ref(false);
const applicationsList = ref<any[]>([]);
const total = ref(0);
const selectedApplications = ref<any[]>([]);
const dateRange = ref<[Date, Date] | null>(null);
const dialogVisible = ref(false);
const currentApplication = ref<any>(null);
const projectInfo = ref<ProjectInfo | null>(null);

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  projectId: projectId,
  applicantName: '',
  status: '',
  beginApplyTime: '',
  endApplyTime: ''
});

// 获取项目信息
const getProjectInfo = async () => {
  try {
    const response = await getProject(projectId);
    projectInfo.value = response.data;
  } catch (error) {
    console.error('获取项目信息失败:', error);
    ElMessage.error('获取项目信息失败');
  }
};

// 获取申请列表（替换模拟数据为真实API调用）
const getApplicationsList = async () => {
  loading.value = true;
  try {
    // 使用真实API调用替换模拟数据
    const response = await getProjectApplicationsList({
      projectId: projectId,
      status: queryParams.status,
      pageNum: queryParams.pageNum,
      pageSize: queryParams.pageSize
    });

    applicationsList.value = response.data.rows || [];
    total.value = response.data.total || 0;
  } catch (error) {
    console.error('获取申请列表失败:', error);
    ElMessage.error('获取申请列表失败');
    applicationsList.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleQuery = () => {
  queryParams.pageNum = 1;
  getApplicationsList();
};

// 日期范围变化
const handleDateChange = (dates: [Date, Date] | null) => {
  if (dates) {
    queryParams.beginApplyTime = dates[0].toISOString().split('T')[0];
    queryParams.endApplyTime = dates[1].toISOString().split('T')[0];
  } else {
    queryParams.beginApplyTime = '';
    queryParams.endApplyTime = '';
  }
};

// 分页
const handleSizeChange = (size: number) => {
  queryParams.pageSize = size;
  getApplicationsList();
};

const handleCurrentChange = (page: number) => {
  queryParams.pageNum = page;
  getApplicationsList();
};

// 选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedApplications.value = selection;
};

// 查看档案
const handleViewProfile = (applicantId: number) => {
  router.push(`/hit/userProfile/${applicantId}`);
};

// 通过申请
const handleApprove = async (application: any) => {
  try {
    await ElMessageBox.confirm(`确定要通过"${application.applicantName}"的申请吗？`, '确认通过', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success'
    });

    // 使用真实API调用
    await approveProjectApplication(application.id);

    ElMessage.success('申请已通过');
    await getApplicationsList(); // 刷新申请列表
  } catch (error) {
    if (error !== 'cancel') {
      console.error('通过申请失败:', error);
      ElMessage.error('通过申请失败');
    }
  }
};

// 拒绝申请
const handleReject = async (application: any) => {
  try {
    const { value: reviewComment } = await ElMessageBox.prompt('请输入拒绝理由', '拒绝申请', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /.+/,
      inputErrorMessage: '请输入拒绝理由'
    });

    // 使用真实API调用
    await rejectProjectApplication(application.id, reviewComment);

    ElMessage.success('申请已拒绝');
    await getApplicationsList(); // 刷新申请列表
  } catch (error) {
    if (error !== 'cancel') {
      console.error('拒绝申请失败:', error);
      ElMessage.error('拒绝申请失败');
    }
  }
};

// 撤销申请状态
const handleRevoke = async (application: any) => {
  try {
    await ElMessageBox.confirm(`确定要撤销"${application.applicantName}"的申请状态吗？`, '确认撤销', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    // 使用真实API调用
    await revokeProjectApplication(application.id);

    ElMessage.success('申请状态已撤销');
    await getApplicationsList(); // 刷新申请列表
  } catch (error) {
    if (error !== 'cancel') {
      console.error('撤销申请失败:', error);
      ElMessage.error('撤销申请失败');
    }
  }
};

// 批量通过
const handleBatchApprove = async () => {
  if (selectedApplications.value.length === 0) {
    ElMessage.warning('请选择要通过的申请');
    return;
  }

  try {
    await ElMessageBox.confirm(`确定要批量通过${selectedApplications.value.length}个申请吗？`, '确认批量通过', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success'
    });

    // 使用真实API调用
    await batchApproveApplications(selectedApplications.value.map((app) => app.id));

    ElMessage.success('批量操作完成');
    selectedApplications.value = [];
    await getApplicationsList(); // 刷新申请列表
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量通过失败:', error);
      ElMessage.error('批量通过失败');
    }
  }
};

// 批量拒绝
const handleBatchReject = async () => {
  if (selectedApplications.value.length === 0) {
    ElMessage.warning('请选择要拒绝的申请');
    return;
  }

  try {
    const { value: reviewComment } = await ElMessageBox.prompt('请输入批量拒绝理由', '批量拒绝申请', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /.+/,
      inputErrorMessage: '请输入拒绝理由'
    });

    // 使用真实API调用
    await batchRejectApplications(
      selectedApplications.value.map((app) => app.id),
      reviewComment
    );

    ElMessage.success('批量操作完成');
    selectedApplications.value = [];
    await getApplicationsList(); // 刷新申请列表
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量拒绝失败:', error);
      ElMessage.error('批量拒绝失败');
    }
  }
};

// 返回上一页
const handleBack = () => {
  router.back();
};

// 工具函数
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('zh-CN');
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

const getApplicationStatusText = (status: string) => {
  const statuses: Record<string, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝'
  };
  return statuses[status] || status;
};

const getApplicationStatusColor = (status: string): 'warning' | 'success' | 'danger' => {
  const colors: Record<string, 'warning' | 'success' | 'danger'> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  };
  return colors[status] || 'warning';
};

// 生命周期
onMounted(() => {
  if (!projectId || isNaN(projectId)) {
    ElMessage.error('项目ID无效');
    router.back();
    return;
  }
  getProjectInfo();
  getApplicationsList();
});
</script>

<style scoped lang="scss">
.project-applications-container {
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

.project-info-section,
.filter-section,
.applications-list {
  max-width: 1200px;
  margin: 0 auto 30px auto;
  padding: 0 20px;

  .project-info-card,
  .filter-card,
  .list-card {
    border-radius: 15px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  }
}

.project-basic-info {
  display: flex;
  align-items: flex-start;
  gap: 20px;

  .project-cover {
    img {
      width: 120px;
      height: 80px;
      object-fit: cover;
      border-radius: 8px;
    }
  }

  .project-details {
    flex: 1;

    .project-name {
      font-size: 1.3rem;
      font-weight: bold;
      color: #333;
      margin: 0 0 10px 0;
    }

    .project-description {
      color: #666;
      margin-bottom: 15px;
      line-height: 1.5;
    }

    .project-stats {
      display: flex;
      gap: 20px;

      .stat-item {
        .stat-label {
          color: #666;
          font-size: 0.9rem;
        }

        .stat-value {
          font-weight: bold;
          color: #333;
        }
      }
    }
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

.applicant-info {
  display: flex;
  align-items: center;
  gap: 12px;

  .applicant-avatar {
    img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
    }
  }

  .applicant-details {
    .applicant-name {
      font-weight: bold;
      color: #333;
      margin-bottom: 2px;
    }

    .applicant-title {
      font-size: 0.85rem;
      color: #666;
    }
  }
}

.motivation-text {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.skills-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
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

.application-detail {
  .detail-section {
    margin-bottom: 20px;

    h4 {
      color: #333;
      margin-bottom: 15px;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
    }

    .applicant-profile {
      display: flex;
      align-items: center;
      gap: 15px;

      .profile-avatar {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        object-fit: cover;
      }

      .profile-info {
        h5 {
          margin: 0 0 5px 0;
          color: #333;
        }

        p {
          margin: 0 0 3px 0;
          color: #666;
          font-size: 0.9rem;
        }
      }
    }

    .skills-display {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  }
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
