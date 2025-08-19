import request from '@/utils/request';
import { TaskForm, TaskQuery, TaskVO } from './types';
import { AxiosPromise } from 'axios';

// 分页响应类型
interface PageResponse<T> {
  total: number;
  rows: T[];
  code: number;
  msg: string;
}

// 查询项目任务列表
export function listTask(query: TaskQuery): AxiosPromise<PageResponse<TaskVO>> {
  return request({
    url: '/hit/project/task/list',
    method: 'get',
    params: query
  });
}

// 查询项目任务详细
export function getTask(taskId: string): AxiosPromise<TaskVO> {
  return request({
    url: '/hit/project/task/' + taskId,
    method: 'get'
  });
}

// 新增项目任务
export function addTask(data: TaskForm) {
  return request({
    url: '/hit/project/task',
    method: 'post',
    data: data
  });
}

// 修改项目任务
export function updateTask(data: TaskForm) {
  return request({
    url: '/hit/project/task',
    method: 'put',
    data: data
  });
}

// 删除项目任务
export function delTask(taskId: string | Array<string>) {
  return request({
    url: '/hit/project/task/' + taskId,
    method: 'delete'
  });
}

// 导出项目任务
export function exportTask(query: TaskQuery) {
  return request({
    url: '/hit/project/task/export',
    method: 'post',
    data: query
  });
}

// ==================== 业务接口 ====================

// 查询项目的所有任务
export function getProjectTasks(projectId: string): AxiosPromise<TaskVO[]> {
  return request({
    url: '/hit/project/task/project/' + projectId,
    method: 'get'
  });
}

// 查询用户负责的任务
export function getMyAssignedTasks(query?: TaskQuery): AxiosPromise<PageResponse<TaskVO>> {
  return request({
    url: '/hit/project/task/my/assigned',
    method: 'get',
    params: query
  });
}

// 查询用户创建的任务
export function getMyCreatedTasks(): AxiosPromise<TaskVO[]> {
  return request({
    url: '/hit/project/task/my/created',
    method: 'get'
  });
}

// 查询父任务的子任务
export function getSubTasks(parentTaskId: string): AxiosPromise<TaskVO[]> {
  return request({
    url: '/hit/project/task/' + parentTaskId + '/subtasks',
    method: 'get'
  });
}

// 查询项目的里程碑任务
export function getMilestoneTasks(projectId: string): AxiosPromise<TaskVO[]> {
  return request({
    url: '/hit/project/task/project/' + projectId + '/milestones',
    method: 'get'
  });
}

// 查询即将到期的任务
export function getTasksDueSoon(days: number = 7): AxiosPromise<TaskVO[]> {
  return request({
    url: '/hit/project/task/due-soon',
    method: 'get',
    params: { days }
  });
}

// 查询逾期的任务
export function getOverdueTasks(): AxiosPromise<TaskVO[]> {
  return request({
    url: '/hit/project/task/overdue',
    method: 'get'
  });
}

// 查询项目下可选的父任务（未过期且未完成的任务）
export function getAvailableParentTasks(projectId: string): AxiosPromise<TaskVO[]> {
  return request({
    url: '/hit/project/task/project/' + projectId + '/available-parent-tasks',
    method: 'get'
  });
}

// 更新任务状态
export function updateTaskStatus(taskId: string, status: string) {
  return request({
    url: '/hit/project/task/' + taskId + '/status',
    method: 'put',
    params: { status }
  });
}

// 更新任务进度
export function updateTaskProgress(taskId: string, progress: number) {
  return request({
    url: '/hit/project/task/' + taskId + '/progress',
    method: 'put',
    params: { progress }
  });
}

// 分配任务
export function assignTask(taskId: string, assigneeId: string) {
  return request({
    url: '/hit/project/task/' + taskId + '/assign',
    method: 'put',
    params: { assigneeId }
  });
}

// 批量分配任务
export function batchAssignTasks(taskIds: Array<string>, assigneeId: string) {
  return request({
    url: '/hit/project/task/batch/assign',
    method: 'put',
    data: taskIds,
    params: { assigneeId }
  });
}

// 添加任务依赖
export function addTaskDependency(taskId: string, dependencyId: string) {
  return request({
    url: '/hit/project/task/' + taskId + '/dependency',
    method: 'post',
    params: { dependencyId }
  });
}

// 移除任务依赖
export function removeTaskDependency(taskId: string, dependencyId: string) {
  return request({
    url: '/hit/project/task/' + taskId + '/dependency',
    method: 'delete',
    params: { dependencyId }
  });
}

// 统计项目任务数量（按状态分组）
export function getProjectTaskStatusStats(projectId: string) {
  return request({
    url: '/hit/project/task/project/' + projectId + '/stats',
    method: 'get'
  });
}

// 统计用户任务数量（按状态分组）
export function getMyTaskStats() {
  return request({
    url: '/hit/project/task/my/stats',
    method: 'get'
  });
}

// 获取任务看板数据
export function getTaskKanbanData(projectId: string) {
  return request({
    url: '/hit/project/task/project/' + projectId + '/kanban',
    method: 'get'
  });
}

// 获取任务甘特图数据
export function getTaskGanttData(projectId: string) {
  return request({
    url: '/hit/project/task/project/' + projectId + '/gantt',
    method: 'get'
  });
}

// 复制任务
export function copyTask(taskId: string, newTaskName: string) {
  return request({
    url: '/hit/project/task/' + taskId + '/copy',
    method: 'post',
    params: { newTaskName }
  });
}

// 归档任务
export function archiveTask(taskId: string) {
  return request({
    url: `/hit/project/task/${taskId}/archive`,
    method: 'post'
  });
}

// ==================== 统计相关API ====================

// 任务概览统计数据
export interface TaskOverviewStats {
  totalTasks: number;
  completedTasks: number;
  avgProgress: number;
  overdueTasks: number;
  taskGrowth: number;
  completionGrowth: number;
  progressGrowth: number;
  overdueRate: number;
}

// 状态分布数据
export interface StatusDistribution {
  status: string;
  statusName: string;
  count: number;
}

// 优先级分布数据
export interface PriorityDistribution {
  priority: string;
  priorityName: string;
  count: number;
}

// 分布统计数据
export interface TaskDistributionStats {
  statusDistribution: StatusDistribution[];
  priorityDistribution: PriorityDistribution[];
}

// 趋势统计数据
export interface TaskTrendStats {
  dates: string[];
  newTasks: number[];
  completedTasks: number[];
}

// 项目统计数据
export interface ProjectStats {
  projectId: string;
  projectName: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number;
  avgProgress: number;
}

// 统计查询参数
export interface StatisticsQuery {
  projectId?: string;
  startDate?: string;
  endDate?: string;
}

// 获取任务概览统计
export function getTaskOverviewStats(params?: StatisticsQuery): AxiosPromise<TaskOverviewStats> {
  return request({
    url: '/hit/project/task/statistics/overview',
    method: 'get',
    params
  });
}

// 获取任务分布统计
export function getTaskDistributionStats(params?: StatisticsQuery): AxiosPromise<TaskDistributionStats> {
  return request({
    url: '/hit/project/task/statistics/distribution',
    method: 'get',
    params
  });
}

// 获取任务趋势统计
export function getTaskTrendStats(params?: StatisticsQuery): AxiosPromise<TaskTrendStats> {
  return request({
    url: '/hit/project/task/statistics/trends',
    method: 'get',
    params
  });
}

// 获取项目任务统计列表
export function getProjectTaskStats(params?: { startDate?: string; endDate?: string }): AxiosPromise<ProjectStats[]> {
  return request({
    url: '/hit/project/task/statistics/projects',
    method: 'get',
    params
  });
}

// 获取任务依赖列表
export function getTaskDependencies(taskId: string): AxiosPromise<TaskVO[]> {
  return request({
    url: '/hit/project/task/' + taskId + '/dependencies',
    method: 'get'
  });
}

// 获取任务统计数据
export function getTaskStatistics(params: any) {
  return request({
    url: '/hit/project/task/statistics',
    method: 'get',
    params
  });
}
