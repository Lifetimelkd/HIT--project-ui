import request from '@/utils/request';
import { NotificationForm, NotificationQuery, NotificationVO } from './types';
import { AxiosPromise } from 'axios';

// 查询消息通知列表
export function listNotification(query: NotificationQuery): AxiosPromise<NotificationVO[]> {
  return request({
    url: '/hit/notification/list',
    method: 'get',
    params: query
  });
}

// 查询消息通知详细
export function getNotification(notificationId: string | number): AxiosPromise<NotificationVO> {
  return request({
    url: '/hit/notification/' + notificationId,
    method: 'get'
  });
}

// 新增消息通知
export function addNotification(data: NotificationForm) {
  return request({
    url: '/hit/notification',
    method: 'post',
    data: data
  });
}

// 修改消息通知
export function updateNotification(data: NotificationForm) {
  return request({
    url: '/hit/notification',
    method: 'put',
    data: data
  });
}

// 删除消息通知
export function delNotification(notificationId: string | number | Array<string | number>) {
  return request({
    url: '/hit/notification/' + notificationId,
    method: 'delete'
  });
}

// 导出消息通知
export function exportNotification(query: NotificationQuery) {
  return request({
    url: '/hit/notification/export',
    method: 'post',
    data: query
  });
}

// ==================== 用户通知相关接口 ====================

// 获取当前用户未读通知列表
export function getMyUnreadNotifications(query?: any) {
  return request({
    url: '/hit/notification/my/unread',
    method: 'get',
    params: query
  });
}

// 获取当前用户已读通知列表
export function getMyReadNotifications(query?: any) {
  return request({
    url: '/hit/notification/my/read',
    method: 'get',
    params: query
  });
}

// 获取当前用户未读通知数量
export function getUnreadCount(): AxiosPromise<number> {
  return request({
    url: '/hit/notification/my/unread/count',
    method: 'get'
  });
}

// 标记通知为已读
export function markAsRead(notificationId: string | number) {
  return request({
    url: '/hit/notification/' + notificationId + '/read',
    method: 'post'
  });
}

// 批量标记通知为已读
export function batchMarkAsRead(notificationIds: Array<string | number>) {
  return request({
    url: '/hit/notification/batch/read',
    method: 'post',
    data: notificationIds
  });
}

// 标记所有通知为已读
export function markAllAsRead() {
  return request({
    url: '/hit/notification/all/read',
    method: 'post'
  });
}

// 删除单个已读通知
export function deleteNotification(notificationId: string | number) {
  return request({
    url: '/hit/notification/' + notificationId,
    method: 'delete'
  });
}

// 删除已读通知
export function deleteReadNotifications(notificationIds: Array<string | number>) {
  return request({
    url: '/hit/notification/read',
    method: 'delete',
    data: notificationIds
  });
}

// 发送通知（管理员接口）
export function sendNotification(data: NotificationForm) {
  return request({
    url: '/hit/notification/send',
    method: 'post',
    data: data
  });
}

// 创建测试通知
export function createTestNotification() {
  return request({
    url: '/hit/notification/test/create',
    method: 'post'
  });
}

// 检查数据库数据
export function checkDatabaseData() {
  return request({
    url: '/hit/notification/test/db-check',
    method: 'get'
  });
}
