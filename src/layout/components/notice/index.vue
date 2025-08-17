<template>
  <div v-loading="loading" class="layout-navbars-breadcrumb-user-news">
    <div class="head-box">
      <div class="head-box-title">通知公告</div>
      <div class="head-box-actions">
        <div class="head-box-btn" @click="createTestNotificationHandler" style="margin-right: 10px;">创建测试</div>
        <div class="head-box-btn" @click="checkDatabaseHandler" style="margin-right: 10px;">检查数据</div>
        <div class="head-box-btn" @click="handleReadAll">全部已读</div>
      </div>
    </div>

    <!-- 切换标签 -->
    <div class="tab-box">
      <div
        class="tab-item"
        :class="{ active: activeTab === 'unread' }"
        @click="switchTab('unread')"
      >
        未读消息
        <span v-if="unreadCount > 0" class="count-badge">{{ unreadCount }}</span>
      </div>
      <div
        class="tab-item"
        :class="{ active: activeTab === 'read' }"
        @click="switchTab('read')"
      >
        已读消息
      </div>
    </div>

    <div v-loading="loading" class="content-box">
      <!-- 未读消息列表 -->
      <template v-if="activeTab === 'unread'">

        <template v-if="unreadNotifications && unreadNotifications.length > 0">
          <div
            v-for="(notification, index) in unreadNotifications"
            :key="`notification-${notification.notificationId}-${index}`"
            class="content-box-item"
            @click="onNotificationClick(notification)"
          >
            <div class="item-conten">
              <div class="notification-title">{{ notification.title || '无标题' }}</div>
              <div class="content-box-msg">{{ notification.content || '无内容' }}</div>
              <div class="content-box-time">{{ formatTime(notification.createTime || notification.sendTime) }}</div>
            </div>
            <span class="el-tag el-tag--danger el-tag--mini read">未读</span>
          </div>
        </template>
        <el-empty v-else description="暂无未读消息"></el-empty>
      </template>

      <!-- 已读消息列表 -->
      <template v-if="activeTab === 'read'">
        <template v-if="readNotifications && readNotifications.length > 0">
          <div
            v-for="notification in readNotifications"
            :key="notification.notificationId"
            class="content-box-item read-item"
          >
            <div class="item-conten">
              <div class="notification-title">{{ notification.title || '无标题' }}</div>
              <div class="content-box-msg">{{ notification.content || '无内容' }}</div>
              <div class="content-box-time">已读于 {{ formatTime(notification.readTime) }}</div>
            </div>
            <div class="action-buttons">
              <span class="el-tag el-tag--success el-tag--mini read">已读</span>
              <el-button
                type="danger"
                size="small"
                text
                @click="deleteNotification(notification.notificationId)"
              >
                删除
              </el-button>
            </div>
          </div>
        </template>
        <el-empty v-else description="暂无已读消息"></el-empty>
      </template>
    </div>

    <div v-if="getCurrentList().length > 0" class="foot-box">
      <span v-if="activeTab === 'read'" @click="batchDeleteRead">批量删除</span>
      <span v-else @click="onGoToGiteeClick">前往gitee</span>
    </div>
  </div>
</template>

<script setup lang="ts" name="layoutBreadcrumbUserNews">
import { ref, onMounted, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { NotificationVO } from '@/api/hit/notification/types';
import {
  getMyUnreadNotifications,
  getMyReadNotifications,
  getUnreadCount,
  markAsRead,
  batchMarkAsRead,
  markAllAsRead,
  deleteNotification as deleteNotificationApi,
  deleteReadNotifications,
  createTestNotification,
  checkDatabaseData
} from '@/api/hit/notification';

// 当前激活的标签页
const activeTab = ref('unread');

// 组件内部状态管理
const unreadNotifications = ref<NotificationVO[]>([]);
const readNotifications = ref<NotificationVO[]>([]);
const unreadCount = ref(0);
const loading = ref(false);

/**
 * 加载未读通知
 */
const loadUnreadNotifications = async () => {
  try {
    loading.value = true;
    const response = await getMyUnreadNotifications();
    console.log('未读通知API响应:', response.rows);
    if (response.code === 200) {
      unreadNotifications.value = response.rows || [];
    }
  } catch (error) {
    console.error('加载未读通知失败:', error);
    ElMessage.error('加载未读通知失败');
  } finally {
    loading.value = false;
  }
};

/**
 * 加载已读通知
 */
const loadReadNotifications = async () => {
  try {
    loading.value = true;
    const response = await getMyReadNotifications();
    if (response.code === 200) {
      readNotifications.value = response.rows || [];
    }
  } catch (error) {
    console.error('加载已读通知失败:', error);
    ElMessage.error('加载已读通知失败');
  } finally {
    loading.value = false;
  }
};

/**
 * 加载未读数量
 */
const loadUnreadCount = async () => {
  try {
    const response = await getUnreadCount();
    if (response.code === 200) {
      unreadCount.value = response.data || 0;
    }
  } catch (error) {
    console.error('加载未读数量失败:', error);
  }
};

/**
 * 切换标签页
 */
const switchTab = async (tab: string) => {
  activeTab.value = tab;
  if (tab === 'unread') {
    await loadUnreadNotifications();
  } else {
    await loadReadNotifications();
  }
};

/**
 * 获取当前列表
 */
const getCurrentList = () => {
  return activeTab.value === 'unread'
    ? unreadNotifications.value
    : readNotifications.value;
};

/**
 * 点击通知项
 */
const onNotificationClick = async (notification: NotificationVO) => {
  if (!notification) {
    console.error('通知对象为空');
    return;
  }

  if (notification.isRead === '0') {
    // 标记为已读
    try {
      await markAsRead(notification.notificationId);
      ElMessage.success('已标记为已读');
      // 刷新数据
      await loadUnreadNotifications();
      await loadReadNotifications();
      await loadUnreadCount();
    } catch (error) {
      console.error('标记已读失败:', error);
      ElMessage.error('标记已读失败');
    }
  }

  // 如果有操作链接，可以跳转
  if (notification.actionUrl) {
    window.open(notification.actionUrl);
  }
};

/**
 * 删除单个通知
 */
const deleteNotification = async (notificationId: string | number) => {
  try {
    await ElMessageBox.confirm('确定要删除这条通知吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    try {
      await deleteNotificationApi(notificationId);
      ElMessage.success('删除成功');
      // 刷新数据
      await loadUnreadNotifications();
      await loadReadNotifications();
      await loadUnreadCount();
    } catch (error) {
      console.error('删除失败:', error);
      ElMessage.error('删除失败');
    }
  } catch (error) {
    // 用户取消删除
  }
};

/**
 * 批量删除已读消息
 */
const batchDeleteRead = async () => {
  if (readNotifications.value.length === 0) {
    ElMessage.warning('没有可删除的已读消息');
    return;
  }

  try {
    await ElMessageBox.confirm('确定要删除所有已读消息吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    const notificationIds = readNotifications.value.map(n => n.notificationId);
    await deleteReadNotifications(notificationIds);
    ElMessage.success('批量删除成功');
    // 刷新数据
    await loadReadNotifications();
    await loadUnreadCount();
  } catch (error) {
    console.error('批量删除失败:', error);
    ElMessage.error('批量删除失败');
  }
};

/**
 * 全部已读
 */
const handleReadAll = async () => {
  try {
    await markAllAsRead();
    ElMessage.success('已标记全部为已读');
    // 刷新数据
    await loadUnreadNotifications();
    await loadReadNotifications();
    await loadUnreadCount();
  } catch (error) {
    console.error('标记全部已读失败:', error);
    ElMessage.error('标记全部已读失败');
  }
};

/**
 * 创建测试通知
 */
const createTestNotificationHandler = async () => {
  try {
    await createTestNotification();
    ElMessage.success('测试通知创建成功');
    // 刷新通知列表
    await loadUnreadNotifications();
    await loadUnreadCount();
  } catch (error) {
    console.error('创建测试通知失败:', error);
    ElMessage.error('创建测试通知失败');
  }
};

/**
 * 检查数据库数据
 */
const checkDatabaseHandler = async () => {
  try {
    const response = await checkDatabaseData();
    console.log('数据库检查结果:', response.data);
    ElMessage.success('数据库检查完成，请查看控制台');
  } catch (error) {
    console.error('检查数据库失败:', error);
    ElMessage.error('检查数据库失败');
  }
};

/**
 * 格式化时间
 */
const formatTime = (timeStr: string) => {
  if (!timeStr) return '';
  return new Date(timeStr).toLocaleString();
};

// 前往通知中心点击
const onGoToGiteeClick = () => {
  window.open('https://gitee.com/dromara/RuoYi-Vue-Plus/tree/5.X/');
};

/**
 * 初始化数据
 */
const initData = async () => {
  await loadUnreadNotifications();
  await loadUnreadCount();
};

onMounted(() => {
  nextTick(async () => {
    // 初始化通知数据
    await initData();
  });
});
</script>

<style lang="scss" scoped>
.layout-navbars-breadcrumb-user-news {
  .head-box {
    display: flex;
    border-bottom: 1px solid var(--el-border-color-lighter);
    box-sizing: border-box;
    color: var(--el-text-color-primary);
    justify-content: space-between;
    height: 35px;
    align-items: center;
    .head-box-actions {
      display: flex;
      align-items: center;
    }
    .head-box-btn {
      color: var(--el-color-primary);
      font-size: 13px;
      cursor: pointer;
      opacity: 0.8;
      &:hover {
        opacity: 1;
      }
    }
  }

  .tab-box {
    display: flex;
    border-bottom: 1px solid var(--el-border-color-lighter);
    .tab-item {
      flex: 1;
      height: 35px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 13px;
      color: var(--el-text-color-regular);
      position: relative;

      &.active {
        color: var(--el-color-primary);
        border-bottom: 2px solid var(--el-color-primary);
      }

      &:hover {
        color: var(--el-color-primary);
      }

      .count-badge {
        background: var(--el-color-danger);
        color: white;
        border-radius: 10px;
        padding: 2px 6px;
        font-size: 10px;
        margin-left: 5px;
        min-width: 16px;
        text-align: center;
      }
    }
  }

  .content-box {
    height: 300px;
    overflow: auto;
    font-size: 13px;
    .content-box-item {
      padding: 12px 8px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1px solid var(--el-border-color-lighter);
      cursor: pointer;

      &:hover {
        background-color: var(--el-fill-color-light);
      }

      &.read-item {
        opacity: 0.8;
      }

      .notification-title {
        font-weight: 500;
        margin-bottom: 4px;
        color: var(--el-text-color-primary);
      }

      .content-box-msg {
        color: var(--el-text-color-secondary);
        margin: 4px 0;
        font-size: 12px;
        line-height: 1.4;
        max-height: 2.8em;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
      }

      .content-box-time {
        color: var(--el-text-color-secondary);
        font-size: 11px;
      }

      .item-conten {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-width: 0;
      }

      .action-buttons {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 4px;
        margin-left: 8px;
      }
    }
  }

  .foot-box {
    height: 35px;
    color: var(--el-color-primary);
    font-size: 13px;
    cursor: pointer;
    opacity: 0.8;
    display: flex;
    align-items: center;
    justify-content: center;
    border-top: 1px solid var(--el-border-color-lighter);
    &:hover {
      opacity: 1;
    }
  }

  :deep(.el-empty__description p) {
    font-size: 13px;
  }
}
</style>
