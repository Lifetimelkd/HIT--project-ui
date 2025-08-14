<template>
  <div class="member-admin-table">
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
          placeholder="用户ID"
          style="width: 120px; margin-left: 10px"
          clearable
          @clear="handleQuery"
          @keyup.enter="handleQuery"
        />

        <el-select v-model="queryParams.memberStatus" placeholder="成员状态" style="width: 120px; margin-left: 10px" clearable @change="handleQuery">
          <el-option label="活跃" value="active" />
          <el-option label="非活跃" value="inactive" />
          <el-option label="已离开" value="left" />
        </el-select>

        <el-select v-model="queryParams.isLeader" placeholder="是否领导" style="width: 120px; margin-left: 10px" clearable @change="handleQuery">
          <el-option label="是" value="1" />
          <el-option label="否" value="0" />
        </el-select>

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

        <el-button type="danger" @click="handleBatchRemove" :disabled="selectedMembers.length === 0">
          <el-icon><Delete /></el-icon>
          批量移除
        </el-button>

        <el-button type="warning" @click="handleBatchOperation" :disabled="selectedMembers.length === 0">
          <el-icon><Operation /></el-icon>
          批量操作
        </el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="memberList" @selection-change="handleSelectionChange" row-key="memberId" border stripe>
      <el-table-column type="selection" width="50" />

      <el-table-column prop="memberId" label="成员ID" width="80" />

      <el-table-column prop="projectId" label="项目ID" width="80" />

      <el-table-column label="项目信息" min-width="200">
        <template #default="{ row }">
          <div class="project-info">
            <div class="project-name">{{ row.projectName || '未知项目' }}</div>
            <div class="project-creator">创建者: {{ row.creatorName || '未知' }}</div>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="userId" label="用户ID" width="80" />

      <el-table-column label="用户信息" min-width="150">
        <template #default="{ row }">
          <div class="user-info">
            <el-avatar :size="40" class="user-avatar">
              {{ row.userName?.charAt(0) || 'U' }}
            </el-avatar>
            <div class="user-details">
              <div class="user-name">{{ row.userName || '未知用户' }}</div>
              <div class="user-email">{{ row.userEmail || '无邮箱' }}</div>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="memberRole" label="角色" width="120">
        <template #default="{ row }">
          <el-tag type="info">{{ row.memberRole || '无' }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getMemberStatusType(row.memberStatus)">
            {{ getMemberStatusText(row.memberStatus) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="权限" width="100">
        <template #default="{ row }">
          <el-tag v-if="row.isLeader === '1'" type="warning">领导者</el-tag>
          <el-tag v-else type="info">普通成员</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="表现数据" width="160">
        <template #default="{ row }">
          <div class="performance-info">
            <div>贡献度: {{ row.contributionScore || 0 }}</div>
            <div>评分: {{ row.performanceRating || 0 }}</div>
            <div>任务: {{ row.completedTasks || 0 }}/{{ row.totalTasks || 0 }}</div>
            <div>工时: {{ row.workHours || 0 }}h</div>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="joinTime" label="加入时间" width="160">
        <template #default="{ row }">
          {{ formatDateTime(row.joinTime) }}
        </template>
      </el-table-column>

      <el-table-column prop="leaveTime" label="离开时间" width="160">
        <template #default="{ row }">
          {{ row.leaveTime ? formatDateTime(row.leaveTime) : '-' }}
        </template>
      </el-table-column>

      <el-table-column label="操作" width="240" fixed="right">
        <template #default="{ row }">
          <el-button-group>
            <el-button size="small" @click="handleViewPerformance(row)">
              <el-icon><TrendCharts /></el-icon>
              表现
            </el-button>
            <el-button size="small" type="primary" @click="handleEditRole(row)">
              <el-icon><User /></el-icon>
              角色
            </el-button>
            <el-button size="small" type="warning" @click="handleSetLeader(row)">
              <el-icon><Star /></el-icon>
              领导
            </el-button>
            <el-button size="small" type="danger" @click="handleRemoveMember(row)">
              <el-icon><Delete /></el-icon>
              移除
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
            <el-option label="修改状态" value="status" />
            <el-option label="设置领导者" value="leader" />
            <el-option label="批量评分" value="performance" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="batchForm.operation === 'status'" label="成员状态">
          <el-select v-model="batchForm.memberStatus" placeholder="请选择状态">
            <el-option label="活跃" value="active" />
            <el-option label="非活跃" value="inactive" />
            <el-option label="已离开" value="left" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="batchForm.operation === 'leader'" label="领导者设置">
          <el-radio-group v-model="batchForm.isLeader">
            <el-radio value="1">设为领导者</el-radio>
            <el-radio value="0">取消领导者</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="batchForm.operation === 'performance'" label="贡献度评分">
          <el-input-number v-model="batchForm.contributionScore" :min="0" :max="100" :precision="2" placeholder="0.00" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="batchDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmBatchOperation">确定</el-button>
      </template>
    </el-dialog>

    <!-- 成员表现详情对话框 -->
    <el-dialog v-model="performanceDialogVisible" title="成员表现详情" width="600px" append-to-body>
      <div v-if="currentMember" class="performance-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="成员姓名">{{ currentMember.userName }}</el-descriptions-item>
          <el-descriptions-item label="所属项目">{{ currentMember.projectName }}</el-descriptions-item>
          <el-descriptions-item label="成员角色">{{ currentMember.memberRole }}</el-descriptions-item>
          <el-descriptions-item label="是否领导">{{ currentMember.isLeader === '1' ? '是' : '否' }}</el-descriptions-item>
          <el-descriptions-item label="贡献度评分">{{ currentMember.contributionScore || 0 }}</el-descriptions-item>
          <el-descriptions-item label="表现评分">{{ currentMember.performanceRating || 0 }}</el-descriptions-item>
          <el-descriptions-item label="完成任务">{{ currentMember.completedTasks || 0 }}</el-descriptions-item>
          <el-descriptions-item label="总任务数">{{ currentMember.totalTasks || 0 }}</el-descriptions-item>
          <el-descriptions-item label="工作时长">{{ currentMember.workHours || 0 }} 小时</el-descriptions-item>
          <el-descriptions-item label="加入时间">{{ formatDateTime(currentMember.joinTime) }}</el-descriptions-item>
        </el-descriptions>

        <div class="performance-actions" style="margin-top: 20px">
          <el-button type="primary" @click="handleEditPerformance">编辑表现</el-button>
          <el-button @click="handleViewTasks">查看任务</el-button>
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
import { getProjectMemberList, removeProjectMember, changeProjectMemberRole, searchUsers } from '@/api/hit/project';

interface MemberInfo {
  memberId: number;
  projectId: number;
  userId: number;
  roleId?: number;
  memberRole?: string;
  memberStatus: string;
  contributionScore?: number;
  completedTasks?: number;
  totalTasks?: number;
  workHours?: number;
  performanceRating?: number;
  isLeader: string;
  joinTime: string;
  leaveTime?: string;
  // 关联数据
  projectName?: string;
  creatorName?: string;
  userName?: string;
  userEmail?: string;
}

interface MemberQuery {
  pageNum: number;
  pageSize: number;
  projectId?: string;
  userId?: string;
  memberStatus?: string;
  isLeader?: string;
}

const loading = ref(false);
const exportLoading = ref(false);
const memberList = ref<MemberInfo[]>([]);
const selectedMembers = ref<MemberInfo[]>([]);
const total = ref(0);

const queryParams = reactive<MemberQuery>({
  pageNum: 1,
  pageSize: 20,
  projectId: '',
  userId: '',
  memberStatus: '',
  isLeader: ''
});

const batchDialogVisible = ref(false);
const performanceDialogVisible = ref(false);
const currentMember = ref<MemberInfo | null>(null);

const batchForm = reactive({
  operation: '',
  memberStatus: '',
  isLeader: '1',
  contributionScore: 0
});

// 修复: 连接真实的后端API
const getMemberList = async () => {
  loading.value = true;
  try {
    // 调用后端API获取成员列表
    const response = await request({
      url: '/hit/project/member/list',
      method: 'get',
      params: {
        ...queryParams,
        pageNum: queryParams.pageNum,
        pageSize: queryParams.pageSize
      }
    });

    if (response && response.rows) {
      memberList.value = response.rows;
      total.value = response.total;
    }
  } catch (error) {
    console.error('获取成员列表失败:', error);
    ElMessage.error('获取成员列表失败');
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleQuery = () => {
  queryParams.pageNum = 1;
  getMemberList();
};

// 重置搜索
const resetQuery = () => {
  queryParams.projectId = '';
  queryParams.userId = '';
  queryParams.memberStatus = '';
  queryParams.isLeader = '';
  queryParams.pageNum = 1;
  getMemberList();
};

// 分页
const handleSizeChange = (size: number) => {
  queryParams.pageSize = size;
  getMemberList();
};

const handleCurrentChange = (page: number) => {
  queryParams.pageNum = page;
  getMemberList();
};

// 选择成员
const handleSelectionChange = (selection: MemberInfo[]) => {
  selectedMembers.value = selection;
};

// 查看成员表现
const handleViewPerformance = (row: MemberInfo) => {
  currentMember.value = row;
  performanceDialogVisible.value = true;
};

// 修复: 编辑成员角色
const handleEditRole = (row: MemberInfo) => {
  ElMessageBox.prompt('请输入新的角色名称', '编辑角色', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputValue: row.memberRole
  }).then(async ({ value }) => {
    try {
      // 调用API更新角色
      await request({
        url: `/hit/project/member/role/${row.memberId}`,
        method: 'put',
        data: { memberRole: value }
      });
      ElMessage.success('角色更新成功');
      getMemberList();
    } catch (error) {
      console.error('更新角色失败:', error);
      ElMessage.error('更新角色失败');
    }
  });
};

// 修复: 设置领导者
const handleSetLeader = async (row: MemberInfo) => {
  const action = row.isLeader === '1' ? '取消' : '设置';
  await ElMessageBox.confirm(`确定要${action}该成员的领导者身份吗？`, '确认操作', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  });

  try {
    // 调用API设置领导者
    await request({
      url: `/hit/project/member/leader/${row.memberId}`,
      method: 'put',
      data: { isLeader: row.isLeader === '1' ? '0' : '1' }
    });
    ElMessage.success(`${action}领导者成功`);
    getMemberList();
  } catch (error) {
    console.error('设置领导者失败:', error);
    ElMessage.error('设置领导者失败');
  }
};

// 修复: 移除成员
const handleRemoveMember = async (row: MemberInfo) => {
  await ElMessageBox.confirm(`确定要移除成员 "${row.userName}" 吗？`, '确认移除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  });

  try {
    // 调用API移除成员
    await request({
      url: `/hit/project/member/remove/${row.memberId}`,
      method: 'put',
      data: { reason: '管理员移除' }
    });
    ElMessage.success('成员移除成功');
    getMemberList();
  } catch (error) {
    console.error('移除成员失败:', error);
    ElMessage.error('移除成员失败');
  }
};

// 批量移除
const handleBatchRemove = async () => {
  if (selectedMembers.value.length === 0) {
    ElMessage.warning('请先选择要移除的成员');
    return;
  }

  await ElMessageBox.confirm(`确定要移除选中的 ${selectedMembers.value.length} 个成员吗？`, '确认批量移除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  });

  try {
    // 调用API批量移除成员
    const memberIds = selectedMembers.value.map((member) => member.memberId);
    await request({
      url: '/hit/project/member/batch-remove',
      method: 'put',
      params: { memberIds, reason: '批量移除' }
    });
    ElMessage.success('批量移除成功');
    getMemberList();
  } catch (error) {
    console.error('批量移除失败:', error);
    ElMessage.error('批量移除失败');
  }
};

// 批量操作
const handleBatchOperation = () => {
  if (selectedMembers.value.length === 0) {
    ElMessage.warning('请先选择要操作的成员');
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
    const memberIds = selectedMembers.value.map((member) => member.memberId);

    switch (batchForm.operation) {
      case 'status':
        await request({
          url: '/hit/project/member/batch-status',
          method: 'put',
          params: { memberIds, memberStatus: batchForm.memberStatus }
        });
        break;
      case 'leader':
        // 批量设置领导者需要逐个处理
        for (const memberId of memberIds) {
          await request({
            url: `/hit/project/member/leader/${memberId}`,
            method: 'put',
            data: { isLeader: batchForm.isLeader }
          });
        }
        break;
      case 'performance':
        // 批量评分需要逐个处理
        for (const memberId of memberIds) {
          await request({
            url: `/hit/project/member/performance/${memberId}`,
            method: 'put',
            data: { contributionScore: batchForm.contributionScore }
          });
        }
        break;
    }

    ElMessage.success('批量操作成功');
    batchDialogVisible.value = false;
    getMemberList();
  } catch (error) {
    console.error('批量操作失败:', error);
    ElMessage.error('批量操作失败');
  }
};

// 导出
const handleExport = async () => {
  try {
    exportLoading.value = true;
    // 调用API导出成员列表
    await request({
      url: '/hit/project/member/export',
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

// 编辑表现
const handleEditPerformance = () => {
  ElMessage.info('编辑表现功能开发中...');
};

// 查看任务
const handleViewTasks = () => {
  ElMessage.info('查看任务功能开发中...');
};

// 工具函数
const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleString();
};

const getMemberStatusType = (status: string): 'success' | 'warning' | 'danger' | undefined => {
  const types: Record<string, 'success' | 'warning' | 'danger'> = {
    active: 'success',
    inactive: 'warning',
    left: 'danger'
  };
  return types[status];
};

const getMemberStatusText = (status: string) => {
  const texts: Record<string, string> = {
    active: '活跃',
    inactive: '非活跃',
    left: '已离开'
  };
  return texts[status] || status;
};

onMounted(() => {
  getMemberList();
});
</script>

<style scoped lang="scss">
.member-admin-table {
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

    .project-creator {
      font-size: 12px;
      color: #666;
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

      .user-email {
        font-size: 12px;
        color: #666;
      }
    }
  }

  .performance-info {
    font-size: 12px;
    line-height: 1.4;
    color: #666;
  }

  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }

  .performance-detail {
    .performance-actions {
      text-align: center;
    }
  }
}
</style>
