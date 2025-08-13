import request from '@/utils/request';
import { AxiosPromise } from 'axios';

// 项目信息接口
export interface ProjectInfo {
  projectId?: number;
  projectName?: string;
  projectDescription?: string;
  projectBackground?: string;
  projectGoals?: string;
  expectedOutcome?: string;
  coverImage?: string;
  projectType?: string;
  projectCategory?: string;
  difficultyLevel?: number;
  durationType?: string;
  startDate?: string;
  endDate?: string;
  teamSizeMin?: number;
  teamSizeMax?: number;
  currentMembers?: number;
  status?: string;
  recruitmentStatus?: string;
  visibility?: string;
  approvalMode?: string;
  viewCount?: number;
  likeCount?: number;
  collectCount?: number;
  applyCount?: number;
  isFeatured?: string;
  isUrgent?: string;
  isCredit?: string;
  creatorId?: number;
  creatorName?: string;
  createTime?: string;
  updateTime?: string;
  // 用户交互状态
  userLiked?: boolean;
  userCollected?: boolean;
}

// 项目查询对象
export interface ProjectQuery {
  pageNum?: number;
  pageSize?: number;
  projectName?: string;
  projectType?: string;
  projectCategory?: string;
  status?: string;
  recruitmentStatus?: string;
  difficultyLevel?: number;
  durationType?: string;
  visibility?: string;
  isFeatured?: string;
  isUrgent?: string;
  isCredit?: string;
  creatorId?: number;
  beginCreateTime?: string;
  endCreateTime?: string;
}

// 项目表单对象
export interface ProjectForm {
  projectId?: number;
  projectName: string;
  projectDescription: string;
  projectBackground?: string;
  projectGoals?: string;
  expectedOutcome?: string;
  coverImage?: string;
  projectType: string;
  projectCategory?: string;
  difficultyLevel?: number;
  durationType?: string;
  startDate?: string;
  endDate?: string;
  teamSizeMin?: number;
  teamSizeMax?: number;
  status?: string;
  recruitmentStatus?: string;
  visibility?: string;
  approvalMode?: string;
  isFeatured?: string;
  isUrgent?: string;
  isCredit?: string;
}

// 查询项目列表
export function listProject(query: ProjectQuery): AxiosPromise<ProjectInfo[]> {
  return request({
    url: '/hit/project/list',
    method: 'get',
    params: query
  });
}

// 查询项目详细信息
export function getProject(projectId: number): AxiosPromise<ProjectInfo> {
  return request({
    url: `/hit/project/${projectId}`,
    method: 'get'
  });
}

// 新增项目
export function addProject(data: ProjectForm): AxiosPromise<void> {
  return request({
    url: '/hit/project',
    method: 'post',
    data: data
  });
}

// 修改项目
export function updateProject(data: ProjectForm): AxiosPromise<void> {
  return request({
    url: '/hit/project',
    method: 'put',
    data: data
  });
}

// 删除项目
export function delProject(projectIds: number[]): AxiosPromise<void> {
  return request({
    url: `/hit/project/${projectIds}`,
    method: 'delete'
  });
}

// 导出项目列表
export function exportProject(query: ProjectQuery): AxiosPromise<void> {
  return request({
    url: '/hit/project/export',
    method: 'post',
    data: query,
    responseType: 'blob'
  });
}

// ==================== 公开接口 ====================

// 查询公开项目列表
export function listPublicProject(query: ProjectQuery): AxiosPromise<ProjectInfo[]> {
  return request({
    url: '/hit/project/public/list',
    method: 'get',
    params: query
  });
}

// 查询推荐项目
export function listRecommendedProject(query: ProjectQuery): AxiosPromise<ProjectInfo[]> {
  return request({
    url: '/hit/project/public/recommended',
    method: 'get',
    params: query
  });
}

// 查询精选项目
export function listFeaturedProject(query: ProjectQuery): AxiosPromise<ProjectInfo[]> {
  return request({
    url: '/hit/project/public/featured',
    method: 'get',
    params: query
  });
}

// 查询项目详细信息（公开）
export function getPublicProject(projectId: number): AxiosPromise<ProjectInfo> {
  return request({
    url: `/hit/project/public/${projectId}`,
    method: 'get'
  });
}

// 点赞项目
export function likeProject(projectId: number): AxiosPromise<void> {
  return request({
    url: `/hit/project/${projectId}/like`,
    method: 'post'
  });
}

// 取消点赞项目
export function unlikeProject(projectId: number): AxiosPromise<void> {
  return request({
    url: `/hit/project/${projectId}/unlike`,
    method: 'post'
  });
}

// 收藏项目
export function collectProject(projectId: number): AxiosPromise<void> {
  return request({
    url: `/hit/project/${projectId}/collect`,
    method: 'post'
  });
}

// 取消收藏项目
export function uncollectProject(projectId: number): AxiosPromise<void> {
  return request({
    url: `/hit/project/${projectId}/uncollect`,
    method: 'post'
  });
}

// ==================== 个人项目接口 ====================

// 查询我创建的项目
export function listMyProject(query: ProjectQuery): AxiosPromise<ProjectInfo[]> {
  return request({
    url: '/hit/project/my/created',
    method: 'get',
    params: query
  });
}

// 查询我可见的项目
export function listVisibleProject(query: ProjectQuery): AxiosPromise<ProjectInfo[]> {
  return request({
    url: '/hit/project/my/visible',
    method: 'get',
    params: query
  });
}

// 查询我收藏的项目
export function listCollectedProject(query: ProjectQuery): AxiosPromise<ProjectInfo[]> {
  return request({
    url: '/hit/project/my/collected',
    method: 'get',
    params: query
  });
}

// 查询我点赞的项目
export function listLikedProject(query: ProjectQuery): AxiosPromise<ProjectInfo[]> {
  return request({
    url: '/hit/project/my/liked',
    method: 'get',
    params: query
  });
}

// ==================== 统计接口 ====================

// 查询项目统计信息
export function getProjectStats(projectId: number): AxiosPromise<any> {
  return request({
    url: `/hit/project/public/stats/${projectId}`,
    method: 'get'
  });
}

// 检查用户是否点赞了项目
export function checkUserLiked(projectId: number, userId?: number): AxiosPromise<boolean> {
  return request({
    url: `/hit/project/check/liked/${projectId}`,
    method: 'get',
    params: userId ? { userId } : {}
  });
}

// 检查用户是否收藏了项目
export function checkUserCollected(projectId: number, userId?: number): AxiosPromise<boolean> {
  return request({
    url: `/hit/project/check/collected/${projectId}`,
    method: 'get',
    params: userId ? { userId } : {}
  });
}

// ==================== 项目成员管理接口 ====================

// 成员信息接口
export interface MemberInfo {
  memberId: number;
  userName: string;
  email: string;
  avatarUrl?: string;
  memberRole: string;
  role: string;
  department?: string;
  skills?: string;
  joinTime: string;
  status: string;
  isLeader?: string;
  contributionScore?: number;
  completedTasks?: number;
  totalTasks?: number;
}

// 查询项目成员列表 - 修改为后端实际路径
export function getProjectMemberList(projectId: number, pageNum?: number, pageSize?: number): AxiosPromise<MemberInfo[]> {
  return request({
    url: `/hit/project/member/project/${projectId}`,
    method: 'get',
    params: {
      pageNum: pageNum || 1,
      pageSize: pageSize || 10
    }
  });
}

// 邀请成员加入项目接口
export interface InviteMemberForm {
  projectId: number;
  userId: number;
  memberRole: string;
}

// 邀请成员加入项目 - 修改为后端实际路径
export function inviteMemberToProject(data: InviteMemberForm): AxiosPromise<any> {
  return request({
    url: '/hit/project/member/add-member',
    method: 'post',
    data
  });
}

// 变更成员角色接口
export interface ChangeRoleForm {
  memberRole: string;
}

// 变更项目成员角色 - 修改为后端实际路径
export function changeProjectMemberRole(memberId: number, data: ChangeRoleForm): AxiosPromise<any> {
  return request({
    url: `/hit/project/member/role/${memberId}`,
    method: 'put',
    data
  });
}

// 移除项目成员 - 修改为后端实际路径
export function removeProjectMember(memberId: number): AxiosPromise<any> {
  return request({
    url: `/hit/project/member/remove/${memberId}`,
    method: 'put'
  });
}

// 获取项目成员数量 - 新增接口
export function getProjectMemberCount(projectId: number): AxiosPromise<number> {
  return request({
    url: `/hit/project/member/count/${projectId}`,
    method: 'get'
  });
}

// ==================== 项目申请管理接口 ====================

// 申请信息接口
export interface ApplicationInfo {
  id: number;
  applicantId: number;
  applicantName: string;
  applicantAvatar?: string;
  applicantTitle?: string;
  applicantEmail: string;
  appliedPosition: string;
  motivation: string;
  applicationTime: string;
  status: string;
  reviewTime?: string;
  reviewComment?: string;
}

// 申请查询参数
export interface ApplicationQuery {
  projectId: number;
  status?: string;
  pageNum?: number;
  pageSize?: number;
}

// 获取项目申请列表 - 修改为后端实际路径
export function getProjectApplicationsList(params: ApplicationQuery): AxiosPromise<any> {
  return request({
    url: `/hit/project/application/project/${params.projectId}`,
    method: 'get',
    params: {
      status: params.status,
      pageNum: params.pageNum,
      pageSize: params.pageSize
    }
  });
}

// 获取待审核申请数量 - 修改为后端实际路径
export function getPendingApplicationsCount(projectId: number): AxiosPromise<number> {
  return request({
    url: `/hit/project/application/pending-count/${projectId}`,
    method: 'get'
  });
}

// 通过项目申请 - 修改为后端实际路径
export function approveProjectApplication(applicationId: number, reviewComment?: string): AxiosPromise<any> {
  return request({
    url: `/hit/project/application/review/${applicationId}`,
    method: 'put',
    params: {
      status: 'approved',
      reviewResult: reviewComment
    }
  });
}

// 拒绝项目申请 - 修改为后端实际路径
export function rejectProjectApplication(applicationId: number, reviewComment?: string): AxiosPromise<any> {
  return request({
    url: `/hit/project/application/review/${applicationId}`,
    method: 'put',
    params: {
      status: 'rejected',
      reviewResult: reviewComment
    }
  });
}

// 撤销项目申请 - 修改为后端实际路径
export function revokeProjectApplication(applicationId: number): AxiosPromise<any> {
  return request({
    url: `/hit/project/application/withdraw/${applicationId}`,
    method: 'put'
  });
}

// 批量通过申请 - 修改为后端实际路径
export function batchApproveApplications(applicationIds: number[]): AxiosPromise<any> {
  return request({
    url: '/hit/project/application/batch-review',
    method: 'put',
    params: {
      applicationIds: applicationIds,
      status: 'approved'
    }
  });
}

// 批量拒绝申请 - 修改为后端实际路径
export function batchRejectApplications(applicationIds: number[], reviewComment?: string): AxiosPromise<any> {
  return request({
    url: '/hit/project/application/batch-review',
    method: 'put',
    params: {
      applicationIds: applicationIds,
      status: 'rejected',
      reviewResult: reviewComment
    }
  });
}

// ==================== 项目申请接口 ====================

// 申请表单接口
export interface ApplicationForm {
  projectId: number;
  applicationReason: string;
  selfIntroduction: string;
  relevantExperience: string;
  expectedContribution: string;
  availableTime: string;
  contactInfo: string;
  resumeUrl?: string;
  portfolioUrl?: string;
}

// 申请加入项目
export function applyToProject(data: ApplicationForm): AxiosPromise<void> {
  return request({
    url: '/hit/project/application/apply',
    method: 'post',
    data: data
  });
}

// 撤回申请
export function withdrawApplication(applicationId: number): AxiosPromise<void> {
  return request({
    url: `/hit/project/application/withdraw/${applicationId}`,
    method: 'put'
  });
}

// 检查用户是否已申请项目
export function checkUserApplicationExists(projectId: number): AxiosPromise<boolean> {
  return request({
    url: `/hit/project/application/check/${projectId}`,
    method: 'get'
  });
}

// 获取我的申请列表
export function getMyApplications(query?: any): AxiosPromise<any> {
  return request({
    url: '/hit/project/application/my',
    method: 'get',
    params: query
  });
}

// ==================== 用户搜索接口 ====================

// 用户搜索信息接口
export interface UserSearchInfo {
  userId: number;
  userName: string;
  email: string;
  avatar?: string;
}

// 搜索用户（用于邀请成员）
export function searchUsers(keyword: string): AxiosPromise<UserSearchInfo[]> {
  return request({
    url: '/system/user/search',
    method: 'get',
    params: { keyword }
  });
}

// ==================== 管理后台统计数据接口 ====================

// 管理后台统计数据接口
export interface AdminStatisticsInfo {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  featuredProjects: number;
  totalMembers: number;
  activeMembers: number;
  totalLeaders: number;
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  projectsIncrease: number;
  membersIncrease: number;
  applicationsProcessed: number;
  completedIncrease: number;
}

// 项目趋势数据接口
export interface TrendDataInfo {
  date: string;
  count: number;
}

// 项目类型分布数据接口
export interface TypeDistributionInfo {
  type: string;
  typeName: string;
  count: number;
}

// 获取管理后台统计数据
export function getAdminStatistics(): AxiosPromise<AdminStatisticsInfo> {
  return request({
    url: '/hit/project/admin/statistics/overview',
    method: 'get'
  });
}

// 获取项目创建趋势数据
export function getProjectTrends(startDate?: string, endDate?: string): AxiosPromise<TrendDataInfo[]> {
  return request({
    url: '/hit/project/admin/statistics/trends',
    method: 'get',
    params: { startDate, endDate }
  });
}

// 获取项目类型分布数据
export function getProjectTypeDistribution(): AxiosPromise<TypeDistributionInfo[]> {
  return request({
    url: '/hit/project/admin/statistics/types',
    method: 'get'
  });
} 