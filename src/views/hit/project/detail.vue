<template>
  <div class="project-detail-container" v-loading="loading">
    <div class="detail-header">
      <div class="header-content">
        <el-button @click="handleBack" class="back-btn">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
      </div>
    </div>

    <div class="detail-content" v-if="project">
      <div class="project-hero">
        <div class="hero-image">
          <img :src="project.coverImage || '/default-project-cover.jpg'" :alt="project.projectName" />
          <div class="hero-overlay">
            <div class="project-badges">
              <el-tag v-if="project.isFeatured === '1'" type="warning" size="large">精选项目</el-tag>
              <el-tag v-if="project.isUrgent === '1'" type="danger" size="large">紧急招募</el-tag>
              <el-tag v-if="project.isCredit === '1'" type="success" size="large">学分认定</el-tag>
            </div>
          </div>
        </div>

        <div class="hero-info">
          <h1 class="project-title">{{ project.projectName }}</h1>
          <p class="project-subtitle">{{ project.projectDescription }}</p>

          <div class="project-meta">
            <div class="meta-group">
              <div class="meta-item">
                <el-icon><User /></el-icon>
                <span>项目负责人：{{ project.creatorName }}</span>
              </div>
              <div class="meta-item">
                <el-icon><Calendar /></el-icon>
                <span>创建时间：{{ formatDate(project.createTime!) }}</span>
              </div>
              <div class="meta-item">
                <el-icon><Flag /></el-icon>
                <span>项目类型：{{ getProjectTypeText(project.projectType!) }}</span>
              </div>
            </div>

            <div class="project-stats">
              <div class="stat-card">
                <div class="stat-number">{{ project.viewCount }}</div>
                <div class="stat-label">浏览量</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">{{ project.likeCount }}</div>
                <div class="stat-label">点赞数</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">{{ project.collectCount }}</div>
                <div class="stat-label">收藏数</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">{{ project.currentMembers }}/{{ project.teamSizeMax }}</div>
                <div class="stat-label">团队成员</div>
              </div>
            </div>
          </div>

          <div class="action-buttons">
            <el-button type="primary" size="large" @click="handleApply" :disabled="project.recruitmentStatus !== 'open'">
              <el-icon><Plus /></el-icon>
              申请加入
            </el-button>
            <el-button size="large" :type="project.userLiked ? 'primary' : 'default'" @click="handleLike">
              <el-icon><Star /></el-icon>
              {{ project.userLiked ? '已点赞' : '点赞' }}
            </el-button>
            <el-button size="large" :type="project.userCollected ? 'warning' : 'default'" @click="handleCollect">
              <el-icon><Collection /></el-icon>
              {{ project.userCollected ? '已收藏' : '收藏' }}
            </el-button>
          </div>
        </div>
      </div>

      <div class="detail-body">
        <el-row :gutter="30">
          <el-col :span="16">
            <div class="main-content">
              <!-- 项目详情 -->
              <el-card class="info-card">
                <template #header>
                  <h3>
                    <el-icon><Document /></el-icon> 项目详情
                  </h3>
                </template>
                <div class="project-detail-content">
                  <div class="detail-section" v-if="project.projectBackground">
                    <h4>项目背景</h4>
                    <p>{{ project.projectBackground }}</p>
                  </div>
                  <div class="detail-section" v-if="project.projectGoals">
                    <h4>项目目标</h4>
                    <p>{{ project.projectGoals }}</p>
                  </div>
                  <div class="detail-section" v-if="project.expectedOutcome">
                    <h4>预期成果</h4>
                    <p>{{ project.expectedOutcome }}</p>
                  </div>
                </div>
              </el-card>

              <!-- 项目成员 -->
              <el-card class="info-card">
                <template #header>
                  <div class="card-header">
                    <h3>
                      <el-icon><UserFilled /></el-icon> 项目成员
                    </h3>
                    <el-button size="small" @click="handleViewAllMembers">查看全部</el-button>
                  </div>
                </template>
                <div class="members-content" v-loading="membersLoading">
                  <div v-if="memberList.length === 0 && !membersLoading" class="empty-members">
                    <el-empty description="暂无成员" :image-size="60" />
                  </div>
                  <div v-else class="member-list">
                    <div class="member-item" v-for="member in memberList" :key="member.memberId">
                      <el-avatar 
                        :src="member.avatarUrl" 
                        :size="50"
                        @click="handleViewUserProfile(member.userId || member.memberId)"
                        style="cursor: pointer"
                      >
                        {{ member.userName?.charAt(0) || '?' }}
                      </el-avatar>
                      <div class="member-info">
                        <div class="member-name">
                          {{ member.userName }}
                          <el-tag v-if="member.isLeader" type="warning" size="small">组长</el-tag>
                        </div>
                        <div class="member-role">{{ member.memberRole }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </el-card>
            </div>
          </el-col>

          <el-col :span="8">
            <div class="sidebar-content">
              <!-- 项目信息 -->
              <el-card class="info-card">
                <template #header>
                  <h3>
                    <el-icon><InfoFilled /></el-icon> 项目信息
                  </h3>
                </template>
                <div class="project-info-list">
                  <div class="info-item">
                    <span class="info-label">招募状态</span>
                    <el-tag :type="getStatusType(project.recruitmentStatus!)">
                      {{ getStatusText(project.recruitmentStatus!) }}
                    </el-tag>
                  </div>
                  <div class="info-item">
                    <span class="info-label">难度等级</span>
                    <el-tag :type="getDifficultyType(project.difficultyLevel!)">
                      {{ getDifficultyText(project.difficultyLevel!) }}
                    </el-tag>
                  </div>
                  <div class="info-item">
                    <span class="info-label">项目周期</span>
                    <span class="info-value">{{ getDurationText(project.durationType!) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">团队规模</span>
                    <span class="info-value">{{ project.teamSizeMin }}-{{ project.teamSizeMax }}人</span>
                  </div>
                  <div class="info-item" v-if="project.startDate">
                    <span class="info-label">开始日期</span>
                    <span class="info-value">{{ formatDate(project.startDate) }}</span>
                  </div>
                  <div class="info-item" v-if="project.endDate">
                    <span class="info-label">结束日期</span>
                    <span class="info-value">{{ formatDate(project.endDate) }}</span>
                  </div>
                </div>
              </el-card>

              <!-- 申请统计 -->
              <el-card class="info-card">
                <template #header>
                  <h3>
                    <el-icon><DataAnalysis /></el-icon> 申请统计
                  </h3>
                </template>
                <div class="application-stats">
                  <div class="stat-item">
                    <div class="stat-icon">
                      <el-icon><Document /></el-icon>
                    </div>
                    <div class="stat-info">
                      <div class="stat-number">{{ project.applyCount || 0 }}</div>
                      <div class="stat-label">申请人数</div>
                    </div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-icon">
                      <el-icon><Clock /></el-icon>
                    </div>
                    <div class="stat-info">
                      <div class="stat-number">{{ pendingApplications }}</div>
                      <div class="stat-label">待审核</div>
                    </div>
                  </div>
                </div>
              </el-card>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import {
  getProject,
  getPublicProject,
  likeProject,
  unlikeProject,
  collectProject,
  uncollectProject,
  checkUserLiked,
  checkUserCollected,
  ProjectInfo,
  getProjectMemberList,
  getPendingApplicationsCount,
  MemberInfo
} from '@/api/hit/project';

// 删除本地MemberInfo接口定义，使用从API导入的接口
// interface MemberInfo {
//   memberId: number;
//   userName: string;
//   avatarUrl?: string;
//   memberRole: string;
//   isLeader: string;
//   contributionScore?: number;
//   completedTasks?: number;
//   totalTasks?: number;
// }

const router = useRouter();
const route = useRoute();

const loading = ref(false);
const membersLoading = ref(false);
const project = ref<ProjectInfo | null>(null);
const memberList = ref<MemberInfo[]>([]);
const pendingApplications = ref(0);

// 获取项目详情
const getProjectDetail = async () => {
  loading.value = true;
  try {
    const projectId = route.params.id as string; // 直接使用string类型，不转换为Number
    let response;

    try {
      // 先尝试有权限的接口（用于自己创建的项目或有权限的项目）
      response = await getProject(projectId);
      project.value = response.data;
    } catch (error) {
      // 如果有权限接口失败，尝试公开接口
      console.warn('尝试有权限接口失败，切换到公开接口:', error);
      response = await getPublicProject(projectId);
      project.value = response.data;
    }

    // 检查用户交互状态
    await checkUserInteractions();

    // 获取项目成员
    await getProjectMembers();
  } catch (error) {
    console.error('获取项目详情失败:', error);
    ElMessage.error('获取项目详情失败');
  } finally {
    loading.value = false;
  }
};

// 检查用户交互状态
const checkUserInteractions = async () => {
  if (!project.value) return;

  // 启用用户交互状态检查
  try {
    console.log('检查用户交互状态，项目ID:', project.value.projectId);

    const [likedRes, collectedRes] = await Promise.all([
      checkUserLiked(project.value.projectId!).catch((err) => {
        console.warn('检查点赞状态失败:', err);
        return { data: false };
      }),
      checkUserCollected(project.value.projectId!).catch((err) => {
        console.warn('检查收藏状态失败:', err);
        return { data: false };
      })
    ]);

    console.log('点赞状态检查结果:', likedRes);
    console.log('收藏状态检查结果:', collectedRes);

    // 确保正确解析API响应中的data字段
    project.value.userLiked = likedRes?.data === true;
    project.value.userCollected = collectedRes?.data === true;

    console.log('设置后的用户交互状态:', {
      userLiked: project.value.userLiked,
      userCollected: project.value.userCollected
    });
  } catch (error) {
    // 忽略错误，可能是未登录或权限问题
    console.warn('检查用户交互状态失败:', error);
    project.value.userLiked = false;
    project.value.userCollected = false;
  }
};

// 获取项目成员（替换模拟数据为真实API调用）
const getProjectMembers = async () => {
  if (!project.value?.projectId) return;

  membersLoading.value = true;
  try {
    // 使用真实API调用替换模拟数据
    const [membersResponse, pendingCountResponse] = await Promise.all([
      getProjectMemberList(project.value.projectId, 1, 6), // 只显示前6个成员作为预览
      getPendingApplicationsCount(project.value.projectId).catch(() => ({ data: 0 })) // 如果获取失败就设为0
    ]);

    console.log('成员列表响应:', membersResponse); // 调试日志

    // 处理后端返回的数据结构
    const responseData = membersResponse as any;
    let rawMembers = [];

    // 尝试不同的数据结构路径
    if (responseData.rows) {
      rawMembers = responseData.rows;
    } else if (responseData.data && Array.isArray(responseData.data)) {
      rawMembers = responseData.data;
    } else if (responseData.data && responseData.data.rows) {
      rawMembers = responseData.data.rows;
    } else if (Array.isArray(responseData)) {
      rawMembers = responseData;
    }

    // 映射成员数据，确保字段正确
    memberList.value = rawMembers.map((member: any) => ({
      memberId: member.memberId,
      userId: member.userId || member.memberId, // 添加userId字段
      userName: member.userName || member.memberName || member.realName || '未知用户',
      email: member.email || member.contactInfo || '',
      avatarUrl: member.avatarUrl || member.avatar,
      memberRole: member.memberRole || member.role || '',
      role: member.memberRole || member.role || '',
      department: member.department || member.college || member.major || '',
      skills: member.skills || member.major || '',
      joinTime: member.joinTime || '',
      status: member.status || member.memberStatus || 'active',
      isLeader: member.isLeader === '1' || member.isLeader === true, // 确保转换为布尔值
      contributionScore: member.contributionScore || 0,
      completedTasks: member.completedTasks || 0,
      totalTasks: member.totalTasks || 0
    }));

    pendingApplications.value = pendingCountResponse.data || 0;

    console.log('处理后的成员列表:', memberList.value); // 调试日志
  } catch (error) {
    console.error('获取项目成员失败:', error);
    // 不显示错误消息，避免影响用户体验
    // ElMessage.error('获取项目成员失败');
    // 发生错误时保留空数组，避免页面崩溃
    memberList.value = [];
    pendingApplications.value = 0;
  } finally {
    membersLoading.value = false;
  }
};

// 返回
const handleBack = () => {
  router.back();
};

// 申请加入
const handleApply = () => {
  router.push(`/hit/project/apply/${project.value?.projectId}`);
};

// 点赞
const handleLike = async () => {
  if (!project.value) return;

  try {
    console.log('点赞操作，当前状态:', project.value.userLiked);

    if (!project.value.userLiked) {
      const response = await likeProject(project.value.projectId!);
      console.log('点赞API响应:', response);

      // 操作成功后立即更新状态
      project.value.likeCount = (project.value.likeCount || 0) + 1;
      project.value.userLiked = true;
      ElMessage.success('点赞成功');

      console.log('点赞成功，新状态:', {
        likeCount: project.value.likeCount,
        userLiked: project.value.userLiked
      });
    } else {
      // 实现取消点赞功能
      try {
        const response = await unlikeProject(project.value.projectId!);
        console.log('取消点赞API响应:', response);

        project.value.likeCount = Math.max((project.value.likeCount || 0) - 1, 0);
        project.value.userLiked = false;
        ElMessage.success('取消点赞');

        console.log('取消点赞成功，新状态:', {
          likeCount: project.value.likeCount,
          userLiked: project.value.userLiked
        });
      } catch (error) {
        console.warn('取消点赞失败，可能接口未实现:', error);
        ElMessage.info('取消点赞功能暂未实现');
      }
    }
  } catch (error) {
    console.error('点赞操作失败:', error);
    const errorMsg = error instanceof Error ? error.message : '未知错误';
    ElMessage.error(`点赞失败: ${errorMsg}`);
  }
};

// 收藏
const handleCollect = async () => {
  if (!project.value) return;

  try {
    console.log('收藏操作，当前状态:', project.value.userCollected);

    if (!project.value.userCollected) {
      const response = await collectProject(project.value.projectId!);
      console.log('收藏API响应:', response);

      // 操作成功后立即更新状态
      project.value.collectCount = (project.value.collectCount || 0) + 1;
      project.value.userCollected = true;
      ElMessage.success('收藏成功');

      console.log('收藏成功，新状态:', {
        collectCount: project.value.collectCount,
        userCollected: project.value.userCollected
      });
    } else {
      // 实现取消收藏功能
      try {
        const response = await uncollectProject(project.value.projectId!);
        console.log('取消收藏API响应:', response);

        project.value.collectCount = Math.max((project.value.collectCount || 0) - 1, 0);
        project.value.userCollected = false;
        ElMessage.success('取消收藏');

        console.log('取消收藏成功，新状态:', {
          collectCount: project.value.collectCount,
          userCollected: project.value.userCollected
        });
      } catch (error) {
        console.warn('取消收藏失败，可能接口未实现:', error);
        ElMessage.info('取消收藏功能暂未实现');
      }
    }
  } catch (error) {
    console.error('收藏操作失败:', error);
    const errorMsg = error instanceof Error ? error.message : '未知错误';
    ElMessage.error(`收藏失败: ${errorMsg}`);
  }
};

// 查看全部成员
const handleViewAllMembers = () => {
  router.push(`/hit/project/members/${project.value?.projectId}`);
};

// 查看用户个人资料
const handleViewUserProfile = (userId: string) => {
  router.push(`/profile/profileShowcase/${userId}`);
};

// 工具函数
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString();
};

const getProjectTypeText = (type: string) => {
  const texts: Record<string, string> = {
    academic: '学术研究',
    competition: '竞赛项目',
    practice: '实践项目',
    graduation: '毕业设计',
    course: '课程项目'
  };
  return texts[type] || type;
};

const getDifficultyType = (level: number): 'success' | 'info' | 'warning' | 'danger' | undefined => {
  const types: ('success' | 'info' | 'warning' | 'danger')[] = ['success', 'info', 'warning', 'danger'];
  return types[level - 1];
};

const getDifficultyText = (level: number) => {
  const texts = ['', '入门', '进阶', '专业', '挑战'];
  return texts[level] || '';
};

const getStatusType = (status: string): 'success' | 'warning' | 'danger' | undefined => {
  const types: Record<string, 'success' | 'warning' | 'danger'> = {
    open: 'success',
    paused: 'warning',
    closed: 'danger'
  };
  return types[status];
};

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    open: '招募中',
    paused: '暂停招募',
    closed: '招募结束'
  };
  return texts[status] || status;
};

const getDurationText = (duration: string) => {
  const texts: Record<string, string> = {
    short: '短期（1-3个月）',
    medium: '中期（3-6个月）',
    long: '长期（6个月以上）'
  };
  return texts[duration] || duration;
};

// 生命周期
onMounted(() => {
  getProjectDetail();
});
</script>

<style scoped lang="scss">
.project-detail-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.detail-header {
  background: white;
  border-bottom: 1px solid #e4e7ed;
  padding: 20px 0;

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .back-btn {
    border-radius: 20px;
  }
}

.detail-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
}

.project-hero {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

  .hero-image {
    position: relative;
    height: 300px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .hero-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.7));
      display: flex;
      align-items: flex-start;
      justify-content: flex-end;
      padding: 20px;

      .project-badges {
        display: flex;
        gap: 10px;
      }
    }
  }

  .hero-info {
    padding: 40px;

    .project-title {
      font-size: 2.5rem;
      font-weight: bold;
      color: #2c3e50;
      margin: 0 0 15px 0;
    }

    .project-subtitle {
      font-size: 1.2rem;
      color: #666;
      line-height: 1.6;
      margin: 0 0 30px 0;
    }

    .project-meta {
      margin-bottom: 30px;

      .meta-group {
        display: flex;
        gap: 30px;
        margin-bottom: 20px;

        .meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #666;
          font-size: 1rem;

          .el-icon {
            font-size: 18px;
            color: #409eff;
          }
        }
      }

      .project-stats {
        display: flex;
        gap: 30px;

        .stat-card {
          text-align: center;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 10px;
          min-width: 80px;

          .stat-number {
            font-size: 1.5rem;
            font-weight: bold;
            color: #409eff;
            margin-bottom: 5px;
          }

          .stat-label {
            color: #666;
            font-size: 0.9rem;
          }
        }
      }
    }

    .action-buttons {
      display: flex;
      gap: 15px;

      .el-button {
        padding: 12px 30px;
        border-radius: 25px;
        font-size: 1rem;
      }
    }
  }
}

.detail-body {
  .info-card {
    margin-bottom: 30px;
    border-radius: 15px;
    border: none;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);

    :deep(.el-card__header) {
      border-bottom: 2px solid #f0f2f5;
      padding: 20px 25px;

      h3 {
        margin: 0;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 1.2rem;
        color: #2c3e50;

        .el-icon {
          color: #409eff;
        }
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }

    :deep(.el-card__body) {
      padding: 25px;
    }
  }
}

.project-detail-content {
  .detail-section {
    margin-bottom: 25px;

    h4 {
      color: #2c3e50;
      margin: 0 0 10px 0;
      font-size: 1.1rem;
      font-weight: 600;
    }

    p {
      color: #666;
      line-height: 1.8;
      margin: 0;
    }
  }
}

.members-content {
  .empty-members {
    padding: 40px 20px;
    text-align: center;
    color: #999;
  }

  .member-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;

    .member-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 10px;
      transition: all 0.3s ease;

      &:hover {
        background: #e9ecef;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .member-info {
        flex: 1;
        min-width: 0; // 防止文字溢出

        .member-name {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 4px;
          font-size: 0.95rem;

          // 文字溢出处理
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .member-role {
          color: #666;
          font-size: 0.85rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }

      .el-avatar {
        flex-shrink: 0; // 防止头像被压缩
      }
    }
  }
}

.project-info-list {
  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 0;
    border-bottom: 1px solid #f0f2f5;

    &:last-child {
      border-bottom: none;
    }

    .info-label {
      color: #666;
      font-weight: 500;
    }

    .info-value {
      color: #2c3e50;
      font-weight: 600;
    }
  }
}

.application-stats {
  .stat-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 20px 0;
    border-bottom: 1px solid #f0f2f5;

    &:last-child {
      border-bottom: none;
    }

    .stat-icon {
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, #409eff, #67c23a);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 20px;
    }

    .stat-info {
      flex: 1;

      .stat-number {
        font-size: 1.5rem;
        font-weight: bold;
        color: #2c3e50;
        margin-bottom: 5px;
      }

      .stat-label {
        color: #666;
        font-size: 0.9rem;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .project-hero .hero-info {
    padding: 20px;

    .project-title {
      font-size: 1.8rem;
    }

    .project-meta .meta-group {
      flex-direction: column;
      gap: 15px;
    }

    .project-stats {
      justify-content: space-between;
    }

    .action-buttons {
      flex-direction: column;
    }
  }

  .detail-body .el-col {
    span: 24 !important;
  }

  // 移动端成员列表样式
  .members-content .member-list {
    grid-template-columns: 1fr; // 移动端单列显示
    gap: 10px;

    .member-item {
      padding: 10px;

      .member-info {
        .member-name {
          font-size: 0.9rem;
        }

        .member-role {
          font-size: 0.8rem;
        }
      }
    }
  }
}
</style>
