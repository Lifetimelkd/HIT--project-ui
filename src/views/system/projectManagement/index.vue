<template>
  <div class="project-management-admin">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <el-icon><Setting /></el-icon>
          项目管理后台
        </h1>
        <p class="page-subtitle">系统管理员项目管理控制台</p>
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-cards">
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon project-icon">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ projectStats.total }}</div>
              <div class="stat-label">总项目数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon member-icon">
              <el-icon><UserFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ memberStats.total }}</div>
              <div class="stat-label">总成员数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon application-icon">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ applicationStats.total }}</div>
              <div class="stat-label">总申请数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon pending-icon">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ applicationStats.pending }}</div>
              <div class="stat-label">待审核申请</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 主要内容区域 -->
    <el-card class="main-content" shadow="never">
      <el-tabs v-model="activeTab" class="admin-tabs">
        <!-- 项目管理 -->
        <el-tab-pane label="项目管理" name="projects">
          <ProjectAdminTable />
        </el-tab-pane>

        <!-- 成员管理 -->
        <el-tab-pane label="成员管理" name="members">
          <MemberAdminTable />
        </el-tab-pane>

        <!-- 申请管理 -->
        <el-tab-pane label="申请管理" name="applications">
          <ApplicationAdminTable />
        </el-tab-pane>

        <!-- 数据统计 -->
        <el-tab-pane label="数据统计" name="statistics">
          <StatisticsPanel />
        </el-tab-pane>

        <!-- 系统配置 -->
        <el-tab-pane label="系统配置" name="settings">
          <SystemSettings />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import request from '@/utils/request';
import ProjectAdminTable from './components/ProjectAdminTable.vue';
import MemberAdminTable from './components/MemberAdminTable.vue';
import ApplicationAdminTable from './components/ApplicationAdminTable.vue';
import StatisticsPanel from './components/StatisticsPanel.vue';
import SystemSettings from './components/SystemSettings.vue';

defineOptions({
  name: 'ProjectManagementAdmin'
});

const activeTab = ref('projects');

// 统计数据
const projectStats = reactive({
  total: 0,
  active: 0,
  completed: 0,
  featured: 0
});

const memberStats = reactive({
  total: 0,
  active: 0,
  leaders: 0
});

const applicationStats = reactive({
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0
});

// 修复: 加载统计数据
const loadStatistics = async () => {
  try {
    // 调用后端API获取统计数据
    const response = await request({
      url: '/hit/project/admin/statistics/overview',
      method: 'get'
    });

    if (response && response.data) {
      const data = response.data;

      // 更新项目统计
      projectStats.total = data.totalProjects || 0;
      projectStats.active = data.activeProjects || 0;
      projectStats.completed = data.completedProjects || 0;
      projectStats.featured = data.featuredProjects || 0;

      // 更新成员统计
      memberStats.total = data.totalMembers || 0;
      memberStats.active = data.activeMembers || 0;
      memberStats.leaders = data.totalLeaders || 0;

      // 更新申请统计
      applicationStats.total = data.totalApplications || 0;
      applicationStats.pending = data.pendingApplications || 0;
      applicationStats.approved = data.approvedApplications || 0;
      applicationStats.rejected = data.rejectedApplications || 0;
    }
  } catch (error) {
    console.error('加载统计数据失败:', error);
    ElMessage.error('加载统计数据失败');

    // 如果API调用失败，显示默认数据避免界面报错
    projectStats.total = 0;
    projectStats.active = 0;
    projectStats.completed = 0;
    projectStats.featured = 0;

    memberStats.total = 0;
    memberStats.active = 0;
    memberStats.leaders = 0;

    applicationStats.total = 0;
    applicationStats.pending = 0;
    applicationStats.approved = 0;
    applicationStats.rejected = 0;
  }
};

onMounted(() => {
  loadStatistics();
});
</script>

<style scoped lang="scss">
.project-management-admin {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 84px);

  .page-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    padding: 30px;
    margin-bottom: 20px;
    color: white;

    .header-content {
      text-align: center;

      .page-title {
        font-size: 2rem;
        font-weight: bold;
        margin: 0 0 10px 0;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
      }

      .page-subtitle {
        font-size: 1.1rem;
        margin: 0;
        opacity: 0.9;
      }
    }
  }

  .stats-cards {
    margin-bottom: 20px;

    .stat-card {
      .stat-content {
        display: flex;
        align-items: center;
        gap: 15px;

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: white;

          &.project-icon {
            background: linear-gradient(135deg, #667eea, #764ba2);
          }

          &.member-icon {
            background: linear-gradient(135deg, #f093fb, #f5576c);
          }

          &.application-icon {
            background: linear-gradient(135deg, #4facfe, #00f2fe);
          }

          &.pending-icon {
            background: linear-gradient(135deg, #43e97b, #38f9d7);
          }
        }

        .stat-info {
          flex: 1;

          .stat-number {
            font-size: 2rem;
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
  }

  .main-content {
    border-radius: 12px;

    :deep(.el-card__body) {
      padding: 0;
    }

    .admin-tabs {
      :deep(.el-tabs__header) {
        background: #fafafa;
        margin: 0;
        padding: 0 20px;
      }

      :deep(.el-tabs__content) {
        padding: 20px;
      }

      :deep(.el-tabs__item) {
        font-size: 16px;
        font-weight: 500;
        height: 50px;
        line-height: 50px;
      }
    }
  }
}
</style>
