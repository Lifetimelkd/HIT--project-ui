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

        <!-- 调试信息 -->
        <div v-if="!loading && applicationsList.length === 0" style="padding: 20px; text-align: center; color: #666">
          <p>调试信息：</p>
          <p>申请列表长度：{{ applicationsList.length }}</p>
          <p>总数：{{ total }}</p>
          <p>加载状态：{{ loading ? '加载中' : '已完成' }}</p>
        </div>

        <el-table v-loading="loading" :data="applicationsList" @selection-change="handleSelectionChange" style="width: 100%">
          <el-table-column type="selection" width="55" />
          <el-table-column label="申请人" width="200">
            <template #default="{ row }">
              <div class="applicant-info">
                <div class="applicant-avatar">
                  <img :src="row.applicantAvatar || '/default-avatar.jpg'" :alt="row.applicantName || row.userName || '未知用户'" />
                </div>
                <div class="applicant-details">
                  <div class="applicant-name">{{ row.applicantName || row.userName || '未知用户' }}</div>
                  <div class="applicant-meta">
                    <div class="applicant-title">{{ row.applicantTitle || row.applicantCollege || '暂无专业' }}</div>
                    <div class="applicant-extra" v-if="row.applicantStudentId || row.studentId">
                      学号: {{ row.applicantStudentId || row.studentId }}
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="申请岗位" width="120">
            <template #default="{ row }">
              {{ row.roleName }}
            </template>
          </el-table-column>
          <el-table-column label="申请理由" min-width="200">
            <template #default="{ row }">
              <el-tooltip :content="row.applicationReason || row.motivation || ''" placement="top" :show-after="500">
                <div class="motivation-text">{{ row.applicationReason || row.motivation || '暂无理由' }}</div>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column label="相关经验" width="200">
            <template #default="{ row }">
              <el-tooltip :content="row.relevantExperience || ''" placement="top" :show-after="500">
                <div class="motivation-text">{{ row.relevantExperience || '暂无经验' }}</div>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column label="申请状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getApplicationStatusColor(row.applicationStatus || row.status)">
                {{ getApplicationStatusText(row.applicationStatus || row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="申请时间" width="120">
            <template #default="{ row }">
              {{ formatDate(row.createTime || row.applyTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button type="primary" size="small" @click="handleViewProfile((row.userId || row.applicantId)?.toString())"> 查看档案 </el-button>
                <el-button v-if="(row.applicationStatus || row.status) === 'pending'" type="success" size="small" @click="handleApprove(row)">
                  通过
                </el-button>
                <el-button v-if="(row.applicationStatus || row.status) === 'pending'" type="danger" size="small" @click="handleReject(row)">
                  拒绝
                </el-button>
                <el-button v-if="(row.applicationStatus || row.status) === 'approved'" type="warning" size="small" @click="handleRevoke(row)">
                  撤销
                </el-button>
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
              <h5>{{ currentApplication.applicantName || currentApplication.userName }}</h5>
              <p>{{ currentApplication.applicantTitle || currentApplication.applicantCollege }}</p>
              <p>{{ currentApplication.applicantEmail }}</p>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4>申请信息</h4>
          <el-form label-width="100px">
            <el-form-item label="申请岗位：">
              <span>{{ getRoleName(currentApplication.roleId) }}</span>
            </el-form-item>
            <el-form-item label="申请理由：">
              <p>{{ currentApplication.applicationReason || currentApplication.motivation }}</p>
            </el-form-item>
            <el-form-item label="相关经验：">
              <p>{{ currentApplication.relevantExperience || '暂无相关经验' }}</p>
            </el-form-item>
            <el-form-item label="自我介绍：" v-if="currentApplication.selfIntroduction">
              <p>{{ currentApplication.selfIntroduction }}</p>
            </el-form-item>
            <el-form-item label="预期贡献：" v-if="currentApplication.expectedContribution">
              <p>{{ currentApplication.expectedContribution }}</p>
            </el-form-item>
            <el-form-item label="可投入时间：" v-if="currentApplication.availableTime">
              <p>{{ currentApplication.availableTime }}</p>
            </el-form-item>
          </el-form>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
          <el-button
            v-if="(currentApplication?.applicationStatus || currentApplication?.status) === 'pending'"
            type="success"
            @click="handleApprove(currentApplication)"
          >
            通过申请
          </el-button>
          <el-button
            v-if="(currentApplication?.applicationStatus || currentApplication?.status) === 'pending'"
            type="danger"
            @click="handleReject(currentApplication)"
          >
            拒绝申请
          </el-button>
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

// 导入用户档案相关的API和接口
import { getUserProfileByUserId, UserProfileInfo } from '@/api/hit/userProfile';
import { getProjectRoles, ProjectRole } from '@/api/hit/project';

const router = useRouter();
const route = useRoute();

const projectId = route.params.id as string;

// 响应式数据
const loading = ref(false);
const applicationsList = ref<any[]>([]);
const total = ref(0);
const selectedApplications = ref<any[]>([]);
const dateRange = ref<[Date, Date] | null>(null);
const dialogVisible = ref(false);
const currentApplication = ref<any>(null);
const projectInfo = ref<ProjectInfo | null>(null);
const projectRoles = ref<ProjectRole[]>([]);

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
    console.log('正在获取项目信息，项目ID:', projectId);
    const response = await getProject(projectId);
    console.log('项目信息API响应:', response);

    if (response && response.data) {
      projectInfo.value = response.data;
      console.log('项目信息获取成功:', projectInfo.value);
    } else {
      console.warn('项目信息响应格式异常:', response);
      ElMessage.error('项目信息格式异常');
    }
  } catch (error) {
    console.error('获取项目信息失败:', error);

    // 详细的错误信息处理
    let errorMessage = '获取项目信息失败';
    if (error instanceof Error) {
      errorMessage += `: ${error.message}`;
    } else if (typeof error === 'object' && error !== null) {
      if ('response' in error && error.response) {
        const response = error.response as any;
        errorMessage += `: ${response.status} ${response.statusText}`;
        if (response.data && response.data.msg) {
          errorMessage += ` - ${response.data.msg}`;
        }
      }
    }

    ElMessage.error(errorMessage);
  }
};

// 获取项目角色信息
const getProjectRolesInfo = async () => {
  try {
    const response = await getProjectRoles(projectId);
    if (response && response.code === 200) {
      projectRoles.value = response.data || [];
      console.log('项目角色信息获取成功:', projectRoles.value);
    }
  } catch (error) {
    console.error('获取项目角色信息失败:', error);
  }
};

// 根据角色ID获取角色名称
const getRoleName = (roleId: string | number): string => {
  if (!roleId) return '未指定岗位';
  const role = projectRoles.value.find((r) => r.roleId === roleId.toString());
  return role ? role.roleName : '未知岗位';
};

// 获取申请列表（替换模拟数据为真实API调用）
const getApplicationsList = async () => {
  loading.value = true;
  try {
    console.log('正在获取申请列表，参数:', {
      projectId: projectId,
      status: queryParams.status,
      pageNum: queryParams.pageNum,
      pageSize: queryParams.pageSize
    });

    // 使用真实API调用替换模拟数据
    const response = await getProjectApplicationsList({
      projectId: projectId,
      status: queryParams.status,
      pageNum: queryParams.pageNum,
      pageSize: queryParams.pageSize
    });

    console.log('申请列表API响应:', response);

    // 处理后端返回的数据结构
    if (response) {
      let listData = [];
      let totalCount = 0;

      // 根据实际的API响应结构处理数据
      if (response.code === 200) {
        // 情况1: 直接在response中有rows和total
        if (response.rows && Array.isArray(response.rows)) {
          listData = response.rows;
          totalCount = response.total || 0;
        }
        // 情况2: 在response.data中有rows和total
        else if (response.data && response.data.rows && Array.isArray(response.data.rows)) {
          listData = response.data.rows;
          totalCount = response.data.total || 0;
        }
        // 情况3: response.data是数组
        else if (response.data && Array.isArray(response.data)) {
          listData = response.data;
          totalCount = response.total || listData.length;
        }
        // 情况4: 其他情况，尝试直接使用response作为数据
        else {
          console.warn('未识别的数据格式，尝试直接使用response:', response);
          listData = [];
          totalCount = 0;
        }
      } else {
        console.warn('API返回错误状态:', response.code, response.msg);
        ElMessage.error(response.msg || '获取申请列表失败');
        listData = [];
        totalCount = 0;
      }

      // 获取申请人详细档案信息
      if (listData.length > 0) {
        console.log('开始获取申请人详细档案信息...');
        const applicationsWithProfiles = await Promise.all(
          listData.map(async (application: any) => {
            try {
              // 获取申请人的userId，优先使用userId，兼容applicantId
              const userId = application.userId || application.applicantId;
              if (userId) {
                console.log(`正在获取用户 ${userId} 的档案信息...`);
                const profileResponse = await getUserProfileByUserId(userId.toString());

                if (profileResponse && profileResponse.code === 200 && profileResponse.data) {
                  const profile = profileResponse.data;
                  console.log(`用户 ${userId} 档案信息获取成功:`, profile);

                  // 将档案信息合并到申请数据中
                  return {
                    ...application,
                    applicantName: profile.realName || application.applicantName || application.userName,
                    applicantAvatar: profile.avatarUrl || application.applicantAvatar,
                    applicantTitle: profile.major || application.applicantTitle,
                    applicantEmail: profile.email || application.applicantEmail,
                    applicantCollege: profile.college,
                    applicantGrade: profile.grade,
                    applicantPhone: profile.phone,
                    applicantStudentId: profile.studentId
                  };
                } else {
                  console.warn(`获取用户 ${userId} 档案信息失败:`, profileResponse);
                }
              } else {
                console.warn('申请记录缺少用户ID:', application);
              }
            } catch (error) {
              console.error(`获取申请人 ${application.userId || application.applicantId} 档案信息失败:`, error);
            }

            // 如果获取档案信息失败，返回原始申请数据
            return application;
          })
        );

        applicationsList.value = applicationsWithProfiles;
        console.log('申请列表及档案信息获取完成:', applicationsWithProfiles);
      } else {
        applicationsList.value = listData;
      }

      total.value = totalCount;

      console.log('处理后的申请列表:', {
        list: applicationsList.value,
        total: total.value,
        listLength: applicationsList.value.length
      });

      if (applicationsList.value.length === 0 && totalCount === 0) {
        console.log('确认无申请数据');
      }
    } else {
      console.warn('API响应为空:', response);
      applicationsList.value = [];
      total.value = 0;
    }
  } catch (error) {
    console.error('获取申请列表失败:', error);

    // 详细的错误信息处理
    let errorMessage = '获取申请列表失败';
    if (error instanceof Error) {
      errorMessage += `: ${error.message}`;
    } else if (typeof error === 'object' && error !== null) {
      if ('response' in error && error.response) {
        const response = error.response as any;
        errorMessage += `: ${response.status} ${response.statusText}`;
        if (response.data && response.data.msg) {
          errorMessage += ` - ${response.data.msg}`;
        }
      }
    }

    ElMessage.error(errorMessage);
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
const handleViewProfile = (applicantId: string) => {
  router.push(`/hit/userProfile/${applicantId}`);
};

// 通过申请
const handleApprove = async (application: any) => {
  try {
    // 添加调试日志
    console.log('准备通过申请，申请数据:', application);
    console.log('申请ID (applicationId):', application.applicationId);
    console.log('申请ID (id):', application.id); // 检查是否存在旧字段

    if (!application.applicationId) {
      ElMessage.error('申请ID缺失，无法操作');
      return;
    }

    await ElMessageBox.confirm(`确定要通过"${application.applicantName || application.userName}"的申请吗？`, '确认通过', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success'
    });

    // 使用真实API调用
    await approveProjectApplication(application.applicationId);

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
    // 添加调试日志
    console.log('准备拒绝申请，申请数据:', application);
    console.log('申请ID (applicationId):', application.applicationId);

    if (!application.applicationId) {
      ElMessage.error('申请ID缺失，无法操作');
      return;
    }

    const { value: reviewComment } = await ElMessageBox.prompt('请输入拒绝理由', '拒绝申请', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /.+/,
      inputErrorMessage: '请输入拒绝理由'
    });

    // 使用真实API调用
    await rejectProjectApplication(application.applicationId, reviewComment);

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
    // 添加调试日志
    console.log('准备撤销申请，申请数据:', application);
    console.log('申请ID (applicationId):', application.applicationId);

    if (!application.applicationId) {
      ElMessage.error('申请ID缺失，无法操作');
      return;
    }

    await ElMessageBox.confirm(`确定要撤销"${application.applicantName || application.userName}"的申请状态吗？`, '确认撤销', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    // 使用真实API调用
    await revokeProjectApplication(application.applicationId);

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

  // 验证所有选中的申请都有有效的applicationId
  const invalidApplications = selectedApplications.value.filter((app) => !app.applicationId);
  if (invalidApplications.length > 0) {
    console.error('存在无效的申请ID:', invalidApplications);
    ElMessage.error('选中的申请中存在无效的申请ID，无法操作');
    return;
  }

  try {
    await ElMessageBox.confirm(`确定要批量通过${selectedApplications.value.length}个申请吗？`, '确认批量通过', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success'
    });

    // 使用真实API调用
    await batchApproveApplications(selectedApplications.value.map((app) => app.applicationId));

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

  // 验证所有选中的申请都有有效的applicationId
  const invalidApplications = selectedApplications.value.filter((app) => !app.applicationId);
  if (invalidApplications.length > 0) {
    console.error('存在无效的申请ID:', invalidApplications);
    ElMessage.error('选中的申请中存在无效的申请ID，无法操作');
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
      selectedApplications.value.map((app) => app.applicationId),
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
  if (!projectId) {
    ElMessage.error('项目ID无效');
    router.back();
    return;
  }
  console.log('项目申请管理页面初始化，项目ID:', projectId);
  getProjectInfo();
  getProjectRolesInfo(); // 获取项目角色信息
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

    .applicant-meta {
      display: flex;
      flex-direction: column;
      font-size: 0.85rem;
      color: #666;

      .applicant-title {
        margin-bottom: 2px;
      }

      .applicant-extra {
        font-size: 0.75rem;
        color: #999;
      }
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
