<template>
  <div class="application-admin-table">
    <!-- 操作栏 -->
    <div class="table-header">
      <div class="search-area">
        <el-input v-model="queryParams.projectId" placeholder="项目ID" style="width: 120px" clearable @clear="handleQuery" @keyup.enter="handleQuery">
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-input
          v-model="queryParams.userId"
          placeholder="申请人ID"
          style="width: 120px; margin-left: 10px"
          clearable
          @clear="handleQuery"
          @keyup.enter="handleQuery"
        />

        <el-select
          v-model="queryParams.applicationStatus"
          placeholder="申请状态"
          style="width: 120px; margin-left: 10px"
          clearable
          @change="handleQuery"
        >
          <el-option label="待审核" value="pending" />
          <el-option label="审核中" value="reviewing" />
          <el-option label="已通过" value="approved" />
          <el-option label="已拒绝" value="rejected" />
          <el-option label="已撤回" value="withdrawn" />
        </el-select>

        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 240px; margin-left: 10px"
          @change="handleDateChange"
        />

        <el-button type="primary" @click="handleQuery" style="margin-left: 10px">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>

        <el-button @click="resetQuery" style="margin-left: 10px">
          <el-icon><Refresh /></el-icon>
          重置
        </el-button>
      </div>

      <div class="action-area">
        <el-button type="success" @click="handleExport" :loading="exportLoading">
          <el-icon><Download /></el-icon>
          导出
        </el-button>

        <el-button type="primary" @click="handleBatchApprove" :disabled="selectedApplications.length === 0">
          <el-icon><Check /></el-icon>
          批量通过
        </el-button>

        <el-button type="danger" @click="handleBatchReject" :disabled="selectedApplications.length === 0">
          <el-icon><Close /></el-icon>
          批量拒绝
        </el-button>

        <el-button type="warning" @click="handleBatchOperation" :disabled="selectedApplications.length === 0">
          <el-icon><Operation /></el-icon>
          批量操作
        </el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="applicationList" @selection-change="handleSelectionChange" row-key="applicationId" border stripe>
      <el-table-column type="selection" width="50" />

      <el-table-column prop="applicationId" label="申请ID" width="80" />

      <el-table-column label="项目信息" min-width="200">
        <template #default="{ row }">
          <div class="project-info">
            <div class="project-name">{{ row.projectName || '未知项目' }}</div>
            <div class="project-type">类型: {{ getProjectTypeText(row.projectType) }}</div>
            <div class="project-creator">创建者: {{ row.creatorName || '未知' }}</div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="申请人信息" min-width="150">
        <template #default="{ row }">
          <div class="user-info">
            <el-avatar :size="40" class="user-avatar">
              {{ row.userName?.charAt(0) || 'U' }}
            </el-avatar>
            <div class="user-details">
              <div class="user-name">{{ row.userName || '未知用户' }}</div>
              <div class="user-email">{{ row.userEmail || '无邮箱' }}</div>
              <div class="user-phone">{{ row.contactInfo || '无联系方式' }}</div>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="申请状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getApplicationStatusType(row.applicationStatus)">
            {{ getApplicationStatusText(row.applicationStatus) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="priorityScore" label="优先级评分" width="100">
        <template #default="{ row }">
          <el-progress :percentage="row.priorityScore || 0" :color="getScoreColor(row.priorityScore || 0)" :stroke-width="8" />
        </template>
      </el-table-column>

      <el-table-column label="申请内容" min-width="200">
        <template #default="{ row }">
          <div class="application-content">
            <div class="reason" v-if="row.applicationReason">
              <strong>申请理由:</strong>
              <div class="text-ellipsis">{{ row.applicationReason }}</div>
            </div>
            <div class="experience" v-if="row.relevantExperience">
              <strong>相关经验:</strong>
              <div class="text-ellipsis">{{ row.relevantExperience }}</div>
            </div>
            <div class="contribution" v-if="row.expectedContribution">
              <strong>预期贡献:</strong>
              <div class="text-ellipsis">{{ row.expectedContribution }}</div>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="availableTime" label="可投入时间" width="120">
        <template #default="{ row }">
          {{ row.availableTime || '未填写' }}
        </template>
      </el-table-column>

      <el-table-column label="附件" width="100">
        <template #default="{ row }">
          <div class="attachments">
            <el-button v-if="row.resumeUrl" size="small" type="primary" link @click="handleViewAttachment(row.resumeUrl, '简历')"> 简历 </el-button>
            <el-button v-if="row.portfolioUrl" size="small" type="success" link @click="handleViewAttachment(row.portfolioUrl, '作品集')">
              作品集
            </el-button>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="createTime" label="申请时间" width="160">
        <template #default="{ row }">
          {{ formatDateTime(row.createTime) }}
        </template>
      </el-table-column>

      <el-table-column label="审核信息" width="160">
        <template #default="{ row }">
          <div v-if="row.reviewTime" class="review-info">
            <div>审核人: {{ row.reviewerName || '未知' }}</div>
            <div>时间: {{ formatDateTime(row.reviewTime) }}</div>
            <div v-if="row.reviewResult" class="review-result">结果: {{ row.reviewResult }}</div>
          </div>
          <div v-else class="no-review">未审核</div>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button-group v-if="row.applicationStatus === 'pending' || row.applicationStatus === 'reviewing'">
            <el-button size="small" @click="handleViewDetail(row)">
              <el-icon><View /></el-icon>
              查看
            </el-button>
            <el-button size="small" type="success" @click="handleApprove(row)">
              <el-icon><Check /></el-icon>
              通过
            </el-button>
            <el-button size="small" type="danger" @click="handleReject(row)">
              <el-icon><Close /></el-icon>
              拒绝
            </el-button>
          </el-button-group>
          <el-button-group v-else>
            <el-button size="small" @click="handleViewDetail(row)">
              <el-icon><View /></el-icon>
              查看
            </el-button>
            <el-button size="small" type="primary" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
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

    <!-- 批量操作对话框 -->
    <el-dialog v-model="batchDialogVisible" title="批量操作" width="500px" append-to-body>
      <el-form :model="batchForm" label-width="100px">
        <el-form-item label="操作类型">
          <el-select v-model="batchForm.operation" placeholder="请选择操作类型">
            <el-option label="批量审核" value="review" />
            <el-option label="修改状态" value="status" />
            <el-option label="分配审核人" value="reviewer" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="batchForm.operation === 'review'" label="审核结果">
          <el-select v-model="batchForm.reviewStatus" placeholder="请选择审核结果">
            <el-option label="通过" value="approved" />
            <el-option label="拒绝" value="rejected" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="batchForm.operation === 'review'" label="审核意见">
          <el-input v-model="batchForm.reviewResult" type="textarea" :rows="3" placeholder="请输入审核意见" />
        </el-form-item>

        <el-form-item v-if="batchForm.operation === 'status'" label="申请状态">
          <el-select v-model="batchForm.applicationStatus" placeholder="请选择状态">
            <el-option label="待审核" value="pending" />
            <el-option label="审核中" value="reviewing" />
            <el-option label="已通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
            <el-option label="已撤回" value="withdrawn" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="batchForm.operation === 'reviewer'" label="审核人">
          <el-select v-model="batchForm.reviewerId" placeholder="请选择审核人">
            <el-option label="管理员" :value="1" />
            <el-option label="项目负责人" :value="2" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="batchDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmBatchOperation">确定</el-button>
      </template>
    </el-dialog>

    <!-- 申请详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="申请详情" width="800px" append-to-body>
      <div v-if="currentApplication" class="application-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="申请ID">{{ currentApplication.applicationId }}</el-descriptions-item>
          <el-descriptions-item label="项目名称">{{ currentApplication.projectName }}</el-descriptions-item>
          <el-descriptions-item label="申请人">{{ currentApplication.userName }}</el-descriptions-item>
          <el-descriptions-item label="联系方式">{{ currentApplication.contactInfo }}</el-descriptions-item>
          <el-descriptions-item label="申请状态">
            <el-tag :type="getApplicationStatusType(currentApplication.applicationStatus)">
              {{ getApplicationStatusText(currentApplication.applicationStatus) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="优先级评分">{{ currentApplication.priorityScore || 0 }}</el-descriptions-item>
          <el-descriptions-item label="可投入时间">{{ currentApplication.availableTime || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="申请时间">{{ formatDateTime(currentApplication.createTime) }}</el-descriptions-item>
        </el-descriptions>

        <div class="detail-content" style="margin-top: 20px">
          <div v-if="currentApplication.applicationReason" class="content-section">
            <h4>申请理由</h4>
            <p>{{ currentApplication.applicationReason }}</p>
          </div>

          <div v-if="currentApplication.selfIntroduction" class="content-section">
            <h4>自我介绍</h4>
            <p>{{ currentApplication.selfIntroduction }}</p>
          </div>

          <div v-if="currentApplication.relevantExperience" class="content-section">
            <h4>相关经验</h4>
            <p>{{ currentApplication.relevantExperience }}</p>
          </div>

          <div v-if="currentApplication.expectedContribution" class="content-section">
            <h4>预期贡献</h4>
            <p>{{ currentApplication.expectedContribution }}</p>
          </div>

          <div v-if="currentApplication.reviewResult" class="content-section">
            <h4>审核结果</h4>
            <p>{{ currentApplication.reviewResult }}</p>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import request from '@/utils/request';

// 修复: 导入真实的API接口
import {
  getProjectApplicationsList as listApplications,
  approveProjectApplication,
  rejectProjectApplication,
  batchApproveApplications,
  batchRejectApplications
} from '@/api/hit/project';

// 修复: 更新接口定义，匹配后端返回的数据结构
interface ApplicationInfo {
  applicationId: number;
  projectId: number;
  userId: number;
  roleId?: number;
  applicationReason?: string;
  selfIntroduction?: string;
  relevantExperience?: string;
  expectedContribution?: string;
  availableTime?: string;
  contactInfo?: string;
  resumeUrl?: string;
  portfolioUrl?: string;
  applicationStatus: string;
  reviewResult?: string;
  reviewTime?: string;
  reviewerId?: number;
  interviewTime?: string;
  interviewNotes?: string;
  priorityScore?: number;
  createTime: string;
  // 关联数据
  projectName?: string;
  projectType?: string;
  creatorName?: string;
  userName?: string;
  userEmail?: string;
  reviewerName?: string;
}

interface ApplicationQuery {
  pageNum: number;
  pageSize: number;
  projectId?: string;
  userId?: string;
  applicationStatus?: string;
  beginCreateTime?: string;
  endCreateTime?: string;
}

const loading = ref(false);
const exportLoading = ref(false);
const applicationList = ref<ApplicationInfo[]>([]);
const selectedApplications = ref<ApplicationInfo[]>([]);
const total = ref(0);
const dateRange = ref<[Date, Date] | null>(null);

const queryParams = reactive<ApplicationQuery>({
  pageNum: 1,
  pageSize: 20,
  projectId: '',
  userId: '',
  applicationStatus: ''
});

const batchDialogVisible = ref(false);
const detailDialogVisible = ref(false);
const currentApplication = ref<ApplicationInfo | null>(null);

const batchForm = reactive({
  operation: '',
  reviewStatus: '',
  reviewResult: '',
  applicationStatus: '',
  reviewerId: null as number | null
});

// 修复: 连接真实的后端API
const getApplicationList = async () => {
  loading.value = true;
  try {
    // 构建查询参数
    const queryData = {
      projectId: 0, // 管理员查看所有项目的申请
      status: queryParams.applicationStatus,
      pageNum: queryParams.pageNum,
      pageSize: queryParams.pageSize
    };

    // 调用后端API - 管理员列表接口
    const response = await request({
      url: '/hit/project/application/list',
      method: 'get',
      params: {
        ...queryParams,
        beginCreateTime: queryParams.beginCreateTime,
        endCreateTime: queryParams.endCreateTime
      }
    });

    if (response && response.rows) {
      applicationList.value = response.rows;
      total.value = response.total;
    }
  } catch (error) {
    console.error('获取申请列表失败:', error);
    ElMessage.error('获取申请列表失败');
  } finally {
    loading.value = false;
  }
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
  handleQuery();
};

// 搜索
const handleQuery = () => {
  queryParams.pageNum = 1;
  getApplicationList();
};

// 重置搜索
const resetQuery = () => {
  queryParams.projectId = '';
  queryParams.userId = '';
  queryParams.applicationStatus = '';
  queryParams.beginCreateTime = '';
  queryParams.endCreateTime = '';
  dateRange.value = null;
  queryParams.pageNum = 1;
  getApplicationList();
};

// 分页
const handleSizeChange = (size: number) => {
  queryParams.pageSize = size;
  getApplicationList();
};

const handleCurrentChange = (page: number) => {
  queryParams.pageNum = page;
  getApplicationList();
};

// 选择申请
const handleSelectionChange = (selection: ApplicationInfo[]) => {
  selectedApplications.value = selection;
};

// 查看详情
const handleViewDetail = (row: ApplicationInfo) => {
  currentApplication.value = row;
  detailDialogVisible.value = true;
};

// 查看附件
const handleViewAttachment = (url: string, type: string) => {
  window.open(url, '_blank');
  ElMessage.success(`正在打开${type}`);
};

// 修复: 单个审核 - 通过
const handleApprove = async (row: ApplicationInfo) => {
  await ElMessageBox.confirm(`确定要通过 "${row.userName}" 的申请吗？`, '确认通过', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'success'
  });

  try {
    // 调用后端API审核申请
    await request({
      url: `/hit/project/application/review/${row.applicationId}`,
      method: 'put',
      params: {
        status: 'approved',
        reviewResult: '申请通过'
      }
    });
    ElMessage.success('申请审核通过');
    getApplicationList();
  } catch (error) {
    console.error('审核失败:', error);
    ElMessage.error('审核失败');
  }
};

// 修复: 单个审核 - 拒绝
const handleReject = async (row: ApplicationInfo) => {
  const { value } = await ElMessageBox.prompt('请输入拒绝理由', '拒绝申请', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPlaceholder: '请输入拒绝理由'
  });

  try {
    // 调用后端API审核申请
    await request({
      url: `/hit/project/application/review/${row.applicationId}`,
      method: 'put',
      params: {
        status: 'rejected',
        reviewResult: value
      }
    });
    ElMessage.success('申请已拒绝');
    getApplicationList();
  } catch (error) {
    console.error('审核失败:', error);
    ElMessage.error('审核失败');
  }
};

// 修复: 批量通过
const handleBatchApprove = async () => {
  if (selectedApplications.value.length === 0) {
    ElMessage.warning('请先选择要通过的申请');
    return;
  }

  await ElMessageBox.confirm(`确定要通过选中的 ${selectedApplications.value.length} 个申请吗？`, '确认批量通过', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'success'
  });

  try {
    // 调用后端API批量审核申请
    const applicationIds = selectedApplications.value.map((item) => item.applicationId);
    await request({
      url: '/hit/project/application/batch-review',
      method: 'put',
      params: {
        applicationIds,
        status: 'approved',
        reviewResult: '批量通过'
      }
    });
    ElMessage.success('批量审核通过');
    getApplicationList();
  } catch (error) {
    console.error('批量审核失败:', error);
    ElMessage.error('批量审核失败');
  }
};

// 修复: 批量拒绝
const handleBatchReject = async () => {
  if (selectedApplications.value.length === 0) {
    ElMessage.warning('请先选择要拒绝的申请');
    return;
  }

  const { value } = await ElMessageBox.prompt('请输入批量拒绝理由', '批量拒绝申请', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPlaceholder: '请输入拒绝理由'
  });

  try {
    // 调用后端API批量审核申请
    const applicationIds = selectedApplications.value.map((item) => item.applicationId);
    await request({
      url: '/hit/project/application/batch-review',
      method: 'put',
      params: {
        applicationIds,
        status: 'rejected',
        reviewResult: value
      }
    });
    ElMessage.success('批量拒绝成功');
    getApplicationList();
  } catch (error) {
    console.error('批量拒绝失败:', error);
    ElMessage.error('批量拒绝失败');
  }
};

// 批量操作
const handleBatchOperation = () => {
  if (selectedApplications.value.length === 0) {
    ElMessage.warning('请先选择要操作的申请');
    return;
  }
  batchDialogVisible.value = true;
};

// 修复: 确认批量操作
const confirmBatchOperation = async () => {
  if (!batchForm.operation) {
    ElMessage.warning('请选择操作类型');
    return;
  }

  try {
    const applicationIds = selectedApplications.value.map((item) => item.applicationId);

    if (batchForm.operation === 'review') {
      // 批量审核操作
      await request({
        url: '/hit/project/application/batch-review',
        method: 'put',
        params: {
          applicationIds,
          status: batchForm.reviewStatus,
          reviewResult: batchForm.reviewResult
        }
      });
    } else if (batchForm.operation === 'status') {
      // 批量状态修改 - 这个接口可能需要后端添加
      ElMessage.info('批量状态修改功能需要后端支持');
      return;
    }

    ElMessage.success('批量操作成功');
    batchDialogVisible.value = false;
    getApplicationList();
  } catch (error) {
    console.error('批量操作失败:', error);
    ElMessage.error('批量操作失败');
  }
};

// 编辑申请
const handleEdit = (row: ApplicationInfo) => {
  ElMessage.info('编辑申请功能开发中...');
};

// 修复: 导出功能
const handleExport = async () => {
  try {
    exportLoading.value = true;
    // 调用后端导出API
    await request({
      url: '/hit/project/application/export',
      method: 'post',
      data: queryParams,
      responseType: 'blob'
    });
    ElMessage.success('导出成功');
  } catch (error) {
    console.error('导出失败:', error);
    ElMessage.error('导出失败');
  } finally {
    exportLoading.value = false;
  }
};

// 工具函数
const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleString();
};

const getProjectTypeText = (type: string) => {
  const texts: Record<string, string> = {
    academic: '学术研究',
    competition: '竞赛项目',
    practice: '实践项目',
    graduation: '毕业设计',
    course: '课程项目'
  };
  return texts[type] || type;
};

const getApplicationStatusType = (status: string): 'primary' | 'success' | 'warning' | 'danger' | 'info' | undefined => {
  const types: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    pending: 'primary',
    reviewing: 'warning',
    approved: 'success',
    rejected: 'danger',
    withdrawn: 'info'
  };
  return types[status];
};

const getApplicationStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '待审核',
    reviewing: '审核中',
    approved: '已通过',
    rejected: '已拒绝',
    withdrawn: '已撤回'
  };
  return texts[status] || status;
};

const getScoreColor = (score: number) => {
  if (score >= 80) return '#67c23a';
  if (score >= 60) return '#e6a23c';
  return '#f56c6c';
};

onMounted(() => {
  getApplicationList();
});
</script>

<style scoped lang="scss">
.application-admin-table {
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .search-area {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
    }

    .action-area {
      display: flex;
      gap: 10px;
    }
  }

  .project-info {
    .project-name {
      font-weight: 500;
      margin-bottom: 4px;
    }

    .project-type,
    .project-creator {
      font-size: 12px;
      color: #666;
      margin-bottom: 2px;
    }
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 10px;

    .user-avatar {
      flex-shrink: 0;
    }

    .user-details {
      flex: 1;

      .user-name {
        font-weight: 500;
        margin-bottom: 4px;
      }

      .user-email,
      .user-phone {
        font-size: 12px;
        color: #666;
        margin-bottom: 2px;
      }
    }
  }

  .application-content {
    font-size: 12px;

    .reason,
    .experience,
    .contribution {
      margin-bottom: 8px;

      strong {
        display: block;
        margin-bottom: 2px;
        color: #333;
      }

      .text-ellipsis {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: #666;
        max-width: 180px;
      }
    }
  }

  .attachments {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .review-info {
    font-size: 12px;
    color: #666;

    .review-result {
      margin-top: 4px;
      font-weight: 500;
      color: #333;
    }
  }

  .no-review {
    color: #999;
    font-size: 12px;
  }

  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }

  .application-detail {
    .content-section {
      margin-bottom: 20px;

      h4 {
        margin: 0 0 10px 0;
        color: #333;
        font-size: 16px;
      }

      p {
        margin: 0;
        line-height: 1.6;
        color: #666;
      }
    }
  }
}
</style>
