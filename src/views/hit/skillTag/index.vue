<template>
  <div class="skill-tag-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-title">
        <el-icon class="title-icon"><PriceTag /></el-icon>
        技能标签管理
      </div>
      <div class="page-description">管理技能标签体系，为用户提供标准化的技能分类</div>
    </div>

    <div class="tag-content">
      <!-- 左侧标签统计 -->
      <div class="tag-left">
        <!-- 标签统计卡片 -->
        <el-card class="tag-stats-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><DataAnalysis /></el-icon>
                标签统计
              </span>
            </div>
          </template>

          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">{{ tagStats.totalTags }}</div>
              <div class="stat-label">总标签数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ tagStats.hotTags }}</div>
              <div class="stat-label">热门标签</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ tagStats.categories }}</div>
              <div class="stat-label">分类数量</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ tagStats.avgUseCount }}</div>
              <div class="stat-label">平均使用</div>
            </div>
          </div>
        </el-card>

        <!-- 热门标签排行 -->
        <el-card class="hot-tags-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><TrendCharts /></el-icon>
                热门标签排行
              </span>
            </div>
          </template>

          <div class="hot-tags-list">
            <div v-for="(tag, index) in hotTagsList" :key="tag.tagId" class="hot-tag-item">
              <div class="rank-badge" :class="`rank-${index + 1}`">{{ index + 1 }}</div>
              <div class="tag-info">
                <div class="tag-name">{{ tag.tagName }}</div>
                <div class="tag-count">{{ tag.useCount }} 次使用</div>
              </div>
              <div class="tag-trend">
                <el-icon v-if="tag.trend === 'up'" class="trend-up"><CaretTop /></el-icon>
                <el-icon v-else-if="tag.trend === 'down'" class="trend-down"><CaretBottom /></el-icon>
                <el-icon v-else class="trend-stable"><Minus /></el-icon>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 分类分布 -->
        <el-card class="category-chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><PieChart /></el-icon>
                分类分布
              </span>
            </div>
          </template>

          <div id="categoryChart" style="width: 100%; height: 250px"></div>
        </el-card>
      </div>

      <!-- 右侧标签管理 -->
      <div class="tag-right">
        <!-- 操作栏 -->
        <el-card class="tag-action-card" shadow="hover">
          <div class="action-header">
            <el-input v-model="searchKeyword" placeholder="搜索标签..." style="width: 300px" clearable>
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>

            <div class="action-buttons">
              <el-button type="primary" @click="handleAddTag">
                <el-icon><Plus /></el-icon>
                添加标签
              </el-button>
              <el-button @click="handleBatchImport">
                <el-icon><Upload /></el-icon>
                批量导入
              </el-button>
              <el-button @click="handleExport">
                <el-icon><Download /></el-icon>
                导出标签
              </el-button>
            </div>
          </div>

          <!-- 分类筛选 -->
          <div class="category-filter">
            <el-tag
              v-for="category in tagCategories"
              :key="category.value"
              :type="activeCategory === category.value ? 'primary' : ''"
              :effect="activeCategory === category.value ? 'dark' : 'plain'"
              @click="handleCategoryFilter(category.value)"
              class="category-tag"
            >
              {{ category.label }}
            </el-tag>
          </div>

          <!-- 筛选选项 -->
          <div class="filter-options">
            <el-checkbox v-model="showHotOnly">仅显示热门标签</el-checkbox>
            <el-checkbox v-model="showParentOnly">仅显示父级标签</el-checkbox>
            <el-select v-model="sortBy" placeholder="排序方式" style="width: 120px; margin-left: 12px">
              <el-option label="使用次数" value="useCount" />
              <el-option label="创建时间" value="createTime" />
              <el-option label="标签名称" value="tagName" />
            </el-select>
          </div>
        </el-card>

        <!-- 标签列表 -->
        <el-card class="tag-list-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><List /></el-icon>
                标签列表 ({{ filteredTags.length }})
              </span>
              <div class="view-options">
                <el-button-group>
                  <el-button :type="viewMode === 'tree' ? 'primary' : ''" @click="viewMode = 'tree'" size="small">
                    <el-icon><Grid /></el-icon>
                    树形
                  </el-button>
                  <el-button :type="viewMode === 'list' ? 'primary' : ''" @click="viewMode = 'list'" size="small">
                    <el-icon><List /></el-icon>
                    列表
                  </el-button>
                </el-button-group>
              </div>
            </div>
          </template>

          <!-- 加载状态 -->
          <div v-if="loading" class="loading-container">
            <el-skeleton :rows="8" animated />
          </div>

          <!-- 树形视图 -->
          <div v-else-if="viewMode === 'tree'" class="tree-view">
            <el-tree v-if="treeData.length > 0" :data="treeData" :props="treeProps" :expand-on-click-node="false" default-expand-all class="tag-tree">
              <template #default="{ node, data }">
                <div class="tree-node">
                  <div class="node-content">
                    <span class="node-label">{{ data.tagName }}</span>
                    <el-tag v-if="data.isHot" type="warning" size="small" class="hot-badge"> 热门 </el-tag>
                    <span class="use-count">({{ data.useCount }})</span>
                  </div>
                  <div class="node-actions">
                    <el-button type="text" size="small" @click="handleAddChild(data)">
                      <el-icon><Plus /></el-icon>
                    </el-button>
                    <el-button type="text" size="small" @click="handleEditTag(data)">
                      <el-icon><Edit /></el-icon>
                    </el-button>
                    <el-button type="text" size="small" @click="handleDeleteTag(data)" class="delete-btn">
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>
                </div>
              </template>
            </el-tree>
            <div v-else class="empty-state">
              <el-empty description="暂无标签数据" />
              <el-button type="primary" @click="handleAddTag">添加第一个标签</el-button>
            </div>
          </div>

          <!-- 列表视图 -->
          <div v-else class="list-view">
            <div v-if="filteredTags.length > 0" class="tag-grid">
              <div v-for="tag in filteredTags" :key="tag.tagId" class="tag-item" :class="{ 'is-hot': tag.isHot }">
                <div class="tag-header">
                  <div class="tag-name">{{ tag.tagName }}</div>
                  <div class="tag-actions">
                    <el-button type="text" size="small" @click="handleEditTag(tag)">
                      <el-icon><Edit /></el-icon>
                    </el-button>
                    <el-button type="text" size="small" @click="handleDeleteTag(tag)" class="delete-btn">
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>
                </div>

                <div class="tag-category">{{ getTagCategory(tag.tagCategory) }}</div>

                <div class="tag-stats">
                  <div class="stat">
                    <el-icon><User /></el-icon>
                    <span>{{ tag.useCount }} 人使用</span>
                  </div>
                  <div class="stat" v-if="tag.parentId">
                    <el-icon><Connection /></el-icon>
                    <span>子标签</span>
                  </div>
                  <div class="stat" v-if="tag.isHot">
                    <el-icon><Star /></el-icon>
                    <span>热门标签</span>
                  </div>
                </div>

                <div class="tag-description" v-if="tag.description">
                  {{ tag.description }}
                </div>

                <div class="tag-footer">
                  <span class="create-time">{{ formatDate(tag.createTime) }}</span>
                  <div class="use-trend">
                    <el-icon v-if="tag.trend === 'up'" class="trend-up"><CaretTop /></el-icon>
                    <el-icon v-else-if="tag.trend === 'down'" class="trend-down"><CaretBottom /></el-icon>
                    <el-icon v-else class="trend-stable"><Minus /></el-icon>
                    <span>{{ tag.weeklyChange || 0 }}%</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <div v-else-if="!loading && filteredTags.length === 0" class="empty-state">
              <el-empty description="暂无标签数据" />
              <el-button type="primary" @click="handleAddTag">添加第一个标签</el-button>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 添加/编辑标签对话框 -->
    <el-dialog v-model="tagDialogVisible" :title="isEdit ? '编辑标签' : '添加标签'" width="600px" @close="handleDialogClose">
      <el-form ref="tagFormRef" :model="tagForm" :rules="tagRules" label-width="100px">
        <el-form-item label="标签名称" prop="tagName">
          <el-input v-model="tagForm.tagName" placeholder="请输入标签名称" />
        </el-form-item>

        <el-form-item label="标签分类" prop="tagCategory">
          <el-select v-model="tagForm.tagCategory" placeholder="请选择标签分类" style="width: 100%">
            <el-option v-for="category in tagCategories.slice(1)" :key="category.value" :label="category.label" :value="category.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="父级标签" prop="parentId">
          <el-tree-select
            v-model="tagForm.parentId"
            :data="parentTagOptions"
            :props="{ label: 'tagName', value: 'tagId' }"
            placeholder="选择父级标签（可选）"
            style="width: 100%"
            clearable
            :render-after-expand="false"
          />
        </el-form-item>

        <el-form-item label="标签描述" prop="description">
          <el-input
            v-model="tagForm.description"
            type="textarea"
            :rows="3"
            placeholder="描述该标签的含义和适用场景..."
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="热门标签" prop="isHot">
          <el-switch v-model="tagForm.isHot" active-text="是" inactive-text="否" />
        </el-form-item>

        <el-form-item label="排序权重" prop="sortOrder">
          <el-input-number v-model="tagForm.sortOrder" :min="0" :max="999" placeholder="数值越大排序越靠前" style="width: 100%" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="tagDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveTag" :loading="loading">
            {{ isEdit ? '更新' : '添加' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="SkillTag">
import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  PriceTag,
  DataAnalysis,
  TrendCharts,
  PieChart,
  Search,
  Plus,
  Upload,
  Download,
  List,
  Grid,
  Edit,
  Delete,
  User,
  Connection,
  Star,
  CaretTop,
  CaretBottom,
  Minus
} from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import {
  getSkillTagList,
  getSkillTag,
  addSkillTag,
  updateSkillTag,
  delSkillTag,
  getHotTags,
  getTagsByCategory,
  increaseUseCount
} from '@/api/hit/skillTag';

// 响应式数据
const searchKeyword = ref('');
const activeCategory = ref('all');
const showHotOnly = ref(false);
const showParentOnly = ref(false);
const sortBy = ref('useCount');
const viewMode = ref('list');
const tagDialogVisible = ref(false);
const isEdit = ref(false);
const loading = ref(false);
const tagFormRef = ref();
const parentTagToAdd = ref(null);

// 标签表单数据
const tagForm = reactive({
  tagId: undefined,
  tagName: '',
  tagCategory: '',
  parentId: undefined,
  description: '',
  isHot: false,
  sortOrder: 0
});

// 标签分类
const tagCategories = [
  { label: '全部', value: 'all' },
  { label: '编程语言', value: 'programming' },
  { label: '前端框架', value: 'frontend' },
  { label: '后端技术', value: 'backend' },
  { label: '数据库', value: 'database' },
  { label: '云服务', value: 'cloud' },
  { label: '工具软件', value: 'tools' },
  { label: '软技能', value: 'soft_skill' },
  { label: '行业领域', value: 'industry' }
];

// 标签列表数据
const tagList = ref([]);

// 加载技能标签数据
const loadTagData = async () => {
  try {
    loading.value = true;
    const response = await getSkillTagList();
    if (response && response.code === 200) {
      // 转换后端数据格式
      tagList.value = (response.rows || []).map((item) => ({
        tagId: item.tagId,
        tagName: item.tagName,
        tagCategory: item.tagCategory,
        parentId: item.parentId,
        description: item.description || '',
        useCount: item.useCount || 0,
        isHot: item.isHot === '1' || item.isHot === true,
        sortOrder: item.sortOrder || 0,
        trend: item.trend || 'stable',
        weeklyChange: item.weeklyChange || 0,
        createTime: item.createTime,
        status: item.status
      }));
      console.log('技能标签数据加载完成:', tagList.value);
    } else {
      console.error('获取技能标签数据失败:', response?.msg || '未知错误');
      ElMessage.error(response?.msg || '获取技能标签数据失败');
    }
  } catch (error) {
    console.error('加载技能标签数据失败:', error);
    ElMessage.error('加载技能标签数据失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 表单验证规则
const tagRules = reactive({
  tagName: [{ required: true, message: '请输入标签名称', trigger: 'blur' }],
  tagCategory: [{ required: true, message: '请选择标签分类', trigger: 'change' }]
});

// 树形数据配置
const treeProps = {
  children: 'children',
  label: 'tagName'
};

// 计算属性
const filteredTags = computed(() => {
  let result = tagList.value;

  // 分类筛选
  if (activeCategory.value !== 'all') {
    result = result.filter((tag) => tag.tagCategory === activeCategory.value);
  }

  // 关键词搜索
  if (searchKeyword.value) {
    result = result.filter(
      (tag) =>
        tag.tagName.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
        tag.description.toLowerCase().includes(searchKeyword.value.toLowerCase())
    );
  }

  // 热门标签筛选
  if (showHotOnly.value) {
    result = result.filter((tag) => tag.isHot);
  }

  // 父级标签筛选
  if (showParentOnly.value) {
    result = result.filter((tag) => !tag.parentId);
  }

  // 排序
  result = result.sort((a, b) => {
    if (sortBy.value === 'useCount') {
      return b.useCount - a.useCount;
    } else if (sortBy.value === 'createTime') {
      return new Date(b.createTime).getTime() - new Date(a.createTime).getTime();
    } else {
      return a.tagName.localeCompare(b.tagName);
    }
  });

  return result;
});

const treeData = computed(() => {
  const buildTree = (tags, parentId = null) => {
    return tags
      .filter((tag) => tag.parentId === parentId)
      .map((tag) => ({
        ...tag,
        children: buildTree(tags, tag.tagId)
      }));
  };
  return buildTree(tagList.value);
});

const parentTagOptions = computed(() => {
  return tagList.value.filter((tag) => !tag.parentId);
});

const tagStats = computed(() => {
  const total = tagList.value.length;
  const hot = tagList.value.filter((tag) => tag.isHot).length;
  const categories = new Set(tagList.value.map((tag) => tag.tagCategory)).size;
  const avgUse = total > 0 ? Math.round(tagList.value.reduce((sum, tag) => sum + tag.useCount, 0) / total) : 0;

  return {
    totalTags: total,
    hotTags: hot,
    categories,
    avgUseCount: avgUse
  };
});

const hotTagsList = computed(() => {
  return tagList.value
    .filter((tag) => tag.isHot)
    .sort((a, b) => b.useCount - a.useCount)
    .slice(0, 5);
});

// 方法
const getTagCategory = (category: string) => {
  const categoryObj = tagCategories.find((c) => c.value === category);
  return categoryObj ? categoryObj.label : category;
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString();
};

const handleCategoryFilter = (category: string) => {
  activeCategory.value = category;
};

const handleAddTag = () => {
  isEdit.value = false;
  parentTagToAdd.value = null;
  resetTagForm();
  tagDialogVisible.value = true;
};

const handleAddChild = (parentTag: any) => {
  isEdit.value = false;
  parentTagToAdd.value = parentTag;
  resetTagForm();
  tagForm.parentId = parentTag.tagId;
  tagForm.tagCategory = parentTag.tagCategory;
  tagDialogVisible.value = true;
};

const handleEditTag = (tag: any) => {
  isEdit.value = true;
  Object.assign(tagForm, tag);
  tagDialogVisible.value = true;
};

const handleDeleteTag = async (tag: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除标签"${tag.tagName}"吗？删除后无法恢复。`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    const response = await delSkillTag([tag.tagId]);
    if (response && response.code === 200) {
      ElMessage.success('删除成功');
      await loadTagData(); // 重新加载数据
      updateCategoryChart();
    } else {
      ElMessage.error(response?.msg || '删除失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

const handleSaveTag = async () => {
  try {
    await tagFormRef.value.validate();
    loading.value = true;

    // 转换前端数据格式到后端格式
    const tagData = {
      tagId: tagForm.tagId,
      tagName: tagForm.tagName,
      tagCategory: tagForm.tagCategory,
      parentId: tagForm.parentId,
      description: tagForm.description,
      isHot: tagForm.isHot,
      orderNum: tagForm.sortOrder
    };

    let response;
    if (isEdit.value) {
      // 更新标签
      response = await updateSkillTag(tagData);
    } else {
      // 添加标签
      response = await addSkillTag(tagData);
    }

    if (response && response.code === 200) {
      ElMessage.success(isEdit.value ? '标签更新成功' : '标签添加成功');
      tagDialogVisible.value = false;
      await loadTagData(); // 重新加载数据
      updateCategoryChart();
    } else {
      ElMessage.error(response?.msg || '保存失败');
    }
  } catch (error) {
    console.error('保存失败:', error);
    ElMessage.error('保存失败');
  } finally {
    loading.value = false;
  }
};

const handleDialogClose = () => {
  resetTagForm();
};

const resetTagForm = () => {
  Object.assign(tagForm, {
    tagId: undefined,
    tagName: '',
    tagCategory: '',
    parentId: undefined,
    description: '',
    isHot: false,
    sortOrder: 0
  });
};

const handleBatchImport = () => {
  ElMessage.info('批量导入功能开发中...');
};

const handleExport = () => {
  ElMessage.info('导出功能开发中...');
};

// 初始化分类分布图
const initCategoryChart = () => {
  nextTick(() => {
    const chartDom = document.getElementById('categoryChart');
    if (!chartDom) return;

    const myChart = echarts.init(chartDom);
    updateCategoryChart(myChart);
  });
};

const updateCategoryChart = (chart?: any) => {
  const chartDom = document.getElementById('categoryChart');
  if (!chartDom) return;

  const myChart = chart || echarts.getInstanceByDom(chartDom);
  if (!myChart) return;

  // 统计各分类的标签数量
  const categoryStats = tagCategories
    .slice(1)
    .map((category) => {
      const count = tagList.value.filter((tag) => tag.tagCategory === category.value).length;
      return {
        name: category.label,
        value: count
      };
    })
    .filter((item) => item.value > 0);

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    series: [
      {
        name: '标签分布',
        type: 'pie',
        radius: '65%',
        data: categoryStats,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        itemStyle: {
          borderRadius: 5,
          borderColor: '#fff',
          borderWidth: 2
        }
      }
    ]
  };

  myChart.setOption(option);
};

// 生命周期
onMounted(async () => {
  console.log('技能标签页面开始加载...');
  try {
    await loadTagData(); // 加载数据
    initCategoryChart();
    console.log('技能标签页面加载完成');
  } catch (error) {
    console.error('技能标签页面加载失败:', error);
  }
});
</script>

<style scoped lang="scss">
.skill-tag-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);

  .page-header {
    margin-bottom: 20px;
    background: white;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .page-title {
      display: flex;
      align-items: center;
      font-size: 24px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 8px;

      .title-icon {
        margin-right: 12px;
        color: #005bac;
      }
    }

    .page-description {
      color: #606266;
      font-size: 14px;
    }
  }

  .tag-content {
    display: flex;
    gap: 20px;

    .tag-left {
      width: 350px;

      .tag-stats-card {
        margin-bottom: 20px;

        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;

          .stat-item {
            text-align: center;
            padding: 16px;
            background: #f8f9fa;
            border-radius: 8px;

            .stat-value {
              font-size: 24px;
              font-weight: 600;
              color: #005bac;
              margin-bottom: 4px;
            }

            .stat-label {
              font-size: 12px;
              color: #909399;
            }
          }
        }
      }

      .hot-tags-card {
        margin-bottom: 20px;

        .hot-tags-list {
          .hot-tag-item {
            display: flex;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #f0f0f0;

            &:last-child {
              border-bottom: none;
            }

            .rank-badge {
              width: 24px;
              height: 24px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: 600;
              font-size: 12px;
              margin-right: 12px;

              &.rank-1 {
                background-color: #f56c6c;
              }
              &.rank-2 {
                background-color: #e6a23c;
              }
              &.rank-3 {
                background-color: #409eff;
              }
              &.rank-4,
              &.rank-5 {
                background-color: #909399;
              }
            }

            .tag-info {
              flex: 1;

              .tag-name {
                font-weight: 600;
                color: #303133;
                margin-bottom: 4px;
              }

              .tag-count {
                font-size: 12px;
                color: #909399;
              }
            }

            .tag-trend {
              .trend-up {
                color: #67c23a;
              }
              .trend-down {
                color: #f56c6c;
              }
              .trend-stable {
                color: #909399;
              }
            }
          }
        }
      }
    }

    .tag-right {
      flex: 1;

      .loading-container {
        padding: 20px;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .tag-action-card {
        margin-bottom: 20px;

        .action-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;

          .action-buttons {
            display: flex;
            gap: 12px;
          }
        }

        .category-filter {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 16px;

          .category-tag {
            cursor: pointer;
            transition: all 0.3s;

            &:hover {
              transform: translateY(-1px);
            }
          }
        }

        .filter-options {
          display: flex;
          align-items: center;
          gap: 16px;
        }
      }

      .tag-list-card {
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .card-title {
            display: flex;
            align-items: center;
            font-weight: 600;
            font-size: 16px;

            .el-icon {
              margin-right: 8px;
              color: #005bac;
            }
          }
        }

        .tree-view {
          .tag-tree {
            .tree-node {
              display: flex;
              justify-content: space-between;
              align-items: center;
              width: 100%;
              padding: 4px 0;

              .node-content {
                display: flex;
                align-items: center;
                gap: 8px;

                .node-label {
                  font-weight: 500;
                }

                .hot-badge {
                  transform: scale(0.8);
                }

                .use-count {
                  font-size: 12px;
                  color: #909399;
                }
              }

              .node-actions {
                display: flex;
                gap: 4px;
                opacity: 0;
                transition: opacity 0.3s;
              }

              &:hover .node-actions {
                opacity: 1;
              }
            }
          }
        }

        .list-view {
          .tag-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 16px;

            .tag-item {
              padding: 16px;
              border: 1px solid #f0f0f0;
              border-radius: 8px;
              transition: all 0.3s;
              background: white;

              &:hover {
                border-color: #005bac;
                box-shadow: 0 2px 12px rgba(0, 91, 172, 0.1);
              }

              &.is-hot {
                border-left: 4px solid #e6a23c;
              }

              .tag-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;

                .tag-name {
                  font-size: 16px;
                  font-weight: 600;
                  color: #303133;
                }

                .tag-actions {
                  display: flex;
                  gap: 8px;
                  opacity: 0;
                  transition: opacity 0.3s;

                  .delete-btn {
                    color: #f56c6c;
                  }
                }
              }

              &:hover .tag-actions {
                opacity: 1;
              }

              .tag-category {
                font-size: 12px;
                color: #909399;
                margin-bottom: 12px;
              }

              .tag-stats {
                display: flex;
                flex-wrap: wrap;
                gap: 12px;
                margin-bottom: 12px;

                .stat {
                  display: flex;
                  align-items: center;
                  gap: 4px;
                  font-size: 12px;
                  color: #606266;

                  .el-icon {
                    color: #005bac;
                  }
                }
              }

              .tag-description {
                font-size: 12px;
                color: #909399;
                line-height: 1.4;
                margin-bottom: 12px;
              }

              .tag-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 12px;
                color: #909399;

                .use-trend {
                  display: flex;
                  align-items: center;
                  gap: 4px;

                  .trend-up {
                    color: #67c23a;
                  }
                  .trend-down {
                    color: #f56c6c;
                  }
                  .trend-stable {
                    color: #909399;
                  }
                }
              }
            }
          }

          .empty-state {
            text-align: center;
            padding: 40px 0;
          }
        }
      }
    }
  }

  .card-header {
    .card-title {
      display: flex;
      align-items: center;
      font-weight: 600;
      font-size: 16px;

      .el-icon {
        margin-right: 8px;
        color: #005bac;
      }
    }
  }
}
</style>
