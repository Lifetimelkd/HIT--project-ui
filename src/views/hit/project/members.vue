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
          <el-button v-if="showManagementFeatures && isProjectLeader" type="primary" @click="handleInviteMember">
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
              <el-tag :type="getRoleColor(row.roleName || row.role)">
                {{ row.roleName || row.role || '未分配角色' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="department" label="部门/专业" width="150" />
          <el-table-column prop="skills" label="技能标签" min-width="200">
            <template #default="{ row }">
              <div v-if="row.skills && row.skills.length > 0">
                <el-tag v-for="skill in row.skills.slice(0, 3)" :key="skill.userSkillId" size="small" style="margin-right: 5px">
                  {{ skill.tagName }}
                </el-tag>
                <span v-if="row.skills.length > 3" class="more-skills"> +{{ row.skills.length - 3 }} </span>
              </div>
              <span v-else class="no-skills">暂无技能标签</span>
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
          <el-table-column label="操作" width="250" fixed="right">
            <template #default="{ row }">
              <div class="action-buttons" v-if="showActionButtons">
                <!-- 查看按钮 - 所有项目成员都可以看到 -->
                <el-button type="primary" size="small" @click="handleViewProfile(row.memberId)"> 查看 </el-button>

                <!-- 编辑技能按钮 - 根据权限控制 -->
                <el-button v-if="canEditMember(row)" type="success" size="small" @click="handleEditMemberSkills(row)"> 编辑技能 </el-button>

                <!-- 更多操作下拉菜单 - 只有项目负责人且不是创建者/负责人角色的成员可以操作 -->
                <el-dropdown
                  @command="(command) => handleMemberAction(command, row)"
                  v-if="isProjectLeader && row.role !== 'creator' && row.role !== '项目负责人' && row.isLeader !== '1'"
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

    <!-- 技能编辑对话框 -->
    <el-dialog
      v-model="skillDialogVisible"
      :title="`编辑 ${currentEditingMember?.memberName || '成员'} 的技能`"
      width="800px"
      @close="handleSkillDialogClose"
    >
      <div class="skill-edit-content">
        <!-- 当前技能列表 -->
        <div class="current-skills-section">
          <h4>当前技能</h4>
          <div class="skills-list" v-loading="skillLoading">
            <div v-if="currentEditingMember?.skills?.length > 0" class="skill-items">
              <div v-for="skill in currentEditingMember.skills" :key="skill.userSkillId" class="skill-item">
                <div class="skill-info">
                  <div class="skill-header">
                    <span class="skill-name">{{ skill.tagName }}</span>
                    <div class="skill-actions">
                      <el-button type="text" size="small" @click="handleEditSkill(skill)">
                        <el-icon><Edit /></el-icon>
                      </el-button>
                      <el-button type="text" size="small" @click="handleDeleteSkill(skill)" class="delete-btn">
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </div>
                  </div>
                  <div class="skill-level">
                    <el-rate v-model="skill.skillLevel" :max="5" show-score score-template="等级 {value}" @change="handleSkillLevelChange(skill)" />
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="no-skills-message">
              <el-empty description="暂无技能标签" />
            </div>
          </div>
        </div>

        <!-- 添加新技能 -->
        <div class="add-skill-section">
          <h4>添加新技能</h4>
          <el-form ref="skillFormRef" :model="skillForm" label-width="80px">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="技能标签" prop="tagId">
                  <el-select v-model="skillForm.tagId" placeholder="请选择技能标签" style="width: 100%" filterable>
                    <el-option
                      v-for="tag in availableSkillTags"
                      :key="tag.tagId"
                      :label="tag.tagName"
                      :value="tag.tagId"
                    >
                      <span style="float: left">{{ tag.tagName }}</span>
                      <span style="float: right; color: #8492a6; font-size: 13px">{{ getSkillCategory(tag.tagCategory) }}</span>
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="技能等级" prop="skillLevel">
                  <el-rate v-model="skillForm.skillLevel" :max="5" show-text :texts="['了解', '熟悉', '熟练', '精通', '专家']" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="学习时长" prop="learningTime">
                  <el-input-number v-model="skillForm.learningTime" :min="0" :step="10" placeholder="小时" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="相关项目" prop="projectCount">
                  <el-input-number v-model="skillForm.projectCount" :min="0" placeholder="项目数量" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="技能描述" prop="description">
              <el-input v-model="skillForm.description" type="textarea" :rows="2" placeholder="描述技能经验..." maxlength="200" show-word-limit />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleAddSkill" :loading="skillLoading">
                <el-icon><Plus /></el-icon>
                添加技能
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>

      <template #footer>
        <el-button @click="skillDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, ArrowDown, ArrowLeft, UserFilled, Calendar, Search, User, Edit, Delete } from '@element-plus/icons-vue';

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

// 新增：导入用户技能相关接口
import { getUserSkillsWithTag, addUserSkill, updateUserSkill, delUserSkill, UserSkillForm } from '@/api/hit/userSkill';
import { getSkillTagList } from '@/api/hit/skillTag';

// 新增：导入用户store
import { useUserStore } from '@/store/modules/user';

// 路由相关
const router = useRouter();
const route = useRoute();
const projectId = computed(() => route.params.id as string); // 使用string类型而不是Number

// 新增：用户store
const userStore = useUserStore();

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

// 新增：技能相关数据
const skillDialogVisible = ref(false);
const skillFormRef = ref();
const skillTags = ref<any[]>([]);
const currentEditingMember = ref<any>(null);
const skillLoading = ref(false);

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

// 新增：技能表单数据
const skillForm = reactive<UserSkillForm>({
  userSkillId: undefined,
  userId: undefined,
  tagId: undefined,
  skillLevel: 3,
  learningTime: 0,
  projectCount: 0,
  description: ''
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

// 新增：权限控制计算属性
const currentUserId = computed(() => userStore.userId);

// 判断当前用户是否为项目负责人
const isProjectLeader = computed(() => {
  if (!currentUserId.value || !memberList.value.length) return false;

  const currentUserMember = memberList.value.find((member) => member.userId === currentUserId.value || member.memberId === currentUserId.value);

  return (
    currentUserMember &&
    (currentUserMember.role === '项目负责人' ||
      currentUserMember.memberRole === '项目负责人' ||
      currentUserMember.isLeader === '1' ||
      projectInfo.value?.creatorId === currentUserId.value)
  );
});

// 判断当前用户是否为项目成员
const isProjectMember = computed(() => {
  if (!currentUserId.value || !memberList.value.length) return false;

  return memberList.value.some((member) => member.userId === currentUserId.value || member.memberId === currentUserId.value);
});

// 判断是否可以编辑某个成员的信息
const canEditMember = computed(() => (member: any) => {
  if (isProjectLeader.value) return true; // 项目负责人可以编辑所有成员
  if (!isProjectMember.value) return false; // 非项目成员不能编辑任何人

  // 普通成员只能编辑自己
  return member.userId === currentUserId.value || member.memberId === currentUserId.value;
});

// 判断是否显示管理功能（邀请成员等）
const showManagementFeatures = computed(() => {
  return isProjectMember.value; // 只有项目成员才能看到管理功能
});

// 判断是否显示操作按钮
const showActionButtons = computed(() => {
  return isProjectMember.value; // 只有项目成员才能看到操作按钮
});

// 新增：过滤可用的技能标签（排除当前成员已有的技能）
const availableSkillTags = computed(() => {
  if (!currentEditingMember.value || !currentEditingMember.value.skills) {
    return skillTags.value;
  }

  // 获取当前成员已有的技能标签ID
  const existingTagIds = currentEditingMember.value.skills.map((skill: any) => skill.tagId);

  // 过滤掉已有的技能标签
  return skillTags.value.filter((tag: any) => !existingTagIds.includes(tag.tagId));
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
    const mappedMembers = rawMembers.map((member: any) => ({
      memberId: member.memberId,
      userId: member.userId, // 确保有userId字段
      memberName: member.userName || member.realName || '未知用户', // 添加memberName字段
      userName: member.userName,
      email: member.contactInfo || '未提供邮箱', // 使用contactInfo作为email
      avatar: member.avatarUrl,
      role: member.roleName || member.memberRole, // 优先使用roleName，如果没有则使用memberRole作为兜底
      memberRole: member.memberRole,
      roleName: member.roleName, // 保留roleName字段
      department: member.college || member.major || '未设置', // 合并college和major作为department
      skills: [], // 初始化技能数组，稍后异步加载
      skillsText: '', // 用于显示的技能文本
      joinTime: member.joinTime,
      status: member.memberStatus, // 将memberStatus映射到status
      isLeader: member.isLeader,
      contributionScore: member.contributionScore,
      completedTasks: member.completedTasks,
      totalTasks: member.totalTasks,
      // 保留原始数据以备后用
      ...member
    }));

    memberList.value = mappedMembers;

    // 异步加载每个成员的技能数据
    await loadMembersSkills();

    console.log('处理后的成员列表:', memberList.value); // 调试日志
  } catch (error) {
    console.error('获取成员列表失败:', error);
    ElMessage.error('获取成员列表失败');
    memberList.value = [];
  } finally {
    loading.value = false;
  }
};

// 新增：为所有成员加载技能数据
const loadMembersSkills = async () => {
  const skillPromises = memberList.value.map(async (member) => {
    try {
      // 使用userId或memberId获取技能数据
      const userId = member.userId || member.memberId;
      if (!userId) return;

      const skillResponse = await getUserSkillsWithTag(userId);
      const skillData = skillResponse.data || [];

      // 更新成员的技能信息
      member.skills = skillData;

      // 生成技能显示文本（最多显示3个）
      const skillNames = skillData.map((skill: any) => skill.tagName).filter(Boolean);
      member.skillsText = skillNames.slice(0, 3).join(',');
      member.skillsCount = skillNames.length;
    } catch (error) {
      console.error(`获取用户${member.memberId}技能失败:`, error);
      member.skills = [];
      member.skillsText = '';
      member.skillsCount = 0;
    }
  });

  // 等待所有技能数据加载完成
  await Promise.all(skillPromises);
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
  // 找到对应的成员信息以获取userId
  const member = memberList.value.find(m => m.memberId === memberId);
  const userId = member?.userId || member?.memberId;
  
  if (userId) {
    router.push(`/profile/profileShowcase/${userId}`);
  } else {
    ElMessage.error('无法找到用户信息');
  }
};

const handleEditMemberSkills = async (member: any) => {
  currentEditingMember.value = member;

  // 确保技能标签数据已加载
  if (skillTags.value.length === 0) {
    await loadSkillTags();
  }

  skillDialogVisible.value = true;
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

// 技能编辑对话框相关方法
const handleSkillDialogClose = () => {
  resetSkillForm();
};

const resetSkillForm = () => {
  Object.assign(skillForm, {
    userSkillId: undefined,
    userId: undefined,
    tagId: undefined,
    skillLevel: 3,
    learningTime: 0,
    projectCount: 0,
    description: ''
  });
  skillFormRef.value?.resetFields();
};

const handleEditSkill = (skill: any) => {
  skillForm.userSkillId = skill.userSkillId;
  skillForm.tagId = skill.tagId;
  skillForm.skillLevel = skill.skillLevel;
  skillForm.learningTime = skill.learningTime;
  skillForm.projectCount = skill.projectCount;
  skillForm.description = skill.description;
  skillDialogVisible.value = true;
};

const handleDeleteSkill = async (skill: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除技能"${skill.tagName}"吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    await delUserSkill([skill.userSkillId]);
    ElMessage.success('技能删除成功');

    // 刷新当前成员的技能列表
    await loadMembersSkills();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('技能删除失败:', error);
      ElMessage.error('技能删除失败');
    }
  }
};

const handleSkillLevelChange = (skill: any) => {
  // 技能等级更新
  updateSkillLevel(skill);
};

const updateSkillLevel = async (skill: any) => {
  try {
    await updateUserSkill(skill);
    ElMessage.success(`技能等级已更新为 ${skill.skillLevel} 级`);
    // 刷新成员技能列表
    await loadMembersSkills();
  } catch (error) {
    console.error('更新技能等级失败:', error);
    ElMessage.error('更新技能等级失败');
  }
};

const handleAddSkill = async () => {
  if (!skillForm.tagId) {
    ElMessage.error('请选择技能标签');
    return;
  }
  if (!skillForm.skillLevel) {
    ElMessage.error('请选择技能等级');
    return;
  }

  // 检查是否重复添加技能
  if (currentEditingMember.value?.skills) {
    const existingSkill = currentEditingMember.value.skills.find((skill: any) => skill.tagId === skillForm.tagId);
    if (existingSkill) {
      ElMessage.warning('该技能已存在，请选择其他技能标签');
      return;
    }
  }

  skillLoading.value = true;
  try {
    const response = await addUserSkill({
      userId: currentEditingMember.value.userId,
      tagId: skillForm.tagId,
      skillLevel: skillForm.skillLevel,
      learningTime: skillForm.learningTime,
      projectCount: skillForm.projectCount,
      description: skillForm.description
    });

    ElMessage.success('技能添加成功');
    resetSkillForm();

    // 刷新当前成员的技能列表
    await loadMembersSkills();
  } catch (error) {
    console.error('技能添加失败:', error);
    ElMessage.error('技能添加失败');
  } finally {
    skillLoading.value = false;
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
  if (!role) return 'info';

  const colors: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
    // 通用角色
    creator: 'danger',
    '项目负责人': 'danger',
    '项目创建者': 'danger',

    // 开发角色
    '算法工程师': 'success',
    '前端开发工程师': 'success',
    '后端开发工程师': 'success',
    '前端工程师': 'success',
    '区块链开发工程师': 'success',
    '智能合约开发工程师': 'success',
    '控制系统工程师': 'success',
    '机械设计工程师': 'success',
    '嵌入式工程师': 'success',
    '软件工程师': 'success',
    '物联网开发工程师': 'success',
    '数据工程师': 'success',
    '移动端工程师': 'success',

    // 通用等级角色
    'core': 'success',
    '核心成员': 'warning',
    'member': 'info',
    '普通成员': 'info',
    'observer': 'warning',
    '观察者': 'warning'
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

// 新增：获取技能分类显示名称（参考userSkill/index.vue）
const getSkillCategory = (category: string) => {
  const skillCategories = [
    { label: '全部', value: 'all' },
    { label: '编程语言', value: 'programming' },
    { label: '前端技术', value: 'frontend' },
    { label: '后端技术', value: 'backend' },
    { label: '人工智能', value: 'ai' },
    { label: '数据库', value: 'database' },
    { label: '软技能', value: 'soft_skill' },
    { label: '设计', value: 'design' }
  ];

  const categoryObj = skillCategories.find((c) => c.value === category);
  return categoryObj ? categoryObj.label : category;
};

// 生命周期
onMounted(async () => {
  // 确保用户信息已加载
  if (!userStore.userId) {
    try {
      await userStore.getInfo();
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  }

  await getMemberList(); // 先加载成员列表
  await getProjectInfo(); // 然后加载项目信息，这样可以正确显示成员数量
  await getProjectRolesList(); // 加载项目角色列表
  await getAvailableRolesList(); // 加载可申请角色列表
  await loadSkillTags(); // 加载技能标签列表
});

// 新增：加载技能标签
const loadSkillTags = async () => {
  try {
    const response = await getSkillTagList();
    console.log('技能标签API响应:', response); // 调试日志

    // 参考userSkill/index.vue的数据处理方式
    if (response && response.code === 200) {
      skillTags.value = response.rows || [];
    } else {
      console.error('获取技能标签数据失败:', response?.msg || '未知错误');
      skillTags.value = [];
    }

    console.log('处理后的技能标签数据:', skillTags.value); // 调试日志
  } catch (error) {
    console.error('获取技能标签失败:', error);
    skillTags.value = [];
  }
};
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

.no-skills {
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

.skill-edit-content {
  .current-skills-section {
    margin-bottom: 30px;
  }

  .skills-list {
    .skill-items {
      .skill-item {
        background-color: #f5f7fa;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;

        .skill-info {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;

          .skill-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex: 1;

            .skill-name {
              font-weight: bold;
              color: #333;
              font-size: 1rem;
            }

            .skill-actions {
              display: flex;
              gap: 5px;

              .delete-btn {
                color: #f56c6c;

                &:hover {
                  color: #f56c6c;
                }
              }
            }
          }

          .skill-level {
            .el-rate {
              font-size: 0.9rem;
              color: #f56c6c;
            }
          }
        }
      }
    }

    .no-skills-message {
      padding: 20px;
      text-align: center;
      color: #909399;
    }
  }

  .add-skill-section {
    .el-form {
      .el-row {
        margin-bottom: 15px;
      }

      .el-form-item {
        margin-bottom: 15px;
      }

      .el-input-number {
        width: 100%;
      }

      .el-textarea {
        width: 100%;
      }
    }
  }
}
</style>
