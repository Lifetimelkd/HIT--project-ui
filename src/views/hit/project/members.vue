<template>
  <div class="members-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <el-button @click="handleBack" type="info" plain>
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
        </div>
        <div class="header-center">
          <h1 class="page-title">成员管理</h1>
          <p class="page-subtitle" v-if="projectInfo">{{ projectInfo.projectName }}</p>
        </div>
        <div class="header-right">
          <el-button type="primary" @click="handleInviteMember">
            <el-icon><Plus /></el-icon>
            邀请成员
          </el-button>
        </div>
      </div>
    </div>

    <!-- 项目概览 -->
    <div class="project-overview" v-if="projectInfo">
      <el-card>
        <div class="overview-content">
          <div class="project-info">
            <div class="project-cover">
              <img :src="projectInfo.coverImage || '/default-project-cover.jpg'" :alt="projectInfo.projectName" />
            </div>
            <div class="project-details">
              <h3>{{ projectInfo.projectName }}</h3>
              <p>{{ projectInfo.projectDescription }}</p>
              <div class="project-stats">
                <span class="stat-item">
                  <el-icon><UserFilled /></el-icon>
                  {{ projectInfo.currentMembers }}/{{ projectInfo.teamSizeMax }} 成员
                </span>
                <span class="stat-item">
                  <el-icon><Calendar /></el-icon>
                  {{ formatDate(projectInfo.createTime) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 成员列表 -->
    <div class="members-section">
      <el-card>
        <template #header>
          <div class="card-header">
            <span class="card-title">团队成员 ({{ memberList.length }})</span>
            <div class="card-actions">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索成员"
                style="width: 200px"
                clearable
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </div>
          </div>
        </template>

        <el-table v-loading="loading" :data="filteredMembers" style="width: 100%">
          <el-table-column label="成员信息" min-width="200">
            <template #default="{ row }">
              <div class="member-info">
                <el-avatar :size="40" :src="row.avatar">
                  <el-icon><User /></el-icon>
                </el-avatar>
                <div class="member-details">
                  <div class="member-name">{{ row.memberName }}</div>
                  <div class="member-email">{{ row.email }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="roleName" label="角色" width="120">
            <template #default="{ row }">
              <el-tag :type="getRoleColor(row.role)">
                {{ getRoleText(row.role) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="department" label="部门/专业" width="150" />
          <el-table-column prop="skills" label="技能标签" min-width="200">
            <template #default="{ row }">
              <el-tag
                v-for="skill in (row.skills || '').split(',').slice(0, 3)"
                :key="skill"
                size="small"
                style="margin-right: 5px"
              >
                {{ skill }}
              </el-tag>
              <span v-if="(row.skills || '').split(',').length > 3" class="more-skills">
                +{{ (row.skills || '').split(',').length - 3 }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="joinTime" label="加入时间" width="120">
            <template #default="{ row }">
              {{ formatDate(row.joinTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusColor(row.status)" size="small">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button type="primary" size="small" @click="handleViewProfile(row.memberId)">
                  查看
                </el-button>
                <el-dropdown @command="(command) => handleMemberAction(command, row)" v-if="row.role !== 'creator'">
                  <el-button type="info" size="small">
                    更多<el-icon><ArrowDown /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="changeRole">变更角色</el-dropdown-item>
                      <el-dropdown-item command="message">发送消息</el-dropdown-item>
                      <el-dropdown-item command="remove" divided>移除成员</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 邀请成员对话框 -->
    <el-dialog v-model="inviteDialogVisible" title="邀请成员" width="600px">
      <el-form :model="inviteForm" :rules="inviteRules" ref="inviteFormRef" label-width="80px">
        <el-form-item label="邀请方式">
          <el-radio-group v-model="inviteForm.inviteType">
            <el-radio value="email">邮箱邀请</el-radio>
            <el-radio value="search">搜索用户</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="邮箱地址" prop="email" v-if="inviteForm.inviteType === 'email'">
          <el-input v-model="inviteForm.email" placeholder="请输入被邀请人的邮箱地址" />
        </el-form-item>
        
        <el-form-item label="搜索用户" v-if="inviteForm.inviteType === 'search'">
          <el-select
            v-model="inviteForm.userId"
            placeholder="请搜索并选择用户"
            filterable
            remote
            :remote-method="handleSearchUsers"
            :loading="searchLoading"
            style="width: 100%"
          >
            <el-option
              v-for="user in searchUserList"
              :key="user.userId"
              :label="user.userName"
              :value="user.userId"
            >
              <div class="user-option">
                <el-avatar :size="20" :src="user.avatar">{{ user.userName.charAt(0) }}</el-avatar>
                <span style="margin-left: 10px">{{ user.userName }}</span>
                <span style="margin-left: 10px; color: #999; font-size: 12px">{{ user.email }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="角色" prop="role">
          <el-select v-model="inviteForm.role" placeholder="请选择角色">
            <el-option label="核心成员" value="core" />
            <el-option label="普通成员" value="member" />
            <el-option label="观察者" value="observer" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="邀请消息">
          <el-input
            v-model="inviteForm.message"
            type="textarea"
            :rows="3"
            placeholder="请输入邀请消息（可选）"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="inviteDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSendInvite" :loading="inviteLoading">
          发送邀请
        </el-button>
      </template>
    </el-dialog>

    <!-- 角色变更对话框 -->
    <el-dialog v-model="roleDialogVisible" title="变更成员角色" width="400px">
      <el-form :model="roleForm" label-width="80px">
        <el-form-item label="当前角色">
          <el-tag :type="getRoleColor(currentMember?.role)">
            {{ getRoleText(currentMember?.role) }}
          </el-tag>
        </el-form-item>
        <el-form-item label="新角色">
          <el-select v-model="roleForm.newRole" placeholder="请选择新角色">
            <el-option label="核心成员" value="core" />
            <el-option label="普通成员" value="member" />
            <el-option label="观察者" value="observer" />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleChangeRole">确认变更</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';

// 改为导入完整的API接口定义
import { 
  getProject, 
  ProjectInfo,
  getProjectMemberList,
  inviteMemberToProject,
  changeProjectMemberRole,
  removeProjectMember,
  searchUsers,
  MemberInfo,
  InviteMemberForm,
  ChangeRoleForm,
  UserSearchInfo
} from '@/api/hit/project';

// 路由相关
const router = useRouter();
const route = useRoute();
const projectId = computed(() => Number(route.params.id));

// 响应式数据
const loading = ref(false);
const projectInfo = ref<ProjectInfo | null>(null);
const memberList = ref<any[]>([]);
const searchKeyword = ref('');
const inviteDialogVisible = ref(false);
const roleDialogVisible = ref(false);
const inviteLoading = ref(false);
const searchLoading = ref(false);
const searchUserList = ref<any[]>([]);
const currentMember = ref<any>(null);

// 表单数据
const inviteForm = reactive({
  inviteType: 'email',
  email: '',
  userId: null,
  role: 'member',
  message: ''
});

const roleForm = reactive({
  newRole: ''
});

// 表单验证规则
const inviteRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email' as const, message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
};

// 计算属性
const filteredMembers = computed(() => {
  if (!searchKeyword.value) return memberList.value;
  return memberList.value.filter(member =>
    member.memberName.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
    member.email.toLowerCase().includes(searchKeyword.value.toLowerCase())
  );
});

// 获取项目信息
const getProjectInfo = async () => {
  try {
    const response = await getProject(projectId.value);
    // 修复类型问题
    const responseData = response as any;
    projectInfo.value = responseData.data || responseData;
  } catch (error) {
    console.error('获取项目信息失败:', error);
    ElMessage.error('获取项目信息失败');
  }
};

// 获取成员列表
const getMemberList = async () => {
  loading.value = true;
  try {
    // 使用真实API调用替换模拟数据
    const response = await getProjectMemberList(projectId.value, 1, 100); // 添加分页参数，显示100个成员
    memberList.value = response.data || [];
  } catch (error) {
    console.error('获取成员列表失败:', error);
    ElMessage.error('获取成员列表失败');
    memberList.value = [];
  } finally {
    loading.value = false;
  }
};

// 搜索用户
const handleSearchUsers = async (query: string) => {
  if (!query) {
    searchUserList.value = [];
    return;
  }
  
  searchLoading.value = true;
  try {
    // 使用真实API调用替换模拟搜索
    const response = await searchUsers(query);
    searchUserList.value = response.data || [];
  } catch (error) {
    console.error('搜索用户失败:', error);
    ElMessage.error('搜索用户失败');
    searchUserList.value = [];
  } finally {
    searchLoading.value = false;
  }
};

// 事件处理
const handleBack = () => {
  router.go(-1);
};

// 邀请成员
const handleInviteMember = async () => {
  if (!inviteForm.userId || !inviteForm.role) {
    ElMessage.error('请选择用户和角色');
    return;
  }

  try {
    // 使用真实API调用
    await inviteMemberToProject({
      projectId: projectId.value,
      userId: inviteForm.userId,
      memberRole: inviteForm.role
    });
    
    ElMessage.success('邀请成功');
    inviteDialogVisible.value = false;
    resetInviteForm();
    await getMemberList(); // 刷新成员列表
  } catch (error) {
    console.error('邀请成员失败:', error);
    ElMessage.error('邀请成员失败');
  }
};

// 重置邀请表单
const resetInviteForm = () => {
  inviteForm.inviteType = 'email';
  inviteForm.email = '';
  inviteForm.userId = null;
  inviteForm.role = 'member';
  inviteForm.message = '';
};

const handleSendInvite = async () => {
  inviteLoading.value = true;
  try {
    // TODO: 等待后端实现邀请成员API后启用
    // const inviteData = {
    //   projectId: projectId.value,
    //   ...inviteForm
    // };
    // await inviteMemberToProject(inviteData);
    
    // 临时模拟发送邀请，实际应该调用后端API
    // 建议后端实现以下接口：
    // POST /hit/project/{projectId}/invite - 邀请成员加入项目
    await new Promise(resolve => setTimeout(resolve, 1000));
    ElMessage.success('邀请已发送');
    inviteDialogVisible.value = false;
    // 重置表单
    Object.assign(inviteForm, {
      inviteType: 'email',
      email: '',
      userId: null,
      role: 'member',
      message: ''
    });
  } catch (error) {
    console.error('发送邀请失败:', error);
    ElMessage.error('发送邀请失败');
  } finally {
    inviteLoading.value = false;
  }
};

const handleViewProfile = (memberId: number) => {
  // TODO: 等待后端实现用户资料页面后启用
  // router.push(`/hit/userProfile/${memberId}`);
  ElMessage.info('查看用户资料功能开发中...');
};

const handleMemberAction = (command: string, member: any) => {
  currentMember.value = member;
  
  switch (command) {
    case 'changeRole':
      roleForm.newRole = member.role;
      roleDialogVisible.value = true;
      break;
    case 'message':
      // TODO: 等待后端实现消息功能后启用
      ElMessage.info('发送消息功能开发中...');
      break;
    case 'remove':
      handleRemoveMember(member);
      break;
  }
};

// 变更成员角色
const handleChangeRole = async () => {
  if (!roleForm.newRole) {
    ElMessage.error('请选择新角色');
    return;
  }

  try {
    // 使用真实API调用
    await changeProjectMemberRole(currentMember.value.memberId, {
      memberRole: roleForm.newRole
    });
    
    ElMessage.success('角色变更成功');
    roleDialogVisible.value = false;
    await getMemberList(); // 刷新成员列表
  } catch (error) {
    console.error('角色变更失败:', error);
    ElMessage.error('角色变更失败');
  }
};

// 移除成员
const handleRemoveMember = async (member: any) => {
  try {
    await ElMessageBox.confirm(`确定要移除成员"${member.memberName}"吗？`, '确认移除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    // 使用真实API调用
    await removeProjectMember(member.memberId);
    
    ElMessage.success('成员移除成功');
    await getMemberList(); // 刷新成员列表
  } catch (error) {
    if (error !== 'cancel') {
      console.error('成员移除失败:', error);
      ElMessage.error('成员移除失败');
    }
  }
};

// 工具函数
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('zh-CN');
};

const getRoleText = (role: string) => {
  const roles: Record<string, string> = {
    creator: '项目创建者',
    core: '核心成员',
    member: '普通成员',
    observer: '观察者'
  };
  return roles[role] || role;
};

const getRoleColor = (role: string): 'success' | 'info' | 'warning' | 'danger' => {
  const colors: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
    creator: 'danger',
    core: 'success',
    member: 'info',
    observer: 'warning'
  };
  return colors[role] || 'info';
};

const getStatusText = (status: string) => {
  const statuses: Record<string, string> = {
    active: '活跃',
    inactive: '不活跃',
    pending: '待确认'
  };
  return statuses[status] || status;
};

const getStatusColor = (status: string): 'success' | 'info' | 'warning' | 'danger' => {
  const colors: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
    active: 'success',
    inactive: 'warning',
    pending: 'info'
  };
  return colors[status] || 'info';
};

// 生命周期
onMounted(() => {
  getProjectInfo();
  getMemberList();
});
</script>

<style scoped lang="scss">
.members-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-bottom: 40px;
}

.page-header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 20px 0;
  color: white;
  margin-bottom: 30px;

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header-center {
    text-align: center;
    flex: 1;
  }

  .page-title {
    font-size: 2rem;
    font-weight: bold;
    margin: 0 0 5px 0;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .page-subtitle {
    font-size: 1rem;
    margin: 0;
    opacity: 0.9;
  }
}

.project-overview,
.members-section {
  max-width: 1200px;
  margin: 0 auto 30px auto;
  padding: 0 20px;

  .el-card {
    border-radius: 15px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  }
}

.overview-content {
  .project-info {
    display: flex;
    align-items: center;
    gap: 20px;

    .project-cover {
      img {
        width: 120px;
        height: 80px;
        object-fit: cover;
        border-radius: 10px;
      }
    }

    .project-details {
      flex: 1;

      h3 {
        margin: 0 0 10px 0;
        font-size: 1.5rem;
        color: #333;
      }

      p {
        margin: 0 0 15px 0;
        color: #666;
        line-height: 1.5;
      }

      .project-stats {
        display: flex;
        gap: 20px;

        .stat-item {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #666;
          font-size: 0.9rem;

          .el-icon {
            font-size: 16px;
          }
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

.member-info {
  display: flex;
  align-items: center;
  gap: 12px;

  .member-details {
    .member-name {
      font-weight: bold;
      color: #333;
      margin-bottom: 4px;
    }

    .member-email {
      font-size: 0.9rem;
      color: #666;
    }
  }
}

.more-skills {
  color: #999;
  font-size: 0.8rem;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.user-option {
  display: flex;
  align-items: center;
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