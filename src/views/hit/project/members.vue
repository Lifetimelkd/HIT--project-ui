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
              <el-input v-model="searchKeyword" placeholder="搜索成员" style="width: 200px" clearable>
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
              <el-tag v-for="skill in (row.skills || '').split(',').slice(0, 3)" :key="skill" size="small" style="margin-right: 5px">
                {{ skill }}
              </el-tag>
              <span v-if="(row.skills || '').split(',').length > 3" class="more-skills"> +{{ (row.skills || '').split(',').length - 3 }} </span>
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
                <el-button type="primary" size="small" @click="handleViewProfile(row.memberId)"> 查看 </el-button>
                <el-dropdown
                  @command="(command) => handleMemberAction(command, row)"
                  v-if="row.role !== 'creator' && row.role !== '项目负责人' && row.isLeader !== '1'"
                >
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
          <el-input
            v-model="selectedUserDisplay"
            placeholder="点击选择用户"
            readonly
            @click="handleOpenUserSelector"
            style="width: 100%; cursor: pointer"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
            <template #suffix>
              <el-icon><ArrowDown /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="角色" prop="role">
          <el-select v-model="inviteForm.role" placeholder="请选择角色" :loading="rolesLoading">
            <el-option v-for="role in availableRoles" :key="role.roleId" :label="role.roleName" :value="role.roleName">
              <div style="display: flex; justify-content: space-between; align-items: center">
                <span>{{ role.roleName }}</span>
                <span style="font-size: 12px; color: #999"> {{ role.currentCount }}/{{ role.requiredCount }} </span>
              </div>
            </el-option>
            <!-- 保留一些通用角色作为备选 -->
            <el-option v-if="availableRoles.length === 0" label="普通成员" value="普通成员" />
          </el-select>
        </el-form-item>

        <el-form-item label="邀请消息">
          <el-input v-model="inviteForm.message" type="textarea" :rows="3" placeholder="请输入邀请消息（可选）" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="inviteDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSendInvite" :loading="inviteLoading"> 发送邀请 </el-button>
      </template>
    </el-dialog>

    <!-- 用户选择对话框 -->
    <el-dialog v-model="userSelectorVisible" title="选择用户" width="800px">
      <div class="user-selector-header">
        <el-input v-model="userSearchKeyword" placeholder="输入用户名、昵称或邮箱搜索" style="width: 300px" clearable @input="handleUserSearch">
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <el-table
        ref="userTableRef"
        v-loading="userTableLoading"
        :data="filteredUserList"
        style="width: 100%; margin-top: 20px"
        max-height="400px"
        @row-click="handleUserRowClick"
        highlight-current-row
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="用户信息" min-width="200">
          <template #default="{ row }">
            <div class="user-info-cell">
              <el-avatar :size="40" :src="row.avatar">
                {{ row.nickName ? row.nickName.charAt(0) : row.userName.charAt(0) }}
              </el-avatar>
              <div class="user-details">
                <div class="user-name">{{ row.nickName || row.userName }}</div>
                <div class="user-username">@{{ row.userName }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column prop="phonenumber" label="手机号" width="130" />
        <el-table-column prop="deptName" label="部门" width="120" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === '0' ? 'success' : 'danger'" size="small">
              {{ row.status === '0' ? '正常' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <template #footer>
        <el-button @click="userSelectorVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmSelectUser" :disabled="!selectedUser"> 确认选择 </el-button>
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
          <el-select v-model="roleForm.newRole" placeholder="请选择新角色" :loading="rolesLoading">
            <el-option
              v-for="role in projectRoles"
              :key="role.roleId"
              :label="role.roleName"
              :value="role.roleName"
              :disabled="role.isLeader === '1'"
            >
              <div style="display: flex; justify-content: space-between; align-items: center">
                <span>{{ role.roleName }}</span>
                <span style="font-size: 12px; color: #999">
                  {{ role.currentCount }}/{{ role.requiredCount }}
                  {{ role.isLeader === '1' ? ' (领导角色)' : '' }}
                </span>
              </div>
            </el-option>
            <!-- 保留一些通用角色作为备选 -->
            <el-option v-if="projectRoles.length === 0" label="普通成员" value="普通成员" />
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
  UserSearchInfo,
  // 新增项目角色相关接口
  getProjectRoles,
  getAvailableProjectRoles,
  ProjectRoleInfo,
  updateProjectRoleCount
} from '@/api/hit/project';

// 添加系统用户相关接口导入
import { listUser } from '@/api/system/user';
import type { UserVO, UserQuery } from '@/api/system/user/types';

// 路由相关
const router = useRouter();
const route = useRoute();
const projectId = computed(() => route.params.id as string); // 使用string类型而不是Number

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

// 用户选择相关数据
const userSelectorVisible = ref(false);
const userTableLoading = ref(false);
const userSearchKeyword = ref('');
const userList = ref<UserVO[]>([]);
const selectedUser = ref<UserVO | null>(null);
const selectedUserDisplay = ref('');

// 项目角色相关数据
const projectRoles = ref<ProjectRoleInfo[]>([]);
const availableRoles = ref<ProjectRoleInfo[]>([]);
const rolesLoading = ref(false);

// 表单数据
const inviteForm = reactive({
  inviteType: 'email',
  email: '',
  userId: null,
  role: '普通成员', // 使用默认角色名称而不是英文代码
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
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
};

// 计算属性
const filteredMembers = computed(() => {
  if (!searchKeyword.value) return memberList.value;
  return memberList.value.filter(
    (member) =>
      member.memberName?.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      member.userName?.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchKeyword.value.toLowerCase())
  );
});

// 用户选择表格过滤
const filteredUserList = computed(() => {
  if (!userSearchKeyword.value) return userList.value;
  return userList.value.filter(
    (user) =>
      user.userName?.toLowerCase().includes(userSearchKeyword.value.toLowerCase()) ||
      user.nickName?.toLowerCase().includes(userSearchKeyword.value.toLowerCase()) ||
      user.email?.toLowerCase().includes(userSearchKeyword.value.toLowerCase())
  );
});

// 获取项目信息
const getProjectInfo = async () => {
  try {
    const response = await getProject(projectId.value);
    // 修复类型问题，处理不同的响应结构
    const responseData = response as any;
    const projectData = responseData.data || responseData;

    // 如果项目数据存在，设置一些默认值
    if (projectData) {
      projectInfo.value = {
        ...projectData,
        currentMembers: memberList.value.length, // 使用成员列表长度
        coverImage: projectData.coverImage || '/default-project-cover.jpg'
      };
    }
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

    // 处理后端返回的数据结构
    const responseData = response as any;
    console.log('原始API响应:', responseData); // 调试日志

    const rawMembers = responseData.rows || responseData.data || responseData || [];
    console.log('提取的原始成员数据:', rawMembers); // 调试日志

    // 映射后端字段到前端期望的字段
    memberList.value = rawMembers.map((member: any) => ({
      memberId: member.memberId,
      memberName: member.userName || member.realName || '未知用户', // 添加memberName字段
      userName: member.userName,
      email: member.contactInfo || '未提供邮箱', // 使用contactInfo作为email
      avatar: member.avatarUrl,
      role: member.memberRole, // 将memberRole映射到role
      memberRole: member.memberRole,
      department: member.college || member.major || '未设置', // 合并college和major作为department
      skills: member.major || '', // 使用major作为技能标签
      joinTime: member.joinTime,
      status: member.memberStatus, // 将memberStatus映射到status
      isLeader: member.isLeader,
      contributionScore: member.contributionScore,
      completedTasks: member.completedTasks,
      totalTasks: member.totalTasks,
      // 保留原始数据以备后用
      ...member
    }));

    console.log('处理后的成员列表:', memberList.value); // 调试日志
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

// 获取项目角色列表
const getProjectRolesList = async () => {
  rolesLoading.value = true;
  try {
    const response = await getProjectRoles(projectId.value);
    console.log('项目角色列表:', response); // 调试日志

    // 处理后端返回的数据结构
    const responseData = response as any;
    projectRoles.value = responseData.data || responseData || [];

    console.log('处理后的项目角色列表:', projectRoles.value); // 调试日志
  } catch (error) {
    console.error('获取项目角色列表失败:', error);
    ElMessage.error('获取项目角色列表失败');
    projectRoles.value = [];
  } finally {
    rolesLoading.value = false;
  }
};

// 获取可申请的项目角色列表
const getAvailableRolesList = async () => {
  try {
    const response = await getAvailableProjectRoles(projectId.value);
    console.log('可申请角色列表:', response); // 调试日志

    // 处理后端返回的数据结构
    const responseData = response as any;
    availableRoles.value = responseData.data || responseData || [];

    console.log('处理后的可申请角色列表:', availableRoles.value); // 调试日志
  } catch (error) {
    console.error('获取可申请角色列表失败:', error);
    availableRoles.value = [];
  }
};

// 事件处理
const handleBack = () => {
  router.go(-1);
};

// 用户选择相关方法
const handleOpenUserSelector = async () => {
  userSelectorVisible.value = true;
  await loadUserList();
};

const loadUserList = async () => {
  userTableLoading.value = true;
  try {
    const query: UserQuery = {
      status: '0', // 只查询正常状态的用户
      pageNum: 1,
      pageSize: 100
    };
    const response = await listUser(query);
    const responseData = response as any;
    userList.value = responseData.rows || responseData.data || responseData || [];
  } catch (error) {
    console.error('获取用户列表失败:', error);
    ElMessage.error('获取用户列表失败');
    userList.value = [];
  } finally {
    userTableLoading.value = false;
  }
};

const handleUserSearch = (value: string) => {
  // 实时搜索已由计算属性 filteredUserList 处理
};

const handleUserRowClick = (row: UserVO) => {
  selectedUser.value = row;
};

const handleConfirmSelectUser = () => {
  if (selectedUser.value) {
    inviteForm.userId = selectedUser.value.userId;
    // 修复显示格式，去掉多余的括号
    const displayName = selectedUser.value.nickName || selectedUser.value.userName;
    const email = selectedUser.value.email || '未提供邮箱';
    selectedUserDisplay.value = `${displayName} (${email})`;
    userSelectorVisible.value = false;
    // 重置选择状态
    selectedUser.value = null;
    userSearchKeyword.value = '';
  }
};

// 邀请成员 - 打开对话框
const handleInviteMember = async () => {
  // 刷新可用角色列表
  await getAvailableRolesList();
  inviteDialogVisible.value = true;
};

// 发送邀请
const handleSendInvite = async () => {
  // 验证表单
  if (inviteForm.inviteType === 'email' && !inviteForm.email) {
    ElMessage.error('请输入邮箱地址');
    return;
  }
  if (inviteForm.inviteType === 'search' && !inviteForm.userId) {
    ElMessage.error('请选择用户');
    return;
  }
  if (!inviteForm.role) {
    ElMessage.error('请选择角色');
    return;
  }

  inviteLoading.value = true;
  try {
    if (inviteForm.inviteType === 'search' && inviteForm.userId) {
      // 直接邀请已存在的用户
      await inviteMemberToProject({
        projectId: projectId.value,
        userId: inviteForm.userId,
        memberRole: inviteForm.role
      });

      ElMessage.success('邀请成功');
      inviteDialogVisible.value = false;
      resetInviteForm();

      // 刷新相关数据
      await getMemberList(); // 刷新成员列表
      await updateProjectRoleCount(projectId.value); // 更新角色统计
      await getProjectRolesList(); // 刷新项目角色列表
      await getAvailableRolesList(); // 刷新可申请角色列表
    } else {
      // TODO: 邮箱邀请功能需要后端支持
      ElMessage.info('邮箱邀请功能开发中...');
    }
  } catch (error) {
    console.error('发送邀请失败:', error);
    ElMessage.error('发送邀请失败');
  } finally {
    inviteLoading.value = false;
  }
};

// 重置邀请表单
const resetInviteForm = () => {
  inviteForm.inviteType = 'email';
  inviteForm.email = '';
  inviteForm.userId = null;
  // 使用第一个可用角色或默认值
  inviteForm.role = availableRoles.value.length > 0 ? availableRoles.value[0].roleName : '普通成员';
  inviteForm.message = '';
  // 重置用户选择相关字段
  selectedUserDisplay.value = '';
  selectedUser.value = null;
  userSearchKeyword.value = '';
};

const handleViewProfile = (memberId: number) => {
  // TODO: 等待后端实现用户资料页面后启用
  // router.push(`/hit/userProfile/${memberId}`);
  ElMessage.info('查看用户资料功能开发中...');
};

const handleMemberAction = async (command: string, member: any) => {
  currentMember.value = member;

  switch (command) {
    case 'changeRole':
      // 刷新项目角色列表
      await getProjectRolesList();
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

    // 刷新相关数据
    await getMemberList(); // 刷新成员列表
    await updateProjectRoleCount(projectId.value); // 更新角色统计
    await getProjectRolesList(); // 刷新项目角色列表
    await getAvailableRolesList(); // 刷新可申请角色列表
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

    // 刷新相关数据
    await getMemberList(); // 刷新成员列表
    await updateProjectRoleCount(projectId.value); // 更新角色统计
    await getProjectRolesList(); // 刷新项目角色列表
    await getAvailableRolesList(); // 刷新可申请角色列表
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
    '项目负责人': '项目负责人',
    '算法工程师': '算法工程师',
    '前端开发工程师': '前端开发工程师',
    '后端开发工程师': '后端开发工程师',
    'core': '核心成员',
    'member': '普通成员',
    'observer': '观察者'
  };
  return roles[role] || role;
};

const getRoleColor = (role: string): 'success' | 'info' | 'warning' | 'danger' => {
  const colors: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
    creator: 'danger',
    '项目负责人': 'danger',
    '算法工程师': 'success',
    '前端开发工程师': 'success',
    '后端开发工程师': 'success',
    'core': 'success',
    'member': 'info',
    'observer': 'warning'
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
onMounted(async () => {
  await getMemberList(); // 先加载成员列表
  await getProjectInfo(); // 然后加载项目信息，这样可以正确显示成员数量
  await getProjectRolesList(); // 加载项目角色列表
  await getAvailableRolesList(); // 加载可申请角色列表
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

.user-selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.user-info-cell {
  display: flex;
  align-items: center;
  gap: 12px;

  .user-details {
    .user-name {
      font-weight: bold;
      color: #333;
      margin-bottom: 4px;
    }

    .user-username {
      font-size: 0.9rem;
      color: #666;
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
