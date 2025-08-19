import request from '@/utils/request';
import { TaskCommentForm, TaskCommentQuery, TaskCommentVO } from './types';
import { AxiosPromise } from 'axios';

// 查询任务评论列表
export function listTaskComment(query: TaskCommentQuery): AxiosPromise<TaskCommentVO[]> {
  return request({
    url: '/hit/project/task/comment/list',
    method: 'get',
    params: query
  });
}

// 查询任务评论详细
export function getTaskComment(commentId: string | number): AxiosPromise<TaskCommentVO> {
  return request({
    url: '/hit/project/task/comment/' + commentId,
    method: 'get'
  });
}

// 新增任务评论
export function addTaskComment(data: TaskCommentForm) {
  return request({
    url: '/hit/project/task/comment',
    method: 'post',
    data: data
  });
}

// 修改任务评论
export function updateTaskComment(data: TaskCommentForm) {
  return request({
    url: '/hit/project/task/comment',
    method: 'put',
    data: data
  });
}

// 删除任务评论
export function delTaskComment(commentId: string | number | Array<string | number>) {
  return request({
    url: '/hit/project/task/comment/' + commentId,
    method: 'delete'
  });
}

// 导出任务评论
export function exportTaskComment(query: TaskCommentQuery) {
  return request({
    url: '/hit/project/task/comment/export',
    method: 'post',
    data: query
  });
}

// ==================== 业务接口 ====================

// 查询任务的所有评论
export function getTaskComments(taskId: string | number): AxiosPromise<TaskCommentVO[]> {
  return request({
    url: '/hit/project/task/comment/task/' + taskId,
    method: 'get'
  });
}

// 查询任务的评论树形结构
export function getTaskCommentTree(taskId: string | number): AxiosPromise<TaskCommentVO[]> {
  return request({
    url: '/hit/project/task/comment/task/' + taskId + '/tree',
    method: 'get'
  });
}

// 查询任务的顶级评论
export function getTopLevelComments(taskId: string | number): AxiosPromise<TaskCommentVO[]> {
  return request({
    url: '/hit/project/task/comment/task/' + taskId + '/top-level',
    method: 'get'
  });
}

// 查询评论的回复
export function getReplies(parentCommentId: string | number): AxiosPromise<TaskCommentVO[]> {
  return request({
    url: '/hit/project/task/comment/' + parentCommentId + '/replies',
    method: 'get'
  });
}

// 查询用户的评论
export function getMyComments(): AxiosPromise<TaskCommentVO[]> {
  return request({
    url: '/hit/project/task/comment/my/comments',
    method: 'get'
  });
}

// 查询置顶评论
export function getPinnedComments(taskId: string | number): AxiosPromise<TaskCommentVO[]> {
  return request({
    url: '/hit/project/task/comment/task/' + taskId + '/pinned',
    method: 'get'
  });
}

// 查询提及我的评论
export function getMentionedComments(): AxiosPromise<TaskCommentVO[]> {
  return request({
    url: '/hit/project/task/comment/my/mentioned',
    method: 'get'
  });
}

// 统计任务评论数量
export function getTaskCommentCount(taskId: string | number): AxiosPromise<number> {
  return request({
    url: '/hit/project/task/comment/task/' + taskId + '/count',
    method: 'get'
  });
}

// 统计用户评论数量
export function getMyCommentCount(): AxiosPromise<number> {
  return request({
    url: '/hit/project/task/comment/my/count',
    method: 'get'
  });
}

// 点赞评论
export function likeComment(commentId: string | number) {
  return request({
    url: '/hit/project/task/comment/' + commentId + '/like',
    method: 'post'
  });
}

// 取消点赞评论
export function unlikeComment(commentId: string | number) {
  return request({
    url: '/hit/project/task/comment/' + commentId + '/unlike',
    method: 'post'
  });
}

// 设置评论置顶状态
export function setPinnedStatus(commentId: string | number, isPinned: boolean) {
  return request({
    url: '/hit/project/task/comment/' + commentId + '/pin',
    method: 'put',
    params: { isPinned }
  });
}

// 回复评论
export function replyComment(parentCommentId: string | number, content: string, mentionedUsers?: Array<string | number>) {
  return request({
    url: '/hit/project/task/comment/' + parentCommentId + '/reply',
    method: 'post',
    params: { content },
    data: mentionedUsers
  });
}

// 添加任务评论（带@提醒功能）
export function addTaskCommentWithMention(
  taskId: string | number,
  content: string,
  commentType: string = 'normal',
  mentionedUsers?: Array<string | number>,
  attachments?: any[]
) {
  return request({
    url: '/hit/project/task/comment/task/' + taskId + '/add',
    method: 'post',
    params: { content, commentType },
    data: { mentionedUsers, attachments }
  });
}

// 获取评论统计信息
export function getCommentStatistics(taskId: string | number) {
  return request({
    url: '/hit/project/task/comment/task/' + taskId + '/statistics',
    method: 'get'
  });
}

// 批量删除任务的所有评论
export function deleteTaskComments(taskId: string | number) {
  return request({
    url: '/hit/project/task/comment/task/' + taskId + '/all',
    method: 'delete'
  });
}

// 导入评论（从其他任务复制评论）
export function importComments(sourceTaskId: string | number, targetTaskId: string | number) {
  return request({
    url: '/hit/project/task/comment/import',
    method: 'post',
    params: { sourceTaskId, targetTaskId }
  });
}
