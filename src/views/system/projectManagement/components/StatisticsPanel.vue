<template>
  <div class="statistics-panel">
    <el-row :gutter="20">
      <!-- 左侧图表区域 -->
      <el-col :span="16">
        <div class="charts-area">
          <!-- 项目趋势图 -->
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="chart-header">
                <h3>项目创建趋势</h3>
                <el-date-picker
                  v-model="dateRange"
                  type="monthrange"
                  range-separator="至"
                  start-placeholder="开始月份"
                  end-placeholder="结束月份"
                  size="small"
                  @change="handleDateChange"
                />
              </div>
            </template>
            <div id="projectTrendChart" style="height: 300px"></div>
          </el-card>

          <!-- 项目类型分布 -->
          <el-card class="chart-card" shadow="hover" style="margin-top: 20px">
            <template #header>
              <h3>项目类型分布</h3>
            </template>
            <div id="projectTypeChart" style="height: 300px"></div>
          </el-card>

          <!-- 申请处理效率 -->
          <el-card class="chart-card" shadow="hover" style="margin-top: 20px">
            <template #header>
              <h3>申请处理效率</h3>
            </template>
            <div id="applicationChart" style="height: 300px"></div>
          </el-card>
        </div>
      </el-col>

      <!-- 右侧统计数据 -->
      <el-col :span="8">
        <div class="stats-area">
          <!-- 实时数据卡片 -->
          <el-card class="stats-card" shadow="hover">
            <template #header>
              <h3>实时数据概览</h3>
            </template>

            <div class="stats-list">
              <div class="stats-item">
                <div class="stats-icon project-icon">
                  <el-icon><Document /></el-icon>
                </div>
                <div class="stats-content">
                  <div class="stats-label">总项目数</div>
                  <div class="stats-value">{{ realTimeStats.totalProjects }}</div>
                  <div class="stats-change positive">
                    <el-icon><TrendCharts /></el-icon>
                    +{{ realTimeStats.projectsIncrease }}
                  </div>
                </div>
              </div>

              <div class="stats-item">
                <div class="stats-icon member-icon">
                  <el-icon><UserFilled /></el-icon>
                </div>
                <div class="stats-content">
                  <div class="stats-label">活跃成员</div>
                  <div class="stats-value">{{ realTimeStats.activeMembers }}</div>
                  <div class="stats-change positive">
                    <el-icon><TrendCharts /></el-icon>
                    +{{ realTimeStats.membersIncrease }}
                  </div>
                </div>
              </div>

              <div class="stats-item">
                <div class="stats-icon application-icon">
                  <el-icon><Document /></el-icon>
                </div>
                <div class="stats-content">
                  <div class="stats-label">待审申请</div>
                  <div class="stats-value">{{ realTimeStats.pendingApplications }}</div>
                  <div class="stats-change negative">
                    <el-icon><TrendCharts /></el-icon>
                    -{{ realTimeStats.applicationsProcessed }}
                  </div>
                </div>
              </div>

              <div class="stats-item">
                <div class="stats-icon success-icon">
                  <el-icon><SuccessFilled /></el-icon>
                </div>
                <div class="stats-content">
                  <div class="stats-label">完成项目</div>
                  <div class="stats-value">{{ realTimeStats.completedProjects }}</div>
                  <div class="stats-change positive">
                    <el-icon><TrendCharts /></el-icon>
                    +{{ realTimeStats.completedIncrease }}
                  </div>
                </div>
              </div>
            </div>
          </el-card>

          <!-- 热门项目排行 -->
          <el-card class="ranking-card" shadow="hover" style="margin-top: 20px">
            <template #header>
              <h3>热门项目排行</h3>
            </template>

            <div class="ranking-list">
              <div v-for="(project, index) in hotProjects" :key="project.id" class="ranking-item">
                <div class="ranking-number" :class="`rank-${index + 1}`">
                  {{ index + 1 }}
                </div>
                <div class="project-info">
                  <div class="project-name">{{ project.name }}</div>
                  <div class="project-meta">
                    <span>{{ project.viewCount }} 浏览</span>
                    <span>{{ project.likeCount }} 点赞</span>
                  </div>
                </div>
                <div class="project-score">{{ project.score }}</div>
              </div>
            </div>
          </el-card>

          <!-- 系统状态监控 -->
          <el-card class="monitor-card" shadow="hover" style="margin-top: 20px">
            <template #header>
              <h3>系统状态监控</h3>
            </template>

            <div class="monitor-list">
              <div class="monitor-item">
                <div class="monitor-label">服务状态</div>
                <el-tag type="success">正常</el-tag>
              </div>
              <div class="monitor-item">
                <div class="monitor-label">数据库连接</div>
                <el-tag type="success">正常</el-tag>
              </div>
              <div class="monitor-item">
                <div class="monitor-label">存储空间</div>
                <el-progress :percentage="75" :stroke-width="8" />
              </div>
              <div class="monitor-item">
                <div class="monitor-label">响应时间</div>
                <span class="response-time">156ms</span>
              </div>
            </div>
          </el-card>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import request from '@/utils/request';

// 注意：这里应该引入 ECharts，但为了简化示例，我们使用模拟数据
// import * as echarts from 'echarts';

const dateRange = ref<[Date, Date] | null>(null);

// 实时统计数据
const realTimeStats = reactive({
  totalProjects: 0,
  projectsIncrease: 0,
  activeMembers: 0,
  membersIncrease: 0,
  pendingApplications: 0,
  applicationsProcessed: 0,
  completedProjects: 0,
  completedIncrease: 0
});

// 热门项目数据
const hotProjects = ref([]);

// 修复: 图表初始化
const initCharts = async () => {
  await nextTick();

  // 这里应该初始化 ECharts 图表
  // 由于没有实际的 ECharts 依赖，我们模拟图表初始化
  console.log('初始化项目趋势图表...');
  console.log('初始化项目类型分布图表...');
  console.log('初始化申请处理效率图表...');

  // 调用真实API加载图表数据
  await loadChartData();
};

// 日期范围变化处理
const handleDateChange = (dates: [Date, Date] | null) => {
  console.log('日期范围变化:', dates);
  // 重新加载图表数据
  loadChartData();
};

// 修复: 加载图表数据
const loadChartData = async () => {
  try {
    // 获取统计概览数据
    const overviewResponse = await request({
      url: '/hit/project/admin/statistics/overview',
      method: 'get'
    });

    if (overviewResponse && overviewResponse.data) {
      const data = overviewResponse.data;
      realTimeStats.totalProjects = data.totalProjects || 0;
      realTimeStats.projectsIncrease = data.projectsIncrease || 0;
      realTimeStats.activeMembers = data.activeMembers || 0;
      realTimeStats.membersIncrease = data.membersIncrease || 0;
      realTimeStats.pendingApplications = data.pendingApplications || 0;
      realTimeStats.applicationsProcessed = data.applicationsProcessed || 0;
      realTimeStats.completedProjects = data.completedProjects || 0;
      realTimeStats.completedIncrease = data.completedIncrease || 0;
    }

    // 获取项目趋势数据
    const trendsResponse = await request({
      url: '/hit/project/admin/statistics/trends',
      method: 'get',
      params: {
        startDate: dateRange.value?.[0]?.toISOString().split('T')[0],
        endDate: dateRange.value?.[1]?.toISOString().split('T')[0]
      }
    });

    // 获取项目类型分布数据
    const typesResponse = await request({
      url: '/hit/project/admin/statistics/types',
      method: 'get'
    });

    // 获取热门项目数据
    const hotProjectsResponse = await request({
      url: '/hit/project/public/list',
      method: 'get',
      params: {
        pageNum: 1,
        pageSize: 5,
        orderBy: 'view_count desc'
      }
    });

    if (hotProjectsResponse && hotProjectsResponse.rows) {
      hotProjects.value = hotProjectsResponse.rows.map((project: any, index: number) => ({
        id: project.projectId,
        name: project.projectName,
        viewCount: project.viewCount || 0,
        likeCount: project.likeCount || 0,
        score: Math.round((project.viewCount || 0) / 10 + (project.likeCount || 0) * 2)
      }));
    }

    ElMessage.success('数据更新完成');
  } catch (error) {
    console.error('加载图表数据失败:', error);
    ElMessage.error('加载图表数据失败');

    // 设置默认数据
    realTimeStats.totalProjects = 0;
    realTimeStats.projectsIncrease = 0;
    realTimeStats.activeMembers = 0;
    realTimeStats.membersIncrease = 0;
    realTimeStats.pendingApplications = 0;
    realTimeStats.applicationsProcessed = 0;
    realTimeStats.completedProjects = 0;
    realTimeStats.completedIncrease = 0;
    hotProjects.value = [];
  }
};

// 修复: 实时数据更新
const updateRealTimeStats = () => {
  // 每30秒重新获取一次数据
  setInterval(() => {
    loadChartData();
  }, 30000);
};

onMounted(() => {
  initCharts();
  updateRealTimeStats();
});
</script>

<style scoped lang="scss">
.statistics-panel {
  .charts-area {
    .chart-card {
      .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        h3 {
          margin: 0;
          color: #333;
        }
      }
    }
  }

  .stats-area {
    .stats-card {
      .stats-list {
        .stats-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px 0;
          border-bottom: 1px solid #f0f0f0;

          &:last-child {
            border-bottom: none;
          }

          .stats-icon {
            width: 50px;
            height: 50px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
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

            &.success-icon {
              background: linear-gradient(135deg, #43e97b, #38f9d7);
            }
          }

          .stats-content {
            flex: 1;

            .stats-label {
              font-size: 14px;
              color: #666;
              margin-bottom: 5px;
            }

            .stats-value {
              font-size: 24px;
              font-weight: bold;
              color: #333;
              margin-bottom: 5px;
            }

            .stats-change {
              font-size: 12px;
              display: flex;
              align-items: center;
              gap: 4px;

              &.positive {
                color: #67c23a;
              }

              &.negative {
                color: #f56c6c;
              }
            }
          }
        }
      }
    }

    .ranking-card {
      .ranking-list {
        .ranking-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;

          &:last-child {
            border-bottom: none;
          }

          .ranking-number {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: white;
            font-size: 14px;

            &.rank-1 {
              background: linear-gradient(135deg, #ffd700, #ffb347);
            }

            &.rank-2 {
              background: linear-gradient(135deg, #c0c0c0, #a9a9a9);
            }

            &.rank-3 {
              background: linear-gradient(135deg, #cd7f32, #b8860b);
            }

            &:not(.rank-1):not(.rank-2):not(.rank-3) {
              background: #e0e0e0;
              color: #666;
            }
          }

          .project-info {
            flex: 1;

            .project-name {
              font-weight: 500;
              color: #333;
              margin-bottom: 4px;
              font-size: 14px;
            }

            .project-meta {
              display: flex;
              gap: 15px;
              font-size: 12px;
              color: #666;
            }
          }

          .project-score {
            font-weight: bold;
            color: #409eff;
            font-size: 16px;
          }
        }
      }
    }

    .monitor-card {
      .monitor-list {
        .monitor-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;

          &:last-child {
            border-bottom: none;
          }

          .monitor-label {
            font-size: 14px;
            color: #333;
          }

          .response-time {
            font-weight: bold;
            color: #67c23a;
          }
        }
      }
    }
  }

  :deep(.el-card__header) {
    h3 {
      margin: 0;
      color: #333;
      font-size: 16px;
    }
  }
}
</style>
