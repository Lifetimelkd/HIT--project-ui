<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!-- 筛选区域 -->
      <el-col :span="24" class="mb-4">
        <el-card>
          <el-form :model="queryParams" :inline="true" label-width="80px">
            <el-form-item label="时间范围">
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
                style="width: 240px"
              />
            </el-form-item>
            <el-form-item label="项目">
              <el-select v-model="queryParams.projectId" placeholder="请选择项目" clearable style="width: 200px">
                <el-option label="全部项目" value="" />
                <!-- 这里可以添加项目选项 -->
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 统计卡片 -->
      <el-col :span="24" class="mb-4">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-number">{{ safeNumber(overviewData.totalTasks) }}</div>
                <div class="stat-label">总任务数</div>
                <div class="stat-trend" :class="{ 'trend-up': safeNumber(overviewData.taskGrowth) > 0 }">
                  <el-icon><TrendCharts /></el-icon>
                  {{ safeNumber(overviewData.taskGrowth).toFixed(1) }}%
                </div>
              </div>
              <el-icon class="stat-icon" color="#409EFF"><Document /></el-icon>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-number">{{ safeNumber(overviewData.completedTasks) }}</div>
                <div class="stat-label">已完成</div>
                <div class="stat-trend" :class="{ 'trend-up': safeNumber(overviewData.completionGrowth) > 0 }">
                  <el-icon><TrendCharts /></el-icon>
                  {{ safeNumber(overviewData.completionGrowth).toFixed(1) }}%
                </div>
              </div>
              <el-icon class="stat-icon" color="#67C23A"><Check /></el-icon>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-number">{{ safeNumber(overviewData.avgProgress).toFixed(1) }}%</div>
                <div class="stat-label">平均进度</div>
                <div class="stat-trend" :class="{ 'trend-up': safeNumber(overviewData.progressGrowth) > 0 }">
                  <el-icon><TrendCharts /></el-icon>
                  {{ safeNumber(overviewData.progressGrowth).toFixed(1) }}%
                </div>
              </div>
              <el-icon class="stat-icon" color="#E6A23C"><Loading /></el-icon>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-number">{{ safeNumber(overviewData.overdueTasks) }}</div>
                <div class="stat-label">逾期任务</div>
                <div class="stat-trend trend-down">
                  <el-icon><TrendCharts /></el-icon>
                  {{ safeNumber(overviewData.overdueRate).toFixed(1) }}%
                </div>
              </div>
              <el-icon class="stat-icon" color="#F56C6C"><Warning /></el-icon>
            </el-card>
          </el-col>
        </el-row>
      </el-col>

      <!-- 图表区域 -->
      <el-col :span="12" class="mb-4">
        <el-card>
          <template #header>
            <span>任务状态分布</span>
          </template>
          <div ref="statusChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>

      <el-col :span="12" class="mb-4">
        <el-card>
          <template #header>
            <span>优先级分布</span>
          </template>
          <div ref="priorityChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>

      <el-col :span="24" class="mb-4">
        <el-card>
          <template #header>
            <span>任务完成趋势</span>
          </template>
          <div ref="trendChartRef" style="height: 400px;"></div>
        </el-card>
      </el-col>

      <!-- 详细统计表格 -->
      <el-col :span="24">
        <el-card>
          <template #header>
            <span>项目任务统计</span>
          </template>
          <el-table :data="projectStats" border v-loading="loading">
            <el-table-column label="项目名称" prop="projectName" min-width="150" />
            <el-table-column label="总任务数" prop="totalTasks" width="100" align="center" />
            <el-table-column label="已完成" prop="completedTasks" width="100" align="center" />
            <el-table-column label="进行中" prop="inProgressTasks" width="100" align="center" />
            <el-table-column label="待处理" prop="pendingTasks" width="100" align="center" />
            <el-table-column label="逾期任务" prop="overdueTasks" width="100" align="center" />
            <el-table-column label="完成率" prop="completionRate" width="100" align="center">
              <template #default="scope">
                <el-progress :percentage="safeNumber(scope.row.completionRate)" :stroke-width="8" />
              </template>
            </el-table-column>
            <el-table-column label="平均进度" prop="avgProgress" width="100" align="center">
              <template #default="scope">
                {{ safeNumber(scope.row.avgProgress) }}%
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="TaskStatistics" lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { Document, Check, Loading, Warning, TrendCharts } from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import { 
  getTaskOverviewStats,
  getTaskDistributionStats,
  getTaskTrendStats,
  getProjectTaskStats,
  type TaskOverviewStats,
  type TaskDistributionStats,
  type TaskTrendStats,
  type ProjectStats,
  type StatisticsQuery
} from '@/api/hit/project/task';

// 响应式数据
const loading = ref(true);
const dateRange = ref<[string, string]>(['', '']);

// 查询参数
const queryParams = reactive<StatisticsQuery>({
  projectId: '',
  startDate: '',
  endDate: ''
});

// 概览数据
const overviewData = ref<TaskOverviewStats>({
  totalTasks: 0,
  completedTasks: 0,
  avgProgress: 0,
  overdueTasks: 0,
  taskGrowth: 0,
  completionGrowth: 0,
  progressGrowth: 0,
  overdueRate: 0
});

// 分布数据
const distributionData = ref<TaskDistributionStats>({
  statusDistribution: [],
  priorityDistribution: []
});

// 趋势数据
const trendData = ref<TaskTrendStats>({
  dates: [],
  newTasks: [],
  completedTasks: []
});

// 项目统计数据
const projectStats = ref<ProjectStats[]>([]);

// 图表引用
const statusChartRef = ref<HTMLDivElement>();
const priorityChartRef = ref<HTMLDivElement>();
const trendChartRef = ref<HTMLDivElement>();

// 数据安全转换函数
const safeNumber = (value: any): number => {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  if (typeof value === 'number') {
    return isNaN(value) ? 0 : value;
  }
  if (typeof value === 'string') {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  }
  return 0;
};

/** 初始化状态分布图表 */
const initStatusChart = () => {
  if (!statusChartRef.value || !distributionData.value.statusDistribution.length) return;
  
  const chart = echarts.init(statusChartRef.value);
  const statusColors: Record<string, string> = {
    'done': '#67C23A',
    'doing': '#409EFF',
    'testing': '#E6A23C',
    'todo': '#909399',
    'cancelled': '#F56C6C'
  };
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '任务状态',
        type: 'pie',
        radius: '50%',
        data: distributionData.value.statusDistribution.map(item => ({
          value: item.count,
          name: item.statusName,
          itemStyle: { color: statusColors[item.status] || '#909399' }
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };
  chart.setOption(option);
};

/** 初始化优先级分布图表 */
const initPriorityChart = () => {
  if (!priorityChartRef.value || !distributionData.value.priorityDistribution.length) return;
  
  const chart = echarts.init(priorityChartRef.value);
  const priorityColors: Record<string, string> = {
    'urgent': '#F56C6C',
    'high': '#E6A23C',
    'medium': '#409EFF',
    'low': '#67C23A'
  };
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
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
      data: distributionData.value.priorityDistribution.map(item => item.priorityName)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '任务数量',
        type: 'bar',
        data: distributionData.value.priorityDistribution.map(item => ({
          value: item.count,
          itemStyle: { color: priorityColors[item.priority] || '#909399' }
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };
  chart.setOption(option);
};

/** 初始化趋势图表 */
const initTrendChart = () => {
  if (!trendChartRef.value) return;
  
  const chart = echarts.init(trendChartRef.value);
  
  // 如果没有趋势数据，显示空图表
  if (!trendData.value.dates.length) {
    const option = {
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['新建任务', '完成任务']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['暂无数据']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '新建任务',
          type: 'line',
          data: [0],
          itemStyle: { color: '#409EFF' }
        },
        {
          name: '完成任务',
          type: 'line',
          data: [0],
          itemStyle: { color: '#67C23A' }
        }
      ]
    };
    chart.setOption(option);
    return;
  }
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['新建任务', '完成任务']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: trendData.value.dates
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '新建任务',
        type: 'line',
        data: trendData.value.newTasks,
        itemStyle: { color: '#409EFF' }
      },
      {
        name: '完成任务',
        type: 'line',
        data: trendData.value.completedTasks,
        itemStyle: { color: '#67C23A' }
      }
    ]
  };
  chart.setOption(option);
};

/** 获取统计数据 */
const getStatistics = async () => {
  loading.value = true;
  try {
    const params: StatisticsQuery = {
      projectId: queryParams.projectId || undefined,
      startDate: queryParams.startDate || undefined,
      endDate: queryParams.endDate || undefined
    };

    // 并行获取所有统计数据
    const [overviewRes, distributionRes, trendRes, projectRes] = await Promise.all([
      getTaskOverviewStats(params),
      getTaskDistributionStats(params),
      getTaskTrendStats(params),
      getProjectTaskStats({
        startDate: queryParams.startDate || undefined,
        endDate: queryParams.endDate || undefined
      })
    ]);

    // 更新数据
    overviewData.value = overviewRes.data;
    distributionData.value = distributionRes.data;
    trendData.value = trendRes.data;
    projectStats.value = projectRes.data;

    // 初始化图表
    await nextTick();
    initStatusChart();
    initPriorityChart();
    initTrendChart();
  } catch (error) {
    console.error('获取统计数据失败:', error);
    ElMessage.error('获取统计数据失败');
  } finally {
    loading.value = false;
  }
};

/** 搜索按钮操作 */
const handleQuery = () => {
  if (dateRange.value && dateRange.value.length === 2) {
    queryParams.startDate = dateRange.value[0];
    queryParams.endDate = dateRange.value[1];
  } else {
    queryParams.startDate = '';
    queryParams.endDate = '';
  }
  getStatistics();
};

/** 重置按钮操作 */
const resetQuery = () => {
  dateRange.value = ['', ''];
  Object.assign(queryParams, {
    projectId: '',
    startDate: '',
    endDate: ''
  });
  getStatistics();
};

onMounted(() => {
  getStatistics();
});
</script>

<style scoped>
.stat-card {
  position: relative;
  overflow: hidden;
}

.stat-content {
  position: relative;
  z-index: 2;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 4px;
}

.stat-trend {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.trend-up {
  color: #67C23A;
}

.trend-down {
  color: #F56C6C;
}

.stat-icon {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 48px;
  opacity: 0.2;
}

.mb-4 {
  margin-bottom: 16px;
}
</style>
