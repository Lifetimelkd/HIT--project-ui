export interface NotificationVO extends BaseEntity {
  notificationId: string | number;
  userId: string | number;
  senderId: string | number;
  notificationType: string;
  title: string;
  content: string;
  relatedId: string | number;
  relatedType: string;
  actionUrl: string;
  isRead: string;
  readTime: string;
  priority: string;
  channel: string;
  sendStatus: string;
  sendTime: string;
  senderName: string;
  receiverName: string;
}

export interface NotificationQuery extends PageQuery {
  userId: string | number;
  senderId: string | number;
  notificationType: string;
  title: string;
  relatedId: string | number;
  relatedType: string;
  isRead: string;
  priority: string;
  channel: string;
  sendStatus: string;
  sendTimeStart: string;
  sendTimeEnd: string;
  createTimeStart: string;
  createTimeEnd: string;
}

export interface NotificationForm {
  notificationId: string | number | undefined;
  userId: string | number;
  senderId: string | number;
  notificationType: string;
  title: string;
  content: string;
  relatedId: string | number;
  relatedType: string;
  actionUrl: string;
  priority: string;
  channel: string;
  deptId: string | number;
}

export interface NotificationStats {
  unreadCount: number;
  totalCount: number;
}
