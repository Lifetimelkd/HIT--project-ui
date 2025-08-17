import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import {
  getMyUnreadNotifications,
  getMyReadNotifications,
  getUnreadCount,
  markAsRead,
  batchMarkAsRead,
  markAllAsRead,
  deleteNotification,
  deleteReadNotifications
} from '@/api/hit/notification';
import type { NotificationVO } from '@/api/hit/notification/types';

interface NoticeItem {
  notificationId?: number;
  title?: string;
  read: boolean;
  message: any;
  time: string;
  content?: string;
  notificationType?: string;
  priority?: string;
}

export const useNoticeStore = defineStore('notice', () => {
  const state = reactive({
    notices: [] as NoticeItem[],
    unreadNotifications: [] as NotificationVO[],
    readNotifications: [] as NotificationVO[],
    unreadCount: 0,
    loading: false
  });

  // 兼容旧版本的添加通知方法（用于SSE推送）
  const addNotice = (notice: NoticeItem) => {
    state.notices.push(notice);
    // 刷新未读通知列表
    loadUnreadNotifications();
  };

  const removeNotice = (notice: NoticeItem) => {
    state.notices.splice(state.notices.indexOf(notice), 1);
  };

  // 加载未读通知列表
  const loadUnreadNotifications = async () => {
    try {
      state.loading = true;
      console.log('开始加载未读通知列表...');
      const response = await getMyUnreadNotifications();
      console.log('未读通知API响应:', response);
      console.log('响应数据结构:', response.data);

      // 修复数据结构问题：根据实际返回的数据结构解析
      let notifications = [];
      if (response && response.data) {
        // 优先使用 rows（根据您提供的接口返回格式）
        notifications = response.data.rows || response.data.records || response.data || [];
        // 确保每个通知对象都有必要的字段
        notifications = notifications.map((item: any) => ({
          notificationId: item.notificationId || item.id,
          userId: item.userId,
          senderId: item.senderId,
          notificationType: item.notificationType || 'system',
          title: item.title || '无标题',
          content: item.content || '无内容',
          relatedId: item.relatedId,
          relatedType: item.relatedType,
          actionUrl: item.actionUrl,
          isRead: item.isRead || '0',
          readTime: item.readTime,
          priority: item.priority || 'normal',
          channel: item.channel || 'system',
          sendStatus: item.sendStatus || 'sent',
          sendTime: item.sendTime,
          createTime: item.createTime,
          senderName: item.senderName,
          receiverName: item.receiverName
        }));
      }

      state.unreadNotifications = Array.isArray(notifications) ? notifications : [];

      // 更新未读数量
      try {
        const countResponse = await getUnreadCount();
        state.unreadCount = countResponse.data || 0;
        console.log('未读通知数量:', state.unreadCount);
      } catch (countError) {
        console.error('获取未读数量失败:', countError);
        state.unreadCount = state.unreadNotifications.length;
      }
    } catch (error) {
      console.error('加载未读通知失败:', error);
      ElMessage.error('加载未读通知失败');
    } finally {
      state.loading = false;
    }
  };

  // 加载已读通知列表
  const loadReadNotifications = async () => {
    try {
      state.loading = true;
      console.log('开始加载已读通知列表...');
      const response = await getMyReadNotifications();
      console.log('已读通知API响应:', response);
      console.log('响应数据结构:', response.data);

      // 修复数据结构问题：根据实际返回的数据结构解析
      let notifications = [];
      if (response.data) {
        // 优先使用 rows（根据您提供的接口返回格式）
        notifications = response.data.rows || response.data.records || response.data || [];
      }

      state.readNotifications = Array.isArray(notifications) ? notifications : [];
      console.log('解析后的已读通知数据:', state.readNotifications);
      console.log('已读通知数据长度:', state.readNotifications.length);
    } catch (error) {
      console.error('加载已读通知失败:', error);
    } finally {
      state.loading = false;
    }
  };

  // 标记单个通知为已读
  const markNotificationAsRead = async (notificationId: string | number) => {
    try {
      await markAsRead(notificationId);
      // 刷新通知列表
      await loadUnreadNotifications();
      await loadReadNotifications();
      return true;
    } catch (error) {
      console.error('标记通知已读失败:', error);
      return false;
    }
  };

  // 批量标记通知为已读
  const batchMarkNotificationsAsRead = async (notificationIds: Array<string | number>) => {
    try {
      await batchMarkAsRead(notificationIds);
      // 刷新通知列表
      await loadUnreadNotifications();
      await loadReadNotifications();
      return true;
    } catch (error) {
      console.error('批量标记通知已读失败:', error);
      return false;
    }
  };

  // 标记所有通知为已读
  const readAll = async () => {
    try {
      await markAllAsRead();
      // 刷新通知列表
      await loadUnreadNotifications();
      await loadReadNotifications();

      // 兼容旧版本
      state.notices.forEach((item: any) => {
        item.read = true;
      });
      return true;
    } catch (error) {
      console.error('标记所有通知已读失败:', error);
      return false;
    }
  };

  // 删除单个通知
  const deleteNotificationById = async (notificationId: string | number) => {
    try {
      await deleteNotification(notificationId);
      // 刷新通知列表
      await loadUnreadNotifications();
      await loadReadNotifications();
      return true;
    } catch (error) {
      console.error('删除通知失败:', error);
      ElMessage.error('删除失败');
      return false;
    }
  };

  // 删除已读通知
  const deleteReadNotificationList = async (notificationIds: Array<string | number>) => {
    try {
      await deleteReadNotifications(notificationIds);
      // 刷新已读通知列表
      await loadReadNotifications();
      return true;
    } catch (error) {
      console.error('删除已读通知失败:', error);
      ElMessage.error('删除失败');
      return false;
    }
  };

  const clearNotice = () => {
    state.notices = [];
    state.unreadNotifications = [];
    state.readNotifications = [];
    state.unreadCount = 0;
  };

  // 初始化通知数据
  const initNotifications = async () => {
    await loadUnreadNotifications();
  };

  return {
    state,
    addNotice,
    removeNotice,
    readAll,
    clearNotice,
    loadUnreadNotifications,
    loadReadNotifications,
    markNotificationAsRead,
    batchMarkNotificationsAsRead,
    deleteNotificationById,
    deleteReadNotificationList,
    initNotifications
  };
});
