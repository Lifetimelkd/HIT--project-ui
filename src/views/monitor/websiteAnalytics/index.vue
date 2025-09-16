<template>
  <div class="website-analytics-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-title">
        <h2>网站数据分析</h2>
        <p class="subtitle">实时监控网站运营数据，洞察业务发展趋势</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="refreshData" :loading="loading">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
      </div>
    </div>

    <!-- 概览卡片 -->
    <div class="overview-cards">
      <div class="card-row">
        <!-- 用户统计卡片 -->
        <div class="stat-card user-card">
          <div class="card-icon">
            <el-icon size="32"><User /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-title">总注册用户</div>
            <div class="card-value">{{ formatNumber(overview.userStats?.totalUsers || 0) }}</div>
            <div class="card-trend" :class="getTrendClass(overview.userStats?.dailyGrowthRate)">
              <el-icon><TrendCharts /></el-icon>
              今日增长 {{ formatPercent(overview.userStats?.dailyGrowthRate || 0) }}
            </div>
          </div>
        </div>

        <!-- 项目统计卡片 -->
        <div class="stat-card project-card">
          <div class="card-icon">
            <el-icon size="32"><Folder /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-title">项目总数</div>
            <div class="card-value">{{ formatNumber(overview.projectStats?.totalProjects || 0) }}</div>
            <div class="card-trend" :class="getTrendClass(overview.projectStats?.dailyGrowthRate)">
              <el-icon><TrendCharts /></el-icon>
              今日增长 {{ formatPercent(overview.projectStats?.dailyGrowthRate || 0) }}
            </div>
          </div>
        </div>

        <!-- 在线用户卡片 -->
        <div class="stat-card online-card">
          <div class="card-icon">
            <el-icon size="32"><Connection /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-title">当前在线</div>
            <div class="card-value">{{ formatNumber(overview.onlineStats?.currentOnlineUsers || 0) }}</div>
            <div class="card-trend positive">
              <el-icon><View /></el-icon>
              今日最高 {{ formatNumber(overview.onlineStats?.todayMaxOnlineUsers || 0) }}
            </div>
          </div>
        </div>

        <!-- 活跃项目卡片 -->
        <div class="stat-card active-card">
          <div class="card-icon">
            <el-icon size="32"><PieChart /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-title">活跃项目</div>
            <div class="card-value">{{ formatNumber(overview.projectStats?.activeProjects || 0) }}</div>
            <div class="card-trend neutral">
              <el-icon><Document /></el-icon>
              已完成 {{ formatNumber(overview.projectStats?.completedProjects || 0) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <div class="chart-row">
        <!-- 用户增长趋势图 -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>用户增长趋势</h3>
            <div class="chart-controls">
              <el-radio-group v-model="userTrendPeriod" @change="loadUserTrends">
                <el-radio-button label="7">近7天</el-radio-button>
                <el-radio-button label="30">近30天</el-radio-button>
                <el-radio-button label="90">近90天</el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div class="chart-content">
            <div ref="userTrendChart" class="chart-container"></div>
          </div>
        </div>

        <!-- 项目创建趋势图 -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>项目创建趋势</h3>
            <div class="chart-controls">
              <el-radio-group v-model="projectTrendPeriod" @change="loadProjectTrends">
                <el-radio-button label="7">近7天</el-radio-button>
                <el-radio-button label="30">近30天</el-radio-button>
                <el-radio-button label="90">近90天</el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div class="chart-content">
            <div ref="projectTrendChart" class="chart-container"></div>
          </div>
        </div>
      </div>

      <!-- 项目类型分布图 -->
      <div class="chart-row">
        <div class="chart-card full-width">
          <div class="chart-header">
            <h3>项目类型分布</h3>
            <div class="chart-info">
              <span class="info-text">展示各类型项目的占比情况</span>
            </div>
          </div>
          <div class="chart-content">
            <div ref="projectTypeChart" class="chart-container pie-chart"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 详细数据表格 -->
    <div class="data-tables">
      <div class="table-card">
        <div class="table-header">
          <h3>详细统计数据</h3>
          <div class="table-info">
            <span class="update-time">最后更新: {{ formatDateTime(overview.lastUpdateTime) }}</span>
          </div>
        </div>
        <div class="table-content">
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="data-group">
                <h4>用户数据</h4>
                <div class="data-list">
                  <div class="data-item">
                    <span class="label">今日注册:</span>
                    <span class="value">{{ overview.userStats?.todayRegistrations || 0 }} 人</span>
                  </div>
                  <div class="data-item">
                    <span class="label">本周注册:</span>
                    <span class="value">{{ overview.userStats?.weekRegistrations || 0 }} 人</span>
                  </div>
                  <div class="data-item">
                    <span class="label">本月注册:</span>
                    <span class="value">{{ overview.userStats?.monthRegistrations || 0 }} 人</span>
                  </div>
                  <div class="data-item">
                    <span class="label">周增长率:</span>
                    <span class="value" :class="getTrendClass(overview.userStats?.weeklyGrowthRate)">
                      {{ formatPercent(overview.userStats?.weeklyGrowthRate || 0) }}
                    </span>
                  </div>
                </div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="data-group">
                <h4>项目数据</h4>
                <div class="data-list">
                  <div class="data-item">
                    <span class="label">今日创建:</span>
                    <span class="value">{{ overview.projectStats?.todayProjects || 0 }} 个</span>
                  </div>
                  <div class="data-item">
                    <span class="label">本周创建:</span>
                    <span class="value">{{ overview.projectStats?.weekProjects || 0 }} 个</span>
                  </div>
                  <div class="data-item">
                    <span class="label">本月创建:</span>
                    <span class="value">{{ overview.projectStats?.monthProjects || 0 }} 个</span>
                  </div>
                  <div class="data-item">
                    <span class="label">周增长率:</span>
                    <span class="value" :class="getTrendClass(overview.projectStats?.weeklyGrowthRate)">
                      {{ formatPercent(overview.projectStats?.weeklyGrowthRate || 0) }}
                    </span>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import * as echarts from 'echarts';
import {
  getWebsiteOverview,
  getUserTrends,
  getProjectTrends,
  getProjectTypeDistribution,
  type WebsiteAnalyticsVo,
  type TrendData,
  type ProjectTypeDistribution
} from '@/api/monitor/websiteAnalytics';

// 响应式数据
const loading = ref(false);
const userTrendPeriod = ref('30');
const projectTrendPeriod = ref('30');

// 图表实例
const userTrendChart = ref<HTMLElement>();
const projectTrendChart = ref<HTMLElement>();
const projectTypeChart = ref<HTMLElement>();

let userChart: echarts.ECharts | null = null;
let projectChart: echarts.ECharts | null = null;
let typeChart: echarts.ECharts | null = null;

// 数据
const overview = reactive<WebsiteAnalyticsVo>({
  userStats: {
    totalUsers: 0,
    todayRegistrations: 0,
    weekRegistrations: 0,
    monthRegistrations: 0,
    dailyGrowthRate: 0,
    weeklyGrowthRate: 0
  },
  projectStats: {
    totalProjects: 0,
    todayProjects: 0,
    weekProjects: 0,
    monthProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    dailyGrowthRate: 0,
    weeklyGrowthRate: 0
  },
  onlineStats: {
    currentOnlineUsers: 0,
    todayMaxOnlineUsers: 0,
    todayAvgOnlineUsers: 0
  },
  lastUpdateTime: ''
});

// 加载概览数据
const loadOverview = async () => {
  try {
    const response = await getWebsiteOverview();
    if (response.code === 200) {
      Object.assign(overview, response.data);
    }
  } catch (error) {
    console.error('加载概览数据失败:', error);
    ElMessage.error('加载概览数据失败');
  }
};

// 加载用户趋势数据
const loadUserTrends = async () => {
  try {
    const response = await getUserTrends(parseInt(userTrendPeriod.value));
    if (response.code === 200) {
      renderUserTrendChart(response.data);
    }
  } catch (error) {
    console.error('加载用户趋势数据失败:', error);
    ElMessage.error('加载用户趋势数据失败');
  }
};

// 加载项目趋势数据
const loadProjectTrends = async () => {
  try {
    const response = await getProjectTrends(parseInt(projectTrendPeriod.value));
    if (response.code === 200) {
      renderProjectTrendChart(response.data);
    }
  } catch (error) {
    console.error('加载项目趋势数据失败:', error);
    ElMessage.error('加载项目趋势数据失败');
  }
};

// 加载项目类型分布数据
const loadProjectTypeDistribution = async () => {
  try {
    const response = await getProjectTypeDistribution();
    if (response.code === 200) {
      renderProjectTypeChart(response.data);
    }
  } catch (error) {
    console.error('加载项目类型分布数据失败:', error);
    ElMessage.error('加载项目类型分布数据失败');
  }
};

// 渲染用户趋势图表
const renderUserTrendChart = (data: TrendData) => {
  if (!userChart) return;

  const option = {
    title: {
      show: false
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e4e7ed',
      borderWidth: 1,
      textStyle: {
        color: '#303133'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.dates,
      axisLine: {
        lineStyle: {
          color: '#e4e7ed'
        }
      },
      axisLabel: {
        color: '#909399'
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: '#e4e7ed'
        }
      },
      axisLabel: {
        color: '#909399'
      },
      splitLine: {
        lineStyle: {
          color: '#f5f7fa'
        }
      }
    },
    series: [
      {
        name: '注册用户数',
        data: data.registrations,
        type: 'line',
        smooth: true,
        lineStyle: {
          color: '#409eff',
          width: 3
        },
        itemStyle: {
          color: '#409eff'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(64, 158, 255, 0.3)'
              },
              {
                offset: 1,
                color: 'rgba(64, 158, 255, 0.1)'
              }
            ]
          }
        }
      }
    ]
  };

  userChart.setOption(option);
};

// 渲染项目趋势图表
const renderProjectTrendChart = (data: TrendData) => {
  if (!projectChart) return;

  const option = {
    title: {
      show: false
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e4e7ed',
      borderWidth: 1,
      textStyle: {
        color: '#303133'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.dates,
      axisLine: {
        lineStyle: {
          color: '#e4e7ed'
        }
      },
      axisLabel: {
        color: '#909399'
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: '#e4e7ed'
        }
      },
      axisLabel: {
        color: '#909399'
      },
      splitLine: {
        lineStyle: {
          color: '#f5f7fa'
        }
      }
    },
    series: [
      {
        name: '创建项目数',
        data: data.creations,
        type: 'line',
        smooth: true,
        lineStyle: {
          color: '#67c23a',
          width: 3
        },
        itemStyle: {
          color: '#67c23a'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(103, 194, 58, 0.3)'
              },
              {
                offset: 1,
                color: 'rgba(103, 194, 58, 0.1)'
              }
            ]
          }
        }
      }
    ]
  };

  projectChart.setOption(option);
};

// 渲染项目类型分布图表
const renderProjectTypeChart = (data: ProjectTypeDistribution[]) => {
  if (!typeChart) return;

  const option = {
    title: {
      show: false
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e4e7ed',
      borderWidth: 1,
      textStyle: {
        color: '#303133'
      }
    },
    legend: {
      top: '5%',
      left: 'center',
      textStyle: {
        color: '#606266'
      }
    },
    series: [
      {
        name: '项目类型分布',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '60%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
            color: '#303133'
          }
        },
        labelLine: {
          show: false
        },
        data: data.map((item, index) => ({
          value: item.value,
          name: item.name,
          itemStyle: {
            color: ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399'][index % 5]
          }
        }))
      }
    ]
  };

  typeChart.setOption(option);
};

// 初始化图表
const initCharts = async () => {
  await nextTick();
  
  if (userTrendChart.value) {
    userChart = echarts.init(userTrendChart.value);
  }
  if (projectTrendChart.value) {
    projectChart = echarts.init(projectTrendChart.value);
  }
  if (projectTypeChart.value) {
    typeChart = echarts.init(projectTypeChart.value);
  }

  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    userChart?.resize();
    projectChart?.resize();
    typeChart?.resize();
  });
};

// 刷新所有数据
const refreshData = async () => {
  loading.value = true;
  try {
    await Promise.all([
      loadOverview(),
      loadUserTrends(),
      loadProjectTrends(),
      loadProjectTypeDistribution()
    ]);
    ElMessage.success('数据刷新成功');
  } catch (error) {
    ElMessage.error('数据刷新失败');
  } finally {
    loading.value = false;
  }
};

// 格式化数字
const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
};

// 格式化百分比
const formatPercent = (num: number): string => {
  return (num >= 0 ? '+' : '') + num.toFixed(1) + '%';
};

// 格式化日期时间
const formatDateTime = (dateTime: string): string => {
  if (!dateTime) return '';
  return new Date(dateTime).toLocaleString();
};

// 获取趋势样式类
const getTrendClass = (rate: number): string => {
  if (rate > 0) return 'positive';
  if (rate < 0) return 'negative';
  return 'neutral';
};

// 组件挂载
onMounted(async () => {
  await initCharts();
  await refreshData();
});
</script>

<style scoped lang="scss">
.website-analytics-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding: 20px 24px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);

    .header-title {
      h2 {
        margin: 0 0 8px 0;
        color: #303133;
        font-size: 24px;
        font-weight: 600;
      }

      .subtitle {
        margin: 0;
        color: #909399;
        font-size: 14px;
      }
    }
  }

  .overview-cards {
    margin-bottom: 24px;

    .card-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;

      .stat-card {
        background: white;
        border-radius: 8px;
        padding: 24px;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
        display: flex;
        align-items: center;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .card-icon {
          margin-right: 16px;
          width: 48px;
          height: 48px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        &.user-card .card-icon {
          background: linear-gradient(135deg, #409eff, #67c23a);
          color: white;
        }

        &.project-card .card-icon {
          background: linear-gradient(135deg, #67c23a, #e6a23c);
          color: white;
        }

        &.online-card .card-icon {
          background: linear-gradient(135deg, #e6a23c, #f56c6c);
          color: white;
        }

        &.active-card .card-icon {
          background: linear-gradient(135deg, #f56c6c, #909399);
          color: white;
        }

        .card-content {
          flex: 1;

          .card-title {
            font-size: 14px;
            color: #909399;
            margin-bottom: 8px;
          }

          .card-value {
            font-size: 28px;
            font-weight: 600;
            color: #303133;
            margin-bottom: 8px;
          }

          .card-trend {
            font-size: 12px;
            display: flex;
            align-items: center;

            .el-icon {
              margin-right: 4px;
            }

            &.positive {
              color: #67c23a;
            }

            &.negative {
              color: #f56c6c;
            }

            &.neutral {
              color: #909399;
            }
          }
        }
      }
    }
  }

  .charts-section {
    margin-bottom: 24px;

    .chart-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(480px, 1fr));
      gap: 20px;
      margin-bottom: 20px;

      &:last-child {
        margin-bottom: 0;
      }

      .chart-card {
        background: white;
        border-radius: 8px;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);

        &.full-width {
          grid-column: 1 / -1;
        }

        .chart-header {
          padding: 20px 24px;
          border-bottom: 1px solid #f0f2f5;
          display: flex;
          justify-content: space-between;
          align-items: center;

          h3 {
            margin: 0;
            color: #303133;
            font-size: 16px;
            font-weight: 600;
          }

          .chart-info {
            .info-text {
              color: #909399;
              font-size: 14px;
            }
          }
        }

        .chart-content {
          padding: 20px 24px;

          .chart-container {
            width: 100%;
            height: 300px;

            &.pie-chart {
              height: 400px;
            }
          }
        }
      }
    }
  }

  .data-tables {
    .table-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);

      .table-header {
        padding: 20px 24px;
        border-bottom: 1px solid #f0f2f5;
        display: flex;
        justify-content: space-between;
        align-items: center;

        h3 {
          margin: 0;
          color: #303133;
          font-size: 16px;
          font-weight: 600;
        }

        .update-time {
          color: #909399;
          font-size: 14px;
        }
      }

      .table-content {
        padding: 24px;

        .data-group {
          h4 {
            margin: 0 0 16px 0;
            color: #303133;
            font-size: 14px;
            font-weight: 600;
          }

          .data-list {
            .data-item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 8px 0;
              border-bottom: 1px solid #f0f2f5;

              &:last-child {
                border-bottom: none;
              }

              .label {
                color: #606266;
                font-size: 14px;
              }

              .value {
                font-weight: 500;
                font-size: 14px;

                &.positive {
                  color: #67c23a;
                }

                &.negative {
                  color: #f56c6c;
                }

                &.neutral {
                  color: #909399;
                }
              }
            }
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .website-analytics-container {
    padding: 16px;

    .overview-cards .card-row {
      grid-template-columns: 1fr;
    }

    .charts-section .chart-row {
      grid-template-columns: 1fr;
    }
  }
}
</style>
