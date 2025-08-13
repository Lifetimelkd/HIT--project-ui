<template>
  <div class="project-admin-table">
    <!-- 操作栏 -->
    <div class="table-header">
      <div class="search-area">
        <el-input
          v-model="queryParams.projectName"
          placeholder="搜索项目名称"
          style="width: 200px;"
          clearable
          @clear="handleQuery"
          @keyup.enter="handleQuery"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-select
          v-model="queryParams.projectType"
          placeholder="项目类型"
          style="width: 120px; margin-left: 10px;"
          clearable
          @change="handleQuery"
        >
          <el-option label="学术研究" value="academic" />
          <el-option label="竞赛项目" value="competition" />
          <el-option label="实践项目" value="practice" />
          <el-option label="毕业设计" value="graduation" />
          <el-option label="课程项目" value="course" />
        </el-select>
        
        <el-select
          v-model="queryParams.status"
          placeholder="项目状态"
          style="width: 120px; margin-left: 10px;"
          clearable
          @change="handleQuery"
        >
          <el-option label="进行中" value="active" />
          <el-option label="已暂停" value="paused" />
          <el-option label="已完成" value="completed" />
          <el-option label="已取消" value="cancelled" />
        </el-select>
        
        <el-button type="primary" @click="handleQuery" style="margin-left: 10px;">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
        
        <el-button @click="resetQuery" style="margin-left: 10px;">
          <el-icon><Refresh /></el-icon>
          重置
        </el-button>
      </div>
      
      <div class="action-area">
        <el-button
          type="success"
          @click="handleExport"
          :loading="exportLoading"
        >
          <el-icon><Download /></el-icon>
          导出
        </el-button>
        
        <el-button
          type="danger"
          @click="handleBatchDelete"
          :disabled="selectedProjects.length === 0"
        >
          <el-icon><Delete /></el-icon>
          批量删除
        </el-button>
        
        <el-button
          type="warning"
          @click="handleBatchOperation"
          :disabled="selectedProjects.length === 0"
        >
          <el-icon><Operation /></el-icon>
          批量操作
        </el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <el-table
      v-loading="loading"
      :data="projectList"
      @selection-change="handleSelectionChange"
      row-key="projectId"
      border
      stripe
    >
      <el-table-column type="selection" width="50" />
      
      <el-table-column prop="projectId" label="项目ID" width="80" />
      
      <el-table-column prop="projectName" label="项目名称" min-width="150">
        <template #default="{ row }">
          <div class="project-name">
            <el-image
              v-if="row.coverImage"
              :src="row.coverImage"
              class="project-avatar"
              fit="cover"
            />
            <div v-else class="project-avatar-placeholder">
              {{ row.projectName?.charAt(0) }}
            </div>
            <div class="name-content">
              <div class="name">{{ row.projectName }}</div>
              <div class="tags">
                <el-tag v-if="row.isFeatured === '1'" type="warning" size="small">精选</el-tag>
                <el-tag v-if="row.isUrgent === '1'" type="danger" size="small">紧急</el-tag>
                <el-tag v-if="row.isCredit === '1'" type="success" size="small">学分</el-tag>
              </div>
            </div>
          </div>
        </template>
      </el-table-column>
      
      <el-table-column prop="creatorName" label="创建者" width="100" />
      
      <el-table-column prop="projectType" label="类型" width="100">
        <template #default="{ row }">
          <el-tag>{{ getProjectTypeText(row.projectType) }}</el-tag>
        </template>
      </el-table-column>
      
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column prop="recruitmentStatus" label="招募状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getRecruitmentStatusType(row.recruitmentStatus)">
            {{ getRecruitmentStatusText(row.recruitmentStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column label="统计数据" width="160">
        <template #default="{ row }">
          <div class="stats-info">
            <div>浏览: {{ row.viewCount || 0 }}</div>
            <div>点赞: {{ row.likeCount || 0 }}</div>
            <div>收藏: {{ row.collectCount || 0 }}</div>
            <div>申请: {{ row.applyCount || 0 }}</div>
          </div>
        </template>
      </el-table-column>
      
      <el-table-column prop="currentMembers" label="成员" width="80">
        <template #default="{ row }">
          {{ row.currentMembers || 0 }}/{{ row.teamSizeMax || 0 }}
        </template>
      </el-table-column>
      
      <el-table-column prop="createTime" label="创建时间" width="160">
        <template #default="{ row }">
          {{ formatDateTime(row.createTime) }}
        </template>
      </el-table-column>
      
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button-group>
            <el-button size="small" @click="handleView(row)">
              <el-icon><View /></el-icon>
              查看
            </el-button>
            <el-button size="small" type="primary" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
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
    <el-dialog
      v-model="batchDialogVisible"
      title="批量操作"
      width="500px"
      append-to-body
    >
      <el-form :model="batchForm" label-width="100px">
        <el-form-item label="操作类型">
          <el-select v-model="batchForm.operation" placeholder="请选择操作类型">
            <el-option label="修改状态" value="status" />
            <el-option label="修改招募状态" value="recruitmentStatus" />
            <el-option label="设置精选" value="featured" />
            <el-option label="设置紧急" value="urgent" />
            <el-option label="设置学分认定" value="credit" />
          </el-select>
        </el-form-item>
        
        <el-form-item v-if="batchForm.operation === 'status'" label="项目状态">
          <el-select v-model="batchForm.status" placeholder="请选择状态">
            <el-option label="进行中" value="active" />
            <el-option label="已暂停" value="paused" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        
        <el-form-item v-if="batchForm.operation === 'recruitmentStatus'" label="招募状态">
          <el-select v-model="batchForm.recruitmentStatus" placeholder="请选择招募状态">
            <el-option label="开放招募" value="open" />
            <el-option label="暂停招募" value="paused" />
            <el-option label="关闭招募" value="closed" />
          </el-select>
        </el-form-item>
        
        <el-form-item v-if="['featured', 'urgent', 'credit'].includes(batchForm.operation)" label="设置值">
          <el-radio-group v-model="batchForm.flagValue">
            <el-radio value="1">启用</el-radio>
            <el-radio value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="batchDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmBatchOperation">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
import { listProject, delProject, updateProject, exportProject, ProjectInfo, ProjectQuery } from '@/api/hit/project';

const router = useRouter();

const loading = ref(false);
const exportLoading = ref(false);
const projectList = ref<ProjectInfo[]>([]);
const selectedProjects = ref<ProjectInfo[]>([]);
const total = ref(0);

const queryParams = reactive<ProjectQuery>({
  pageNum: 1,
  pageSize: 20,
  projectName: '',
  projectType: '',
  status: ''
});

const batchDialogVisible = ref(false);
const batchForm = reactive({
  operation: '',
  status: '',
  recruitmentStatus: '',
  flagValue: '1'
});

// 获取项目列表
const getProjectList = async () => {
  loading.value = true;
  try {
    const response = await listProject(queryParams);
    if (response && response.rows) {
      projectList.value = response.rows;
      total.value = response.total;
    }
  } catch (error) {
    console.error('获取项目列表失败:', error);
    ElMessage.error('获取项目列表失败');
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleQuery = () => {
  queryParams.pageNum = 1;
  getProjectList();
};

// 重置搜索
const resetQuery = () => {
  queryParams.projectName = '';
  queryParams.projectType = '';
  queryParams.status = '';
  queryParams.pageNum = 1;
  getProjectList();
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

// 选择项目
const handleSelectionChange = (selection: ProjectInfo[]) => {
  selectedProjects.value = selection;
};

// 查看项目
const handleView = (row: ProjectInfo) => {
  router.push(`/hit/project/detail/${row.projectId}`);
};

// 编辑项目
const handleEdit = (row: ProjectInfo) => {
  router.push(`/hit/project/edit/${row.projectId}`);
};

// 删除项目
const handleDelete = async (row: ProjectInfo) => {
  await ElMessageBox.confirm(
    `确定要删除项目 "${row.projectName}" 吗？`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  );
  
  try {
    await delProject([row.projectId!]);
    ElMessage.success('删除成功');
    getProjectList();
  } catch (error) {
    console.error('删除失败:', error);
    ElMessage.error('删除失败');
  }
};

// 批量删除
const handleBatchDelete = async () => {
  if (selectedProjects.value.length === 0) {
    ElMessage.warning('请先选择要删除的项目');
    return;
  }
  
  await ElMessageBox.confirm(
    `确定要删除选中的 ${selectedProjects.value.length} 个项目吗？`,
    '确认批量删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  );
  
  try {
    const projectIds = selectedProjects.value.map(item => item.projectId!);
    await delProject(projectIds);
    ElMessage.success('批量删除成功');
    getProjectList();
  } catch (error) {
    console.error('批量删除失败:', error);
    ElMessage.error('批量删除失败');
  }
};

// 批量操作
const handleBatchOperation = () => {
  if (selectedProjects.value.length === 0) {
    ElMessage.warning('请先选择要操作的项目');
    return;
  }
  batchDialogVisible.value = true;
};

// 确认批量操作
const confirmBatchOperation = async () => {
  if (!batchForm.operation) {
    ElMessage.warning('请选择操作类型');
    return;
  }
  
  try {
    const promises = selectedProjects.value.map(project => {
      const updateData: any = { projectId: project.projectId };
      
      switch (batchForm.operation) {
        case 'status':
          updateData.status = batchForm.status;
          break;
        case 'recruitmentStatus':
          updateData.recruitmentStatus = batchForm.recruitmentStatus;
          break;
        case 'featured':
          updateData.isFeatured = batchForm.flagValue;
          break;
        case 'urgent':
          updateData.isUrgent = batchForm.flagValue;
          break;
        case 'credit':
          updateData.isCredit = batchForm.flagValue;
          break;
      }
      
      return updateProject(updateData);
    });
    
    await Promise.all(promises);
    ElMessage.success('批量操作成功');
    batchDialogVisible.value = false;
    getProjectList();
  } catch (error) {
    console.error('批量操作失败:', error);
    ElMessage.error('批量操作失败');
  }
};

// 导出
const handleExport = async () => {
  try {
    exportLoading.value = true;
    await exportProject(queryParams);
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

const getStatusType = (status: string): 'success' | 'warning' | 'info' | 'danger' | undefined => {
  const types: Record<string, 'success' | 'warning' | 'info' | 'danger'> = {
    active: 'success',
    paused: 'warning',
    completed: 'info',
    cancelled: 'danger'
  };
  return types[status];
};

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    active: '进行中',
    paused: '已暂停',
    completed: '已完成',
    cancelled: '已取消'
  };
  return texts[status] || status;
};

const getRecruitmentStatusType = (status: string): 'success' | 'warning' | 'danger' | undefined => {
  const types: Record<string, 'success' | 'warning' | 'danger'> = {
    open: 'success',
    paused: 'warning',
    closed: 'danger'
  };
  return types[status];
};

const getRecruitmentStatusText = (status: string) => {
  const texts: Record<string, string> = {
    open: '开放招募',
    paused: '暂停招募',
    closed: '关闭招募'
  };
  return texts[status] || status;
};

onMounted(() => {
  getProjectList();
});
</script>

<style scoped lang="scss">
.project-admin-table {
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

  .project-name {
    display: flex;
    align-items: center;
    gap: 10px;

    .project-avatar {
      width: 40px;
      height: 40px;
      border-radius: 6px;
    }

    .project-avatar-placeholder {
      width: 40px;
      height: 40px;
      border-radius: 6px;
      background: #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: #666;
    }

    .name-content {
      flex: 1;

      .name {
        font-weight: 500;
        margin-bottom: 4px;
      }

      .tags {
        display: flex;
        gap: 4px;
      }
    }
  }

  .stats-info {
    font-size: 12px;
    line-height: 1.4;
    color: #666;
  }

  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
}
</style> 