import { BaseEntity } from '@/api/types';

export interface TaskVO extends BaseEntity {
  taskId: string;
  projectId: string;
  projectName: string;
  parentTaskId: string;
  parentTaskName: string;
  taskName: string;
  taskDescription: string;
  taskType: string;
  priority: string;
  status: string;
  progress: number;
  assigneeId: string;
  assigneeName: string;
  creatorId: string;
  creatorName: string;
  estimatedHours: number;
  actualHours: number;
  startDate: string;
  dueDate: string;
  completedDate: string;
  dependencies: string;
  tags: string;
  attachments: string;
  isMilestone: string;
  userId: string;
  deptId: string;
  subTaskCount: number;
  commentCount: number;
}

export interface TaskForm {
  taskId: string | undefined;
  projectId: string;
  parentTaskId: string;
  taskName: string;
  taskDescription: string;
  taskType: string;
  priority: string;
  status: string;
  progress: number;
  assigneeId: string;
  creatorId: string;
  estimatedHours: number;
  actualHours: number;
  startDate: string;
  dueDate: string;
  completedDate: string;
  dependencies: string;
  tags: string;
  attachments: string;
  isMilestone: string;
  userId: string;
  deptId: string;
}

export interface TaskQuery extends PageQuery {
  projectId: string;
  parentTaskId: string;
  taskName: string;
  taskType: string;
  priority: string;
  status: string;
  assigneeId: string;
  creatorId: string;
  isMilestone: string;
  beginStartDate: string;
  endStartDate: string;
  beginDueDate: string;
  endDueDate: string;
}

// 任务评论相关类型
export interface TaskCommentVO extends BaseEntity {
  commentId: string;
  taskId: string;
  taskName: string;
  userId: string;
  userName: string;
  userAvatar: string;
  parentCommentId: string;
  parentCommentContent: string;
  parentUserName: string;
  commentContent: string;
  commentType: string;
  mentionedUsers: string;
  mentionedUserNames: string[];
  attachments: string;
  attachmentList: any[];
  likeCount: number;
  isPinned: string;
  deptId: string;
  children: TaskCommentVO[];
  isLiked: boolean;
}

export interface TaskCommentForm {
  commentId: string | undefined;
  taskId: string;
  userId: string;
  parentCommentId: string;
  commentContent: string;
  commentType: string;
  mentionedUsers: string;
  attachments: string;
  likeCount: number;
  isPinned: string;
  deptId: string;
}

export interface TaskCommentQuery extends PageQuery {
  taskId: string;
  userId: string;
  parentCommentId: string;
  commentContent: string;
  commentType: string;
  isPinned: string;
}

// 任务统计相关类型
export interface TaskStats {
  todo: number;
  doing: number;
  testing: number;
  done: number;
  cancelled: number;
  total: number;
}

// 看板数据类型
export interface KanbanData {
  todo: TaskVO[];
  doing: TaskVO[];
  testing: TaskVO[];
  done: TaskVO[];
  cancelled: TaskVO[];
}

// 甘特图数据类型
export interface GanttItem {
  id: string | number;
  text: string;
  start_date: string;
  duration: number;
  progress: number;
  parent: string | number;
}

// 任务依赖类型
export interface TaskDependency {
  taskId: string | number;
  dependencyId: string | number;
  dependencyName: string;
  dependencyStatus: string;
}

// 任务附件类型
export interface TaskAttachment {
  id: string | number;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadTime: string;
  uploadUser: string;
}

// 任务标签类型
export interface TaskTag {
  id: string | number;
  name: string;
  color: string;
}

// 任务筛选条件类型
export interface TaskFilter {
  projectId?: string | number;
  status?: string[];
  priority?: string[];
  taskType?: string[];
  assigneeId?: string | number;
  creatorId?: string | number;
  isMilestone?: boolean;
  dueDateRange?: [string, string];
  tags?: string[];
  keyword?: string;
}

// 任务排序类型
export interface TaskSort {
  field: 'createTime' | 'dueDate' | 'priority' | 'progress' | 'status';
  order: 'asc' | 'desc';
}

// 任务操作类型
export type TaskAction = 
  | 'create'
  | 'edit'
  | 'delete'
  | 'assign'
  | 'updateStatus'
  | 'updateProgress'
  | 'addDependency'
  | 'removeDependency'
  | 'copy'
  | 'archive';

// 任务状态选项
export const TASK_STATUS_OPTIONS = [
  { label: '待开始', value: 'todo', color: '#909399' },
  { label: '进行中', value: 'doing', color: '#409EFF' },
  { label: '测试中', value: 'testing', color: '#E6A23C' },
  { label: '已完成', value: 'done', color: '#67C23A' },
  { label: '已取消', value: 'cancelled', color: '#F56C6C' }
];

// 任务优先级选项
export const TASK_PRIORITY_OPTIONS = [
  { label: '低', value: 'low', color: '#909399' },
  { label: '中', value: 'medium', color: '#409EFF' },
  { label: '高', value: 'high', color: '#E6A23C' },
  { label: '紧急', value: 'urgent', color: '#F56C6C' }
];

// 任务类型选项
export const TASK_TYPE_OPTIONS = [
  { label: '功能开发', value: 'feature', icon: 'el-icon-plus' },
  { label: '问题修复', value: 'bug', icon: 'el-icon-warning' },
  { label: '性能优化', value: 'optimization', icon: 'el-icon-lightning' },
  { label: '测试任务', value: 'test', icon: 'el-icon-check' }
];

// 评论类型选项
export const COMMENT_TYPE_OPTIONS = [
  { label: '普通评论', value: 'normal' },
  { label: '状态变更', value: 'status_change' },
  { label: '文件上传', value: 'file_upload' }
];
