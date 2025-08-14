<template>
  <div class="user-skill-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-title">
        <el-icon class="title-icon"><Histogram /></el-icon>
        技能管理
      </div>
      <div class="page-description">管理您的技能标签和等级，展示您的专业能力</div>
    </div>

    <div class="skill-content">
      <!-- 左侧技能展示 -->
      <div class="skill-left">
        <!-- 技能概览卡片 -->
        <el-card class="skill-overview-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><TrendCharts /></el-icon>
                技能概览
              </span>
            </div>
          </template>

          <!-- 技能雷达图 -->
          <div class="skill-radar">
            <div id="skillRadarChart" style="width: 100%; height: 300px"></div>
          </div>

          <!-- 技能统计 -->
          <div class="skill-stats">
            <div class="stat-item">
              <div class="stat-value">{{ skillStats.totalSkills }}</div>
              <div class="stat-label">总技能数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ skillStats.expertSkills }}</div>
              <div class="stat-label">专家级</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ skillStats.averageLevel }}</div>
              <div class="stat-label">平均等级</div>
            </div>
          </div>
        </el-card>

        <!-- 技能等级说明 -->
        <el-card class="skill-level-card" shadow="hover">
          <template #header>
            <span class="card-title">
              <el-icon><InfoFilled /></el-icon>
              技能等级说明
            </span>
          </template>

          <div class="level-description">
            <div class="level-item" v-for="level in skillLevels" :key="level.value">
              <div class="level-badge" :class="`level-${level.value}`">{{ level.value }}</div>
              <div class="level-info">
                <div class="level-name">{{ level.label }}</div>
                <div class="level-desc">{{ level.description }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 右侧技能管理 -->
      <div class="skill-right">
        <!-- 技能操作栏 -->
        <el-card class="skill-action-card" shadow="hover">
          <div class="action-header">
            <el-input v-model="searchKeyword" placeholder="搜索技能..." style="width: 300px" clearable>
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>

            <div class="action-buttons">
              <el-button type="primary" @click="handleAddSkill">
                <el-icon><Plus /></el-icon>
                添加技能
              </el-button>
              <el-button @click="handleBatchImport">
                <el-icon><Upload /></el-icon>
                批量导入
              </el-button>
            </div>
          </div>

          <!-- 技能分类筛选 -->
          <div class="category-filter">
            <el-tag
              v-for="category in skillCategories"
              :key="category.value"
              :type="activeCategory === category.value ? 'primary' : ''"
              :effect="activeCategory === category.value ? 'dark' : 'plain'"
              @click="handleCategoryFilter(category.value)"
              class="category-tag"
            >
              {{ category.label }}
            </el-tag>
          </div>
        </el-card>

        <!-- 技能列表 -->
        <el-card class="skill-list-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><List /></el-icon>
                我的技能 ({{ filteredSkills.length }})
              </span>
              <el-button type="text" @click="handleSortChange" size="small">
                {{ sortByLevel ? '按等级排序' : '按时间排序' }}
              </el-button>
            </div>
          </template>

          <div class="skill-list">
            <div v-for="skill in filteredSkills" :key="skill.userSkillId" class="skill-item">
              <div class="skill-info">
                <div class="skill-header">
                  <div class="skill-name">{{ skill.tagName }}</div>
                  <div class="skill-actions">
                    <el-button type="text" size="small" @click="handleEditSkill(skill)">
                      <el-icon><Edit /></el-icon>
                    </el-button>
                    <el-button type="text" size="small" @click="handleDeleteSkill(skill)" class="delete-btn">
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>
                </div>

                <div class="skill-category">{{ getSkillCategory(skill.tagCategory) }}</div>

                <div class="skill-level-section">
                  <div class="level-display">
                    <span class="level-label">技能等级：</span>
                    <el-rate v-model="skill.skillLevel" :max="5" show-score score-template="等级 {value}" @change="handleLevelChange(skill)" />
                  </div>

                  <div class="skill-progress">
                    <div class="progress-info">
                      <span>学习时长：{{ skill.learningTime || 0 }}小时</span>
                      <span>相关项目：{{ skill.projectCount || 0 }}个</span>
                    </div>
                    <div class="progress-bar">
                      <div class="progress-fill" :style="`width: ${skill.skillLevel * 20}%`"></div>
                    </div>
                  </div>
                </div>

                <div class="skill-tags">
                  <el-tag v-if="skill.isCertified" type="success" size="small">
                    <el-icon><Medal /></el-icon>
                    已认证
                  </el-tag>
                  <el-tag v-if="skill.isHot" type="warning" size="small">
                    <el-icon><Star /></el-icon>
                    热门
                  </el-tag>
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <div v-if="filteredSkills.length === 0" class="empty-state">
              <el-empty description="暂无技能数据" />
              <el-button type="primary" @click="handleAddSkill">添加第一个技能</el-button>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 添加/编辑技能对话框 -->
    <el-dialog v-model="skillDialogVisible" :title="isEdit ? '编辑技能' : '添加技能'" width="600px" @close="handleDialogClose">
      <el-form ref="skillFormRef" :model="skillForm" :rules="skillRules" label-width="100px">
        <el-form-item label="技能标签" prop="tagId">
          <el-select v-model="skillForm.tagId" placeholder="请选择技能标签" style="width: 100%" @change="handleTagChange">
            <el-option v-for="tag in skillTags" :key="tag.tagId" :label="tag.tagName" :value="tag.tagId">
              <span style="float: left">{{ tag.tagName }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ getSkillCategory(tag.tagCategory) }}</span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="技能等级" prop="skillLevel">
          <el-rate v-model="skillForm.skillLevel" :max="5" show-text :texts="['了解', '熟悉', '熟练', '精通', '专家']" />
        </el-form-item>

        <el-form-item label="学习时长" prop="learningTime">
          <el-input-number v-model="skillForm.learningTime" :min="0" :step="10" placeholder="小时" style="width: 100%" />
        </el-form-item>

        <el-form-item label="相关项目" prop="projectCount">
          <el-input-number v-model="skillForm.projectCount" :min="0" placeholder="项目数量" style="width: 100%" />
        </el-form-item>

        <el-form-item label="技能认证" prop="isCertified">
          <el-switch v-model="skillForm.isCertified" active-text="已认证" inactive-text="未认证" />
        </el-form-item>

        <el-form-item label="技能描述" prop="description">
          <el-input
            v-model="skillForm.description"
            type="textarea"
            :rows="3"
            placeholder="描述您在该技能方面的经验和成就..."
            maxlength="300"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="skillDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveSkill" :loading="loading">
            {{ isEdit ? '更新' : '添加' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="UserSkill">
import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Histogram, TrendCharts, InfoFilled, Search, Plus, Upload, List, Edit, Delete, Medal, Star } from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import { getUserSkillsWithTag, addUserSkill, updateUserSkill, delUserSkill, batchSaveUserSkills } from '@/api/hit/userSkill';
import { getSkillTagList } from '@/api/hit/skillTag';

// 响应式数据
const searchKeyword = ref('');
const activeCategory = ref('all');
const sortByLevel = ref(false);
const skillDialogVisible = ref(false);
const isEdit = ref(false);
const loading = ref(false);
const skillFormRef = ref();

// 技能表单数据
const skillForm = reactive({
  userSkillId: undefined,
  userId: undefined,
  tagId: undefined,
  skillLevel: 3,
  learningTime: 0,
  projectCount: 0,
  isCertified: false,
  description: ''
});

// 技能列表数据
const skillList = ref([]);

// 技能标签数据
const skillTags = ref([]);

// 技能分类
const skillCategories = [
  { label: '全部', value: 'all' },
  { label: '编程语言', value: 'programming' },
  { label: '前端技术', value: 'frontend' },
  { label: '后端技术', value: 'backend' },
  { label: '人工智能', value: 'ai' },
  { label: '数据库', value: 'database' },
  { label: '软技能', value: 'soft_skill' },
  { label: '设计', value: 'design' }
];

// 技能等级
const skillLevels = [
  { value: 1, label: '了解', description: '基本了解相关概念' },
  { value: 2, label: '熟悉', description: '能够在指导下完成简单任务' },
  { value: 3, label: '熟练', description: '能够独立完成相关工作' },
  { value: 4, label: '精通', description: '能够解决复杂问题并指导他人' },
  { value: 5, label: '专家', description: '在该领域具有专家级水平' }
];

// 表单验证规则
const skillRules = reactive({
  tagId: [{ required: true, message: '请选择技能标签', trigger: 'change' }],
  skillLevel: [{ required: true, message: '请选择技能等级', trigger: 'change' }]
});

// 计算属性
const filteredSkills = computed(() => {
  let result = skillList.value;

  // 分类筛选
  if (activeCategory.value !== 'all') {
    result = result.filter((skill) => skill.tagCategory === activeCategory.value);
  }

  // 关键词搜索
  if (searchKeyword.value) {
    result = result.filter(
      (skill) =>
        skill.tagName?.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
        skill.description?.toLowerCase().includes(searchKeyword.value.toLowerCase())
    );
  }

  // 排序
  if (sortByLevel.value) {
    result = result.sort((a, b) => b.skillLevel - a.skillLevel);
  } else {
    result = result.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
  }

  return result;
});

const skillStats = computed(() => {
  const total = skillList.value.length;
  const expert = skillList.value.filter((skill) => skill.skillLevel >= 4).length;
  const average = total > 0 ? (skillList.value.reduce((sum, skill) => sum + skill.skillLevel, 0) / total).toFixed(1) : 0;

  return {
    totalSkills: total,
    expertSkills: expert,
    averageLevel: average
  };
});

// 方法
const loadUserSkills = async () => {
  try {
    // 这里应该传入当前用户ID，暂时使用固定值
    const response = await getUserSkillsWithTag(1);
    if (response.code === 200) {
      skillList.value = response.data || [];
    }
  } catch (error) {
    console.error('获取用户技能失败:', error);
  }
};

const loadSkillTags = async () => {
  try {
    const response = await getSkillTagList();
    if (response.code === 200) {
      skillTags.value = response.rows || [];
    }
  } catch (error) {
    console.error('获取技能标签失败:', error);
  }
};

const getSkillCategory = (category: string) => {
  const categoryObj = skillCategories.find((c) => c.value === category);
  return categoryObj ? categoryObj.label : category;
};

const handleCategoryFilter = (category: string) => {
  activeCategory.value = category;
};

const handleSortChange = () => {
  sortByLevel.value = !sortByLevel.value;
};

const handleAddSkill = () => {
  isEdit.value = false;
  resetSkillForm();
  skillDialogVisible.value = true;
};

const handleEditSkill = (skill: any) => {
  isEdit.value = true;
  Object.assign(skillForm, skill);
  skillDialogVisible.value = true;
};

const handleDeleteSkill = async (skill: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除技能"${skill.tagName}"吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    const response = await delUserSkill([skill.userSkillId]);
    if (response.code === 200) {
      ElMessage.success('删除成功');
      await loadUserSkills();
      updateRadarChart();
    } else {
      ElMessage.error(response.msg || '删除失败');
    }
  } catch {
    // 用户取消删除
  }
};

const handleLevelChange = async (skill: any) => {
  try {
    const response = await updateUserSkill(skill);
    if (response.code === 200) {
      ElMessage.success(`${skill.tagName} 等级已更新为 ${skill.skillLevel} 级`);
      updateRadarChart();
    } else {
      ElMessage.error(response.msg || '更新失败');
    }
  } catch (error) {
    console.error('更新技能等级失败:', error);
    ElMessage.error('更新失败');
  }
};

const handleSaveSkill = async () => {
  try {
    await skillFormRef.value.validate();
    loading.value = true;

    let response;
    if (isEdit.value) {
      response = await updateUserSkill(skillForm);
    } else {
      // 设置当前用户ID
      skillForm.userId = 1; // 应该从登录状态获取
      response = await addUserSkill(skillForm);
    }

    if (response.code === 200) {
      ElMessage.success(isEdit.value ? '技能更新成功' : '技能添加成功');
      skillDialogVisible.value = false;
      await loadUserSkills();
      updateRadarChart();
    } else {
      ElMessage.error(response.msg || '保存失败');
    }
  } catch (error) {
    console.error('保存失败:', error);
    ElMessage.error('保存失败');
  } finally {
    loading.value = false;
  }
};

const handleDialogClose = () => {
  resetSkillForm();
};

const resetSkillForm = () => {
  Object.assign(skillForm, {
    userSkillId: undefined,
    userId: undefined,
    tagId: undefined,
    skillLevel: 3,
    learningTime: 0,
    projectCount: 0,
    isCertified: false,
    description: ''
  });
};

const handleBatchImport = () => {
  ElMessage.info('批量导入功能开发中...');
};

const handleTagChange = () => {
  // 技能标签选择改变时的处理（可以在这里添加额外逻辑）
};

// 初始化雷达图
const initRadarChart = () => {
  nextTick(() => {
    const chartDom = document.getElementById('skillRadarChart');
    if (!chartDom) return;

    const myChart = echarts.init(chartDom);
    updateRadarChart(myChart);
  });
};

const updateRadarChart = (chart?: any) => {
  const chartDom = document.getElementById('skillRadarChart');
  if (!chartDom) return;

  const myChart = chart || echarts.getInstanceByDom(chartDom);
  if (!myChart) return;

  // 按分类统计技能等级
  const categoryStats = skillCategories.slice(1).map((category) => {
    const categorySkills = skillList.value.filter((skill) => skill.tagCategory === category.value);
    const averageLevel = categorySkills.length > 0 ? categorySkills.reduce((sum, skill) => sum + skill.skillLevel, 0) / categorySkills.length : 0;

    return {
      name: category.label,
      value: averageLevel
    };
  });

  const option = {
    title: {
      text: '技能雷达图',
      left: 'center',
      textStyle: {
        fontSize: 14,
        color: '#303133'
      }
    },
    tooltip: {
      trigger: 'item'
    },
    radar: {
      indicator: categoryStats.map((item) => ({
        name: item.name,
        max: 5
      })),
      radius: '65%'
    },
    series: [
      {
        name: '技能等级',
        type: 'radar',
        data: [
          {
            value: categoryStats.map((item) => item.value),
            name: '我的技能',
            itemStyle: {
              color: '#005BAC'
            },
            areaStyle: {
              color: 'rgba(0, 91, 172, 0.2)'
            }
          }
        ]
      }
    ]
  };

  myChart.setOption(option);
};

// 生命周期
onMounted(async () => {
  await Promise.all([loadUserSkills(), loadSkillTags()]);
  initRadarChart();
});
</script>

<style scoped lang="scss">
.user-skill-container {
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

  .skill-content {
    display: flex;
    gap: 20px;

    .skill-left {
      width: 350px;

      .skill-overview-card {
        margin-bottom: 20px;

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

        .skill-stats {
          display: flex;
          justify-content: space-around;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #f0f0f0;

          .stat-item {
            text-align: center;

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

      .skill-level-card {
        .level-description {
          .level-item {
            display: flex;
            align-items: center;
            margin-bottom: 16px;

            .level-badge {
              width: 32px;
              height: 32px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: 600;
              margin-right: 12px;
              font-size: 14px;

              &.level-1 {
                background-color: #f56c6c;
              }
              &.level-2 {
                background-color: #e6a23c;
              }
              &.level-3 {
                background-color: #409eff;
              }
              &.level-4 {
                background-color: #67c23a;
              }
              &.level-5 {
                background-color: #005bac;
              }
            }

            .level-info {
              .level-name {
                font-weight: 600;
                color: #303133;
                margin-bottom: 4px;
              }

              .level-desc {
                font-size: 12px;
                color: #909399;
              }
            }
          }
        }
      }
    }

    .skill-right {
      flex: 1;

      .skill-action-card {
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

          .category-tag {
            cursor: pointer;
            transition: all 0.3s;

            &:hover {
              transform: translateY(-1px);
            }
          }
        }
      }

      .skill-list-card {
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

        .skill-list {
          .skill-item {
            padding: 16px;
            border: 1px solid #f0f0f0;
            border-radius: 8px;
            margin-bottom: 12px;
            transition: all 0.3s;

            &:hover {
              border-color: #005bac;
              box-shadow: 0 2px 12px rgba(0, 91, 172, 0.1);
            }

            .skill-info {
              .skill-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;

                .skill-name {
                  font-size: 16px;
                  font-weight: 600;
                  color: #303133;
                }

                .skill-actions {
                  display: flex;
                  gap: 8px;

                  .delete-btn {
                    color: #f56c6c;

                    &:hover {
                      color: #f56c6c;
                    }
                  }
                }
              }

              .skill-category {
                font-size: 12px;
                color: #909399;
                margin-bottom: 12px;
              }

              .skill-level-section {
                margin-bottom: 12px;

                .level-display {
                  display: flex;
                  align-items: center;
                  margin-bottom: 8px;

                  .level-label {
                    margin-right: 8px;
                    font-size: 14px;
                    color: #606266;
                  }
                }

                .skill-progress {
                  .progress-info {
                    display: flex;
                    justify-content: space-between;
                    font-size: 12px;
                    color: #909399;
                    margin-bottom: 8px;
                  }

                  .progress-bar {
                    height: 6px;
                    background-color: #f0f0f0;
                    border-radius: 3px;
                    overflow: hidden;

                    .progress-fill {
                      height: 100%;
                      background: linear-gradient(90deg, #005bac, #0077c8);
                      transition: width 0.3s;
                    }
                  }
                }
              }

              .skill-tags {
                display: flex;
                gap: 8px;
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

  :deep(.el-rate__text) {
    color: #606266;
  }
}
</style>
