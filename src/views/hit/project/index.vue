<template>
  <div class="project-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">项目广场</h1>
        <p class="page-subtitle">发现优秀项目，加入团队协作</p>
        <el-button type="primary" size="large" @click="handleCreate" class="create-btn">
          <el-icon><Plus /></el-icon>
          创建项目
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选区域 -->
    <div class="filter-section">
      <el-card class="filter-card">
        <el-row :gutter="20" class="filter-row">
          <el-col :span="8">
            <el-input v-model="queryParams.projectName" placeholder="搜索项目名称" clearable @keyup.enter="handleQuery">
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-select v-model="queryParams.projectType" placeholder="项目类型" clearable>
              <el-option label="学术研究" value="academic" />
              <el-option label="竞赛项目" value="competition" />
              <el-option label="实践项目" value="practice" />
              <el-option label="毕业设计" value="graduation" />
              <el-option label="课程项目" value="course" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select v-model="queryParams.difficultyLevel" placeholder="难度等级" clearable>
              <el-option label="入门" :value="1" />
              <el-option label="进阶" :value="2" />
              <el-option label="专业" :value="3" />
              <el-option label="挑战" :value="4" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select v-model="queryParams.recruitmentStatus" placeholder="招募状态" clearable>
              <el-option label="招募中" value="open" />
              <el-option label="暂停招募" value="paused" />
              <el-option label="招募结束" value="closed" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="handleQuery" :loading="loading">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
          </el-col>
        </el-row>
      </el-card>
    </div>

    <!-- 标签筛选 -->
    <div class="tags-section">
      <div class="tag-group">
        <span class="tag-label">快速筛选：</span>
        <el-tag :type="activeTag === 'all' ? 'primary' : undefined" @click="handleTagFilter('all')" class="filter-tag"> 全部项目 </el-tag>
        <el-tag :type="activeTag === 'featured' ? 'primary' : undefined" @click="handleTagFilter('featured')" class="filter-tag"> 精选项目 </el-tag>
        <el-tag :type="activeTag === 'urgent' ? 'primary' : undefined" @click="handleTagFilter('urgent')" class="filter-tag"> 紧急招募 </el-tag>
        <el-tag :type="activeTag === 'credit' ? 'primary' : undefined" @click="handleTagFilter('credit')" class="filter-tag"> 学分认定 </el-tag>
      </div>
    </div>

    <!-- 项目列表 -->
    <div class="project-list">
      <el-row :gutter="20" v-loading="loading">
        <el-col :span="8" v-for="project in projectList" :key="project.projectId">
          <el-card class="project-card" @click="handleDetail(project.projectId)">
            <!-- 项目封面 -->
            <div class="project-cover">
              <img :src="project.coverImage || '/default-project-cover.jpg'" :alt="project.projectName" class="cover-image" />
              <div class="cover-overlay">
                <div class="project-tags">
                  <el-tag v-if="project.isFeatured === '1'" type="warning" size="small">精选</el-tag>
                  <el-tag v-if="project.isUrgent === '1'" type="danger" size="small">急招</el-tag>
                  <el-tag v-if="project.isCredit === '1'" type="success" size="small">学分</el-tag>
                </div>
                <div class="difficulty-badge">
                  <el-tag :type="getDifficultyType(project.difficultyLevel!)" size="small">
                    {{ getDifficultyText(project.difficultyLevel!) }}
                  </el-tag>
                </div>
              </div>
            </div>

            <!-- 项目信息 -->
            <div class="project-info">
              <h3 class="project-title">{{ project.projectName }}</h3>
              <p class="project-description">{{ project.projectDescription }}</p>

              <div class="project-meta">
                <div class="meta-item">
                  <el-icon><User /></el-icon>
                  <span>{{ project.creatorName }}</span>
                </div>
                <div class="meta-item">
                  <el-icon><Calendar /></el-icon>
                  <span>{{ formatDate(project.createTime!) }}</span>
                </div>
              </div>

              <div class="project-stats">
                <div class="stat-item">
                  <el-icon><View /></el-icon>
                  <span>{{ project.viewCount }}</span>
                </div>
                <div class="stat-item">
                  <el-icon><Star /></el-icon>
                  <span>{{ project.likeCount }}</span>
                </div>
                <div class="stat-item">
                  <el-icon><Collection /></el-icon>
                  <span>{{ project.collectCount }}</span>
                </div>
                <div class="stat-item">
                  <el-icon><UserFilled /></el-icon>
                  <span>{{ project.currentMembers }}/{{ project.teamSizeMax }}</span>
                </div>
              </div>

              <div class="project-footer">
                <el-tag :type="getStatusType(project.recruitmentStatus!)">
                  {{ getStatusText(project.recruitmentStatus!) }}
                </el-tag>
                <div class="action-buttons">
                  <el-button size="small" :type="project.userLiked ? 'primary' : 'default'" @click.stop="handleLike(project)">
                    <el-icon><Star /></el-icon>
                    {{ project.userLiked ? '已点赞' : '点赞' }}
                  </el-button>
                  <el-button size="small" :type="project.userCollected ? 'warning' : 'default'" @click.stop="handleCollect(project)">
                    <el-icon><Collection /></el-icon>
                    {{ project.userCollected ? '已收藏' : '收藏' }}
                  </el-button>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 空状态 -->
      <div v-if="!loading && projectList.length === 0" class="empty-state">
        <el-empty description="暂无项目数据">
          <el-button type="primary" @click="handleCreate">创建第一个项目</el-button>
        </el-empty>
      </div>

      <!-- 分页 -->
      <div class="pagination-container" v-if="total > 0">
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[12, 24, 48]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import {
  listPublicProject,
  listFeaturedProject,
  likeProject,
  unlikeProject,
  collectProject,
  uncollectProject,
  checkUserLiked,
  checkUserCollected,
  ProjectInfo,
  ProjectQuery
} from '@/api/hit/project';

const router = useRouter();

// 响应式数据
const loading = ref(false);
const projectList = ref<ProjectInfo[]>([]);
const total = ref(0);
const activeTag = ref('all');

// 查询参数
const queryParams = reactive<ProjectQuery>({
  pageNum: 1,
  pageSize: 12,
  projectName: '',
  projectType: '',
  difficultyLevel: undefined,
  recruitmentStatus: ''
});

// 获取项目列表
const getProjectList = async () => {
  loading.value = true;
  try {
    let response;
    if (activeTag.value === 'featured') {
      response = await listFeaturedProject(queryParams);
    } else if (activeTag.value === 'urgent') {
      response = await listPublicProject({ ...queryParams, isUrgent: '1' });
    } else if (activeTag.value === 'credit') {
      response = await listPublicProject({ ...queryParams, isCredit: '1' });
    } else {
      response = await listPublicProject(queryParams);
    }

    console.log('API响应数据:', response);

    // 由于axios响应拦截器已经提取了data，response就是实际的数据
    // API返回格式: { code: 200, msg: "查询成功", rows: [...], total: 4 }
    if (response && typeof response === 'object') {
      // 直接从response中获取rows和total
      if ('rows' in response && 'total' in response) {
        projectList.value = response.rows || [];
        total.value = response.total || 0;
      }
      // 如果response本身就是数组
      else if (Array.isArray(response)) {
        projectList.value = response;
        total.value = response.length;
      } else {
        console.warn('未识别的响应格式:', response);
        projectList.value = [];
        total.value = 0;
      }
    } else {
      projectList.value = [];
      total.value = 0;
    }

    console.log('解析后的项目列表:', projectList.value);
    console.log('总数:', total.value);

    // 只有当成功获取到项目数据时才检查用户交互状态
    if (projectList.value.length > 0) {
      await checkUserInteractions();
    }
  } catch (error) {
    console.error('获取项目列表失败:', error);
    ElMessage.error('获取项目列表失败');
    projectList.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

// 检查用户交互状态
const checkUserInteractions = async () => {
  // 启用用户交互状态检查
  for (const project of projectList.value) {
    try {
      const [likedRes, collectedRes] = await Promise.all([checkUserLiked(project.projectId), checkUserCollected(project.projectId)]);
      project.userLiked = likedRes.data;
      project.userCollected = collectedRes.data;
    } catch (error) {
      // 忽略错误，可能是未登录或权限问题
      console.warn('检查用户交互状态失败:', error);
    }
  }
};

// 搜索
const handleQuery = () => {
  queryParams.pageNum = 1;
  getProjectList();
};

// 标签筛选
const handleTagFilter = (tag: string) => {
  activeTag.value = tag;
  queryParams.pageNum = 1;
  getProjectList();
};

// 分页
const handleSizeChange = (size: number) => {
  queryParams.pageSize = size;
  getProjectList();
};

const handleCurrentChange = (page: number) => {
  queryParams.pageNum = page;
  getProjectList();
};

// 创建项目
const handleCreate = () => {
  router.push('/hit/project/create');
};

// 查看详情
const handleDetail = async (projectId: string) => {
  // 直接跳转到详情页，让详情页面在获取项目信息时自动增加浏览量
  router.push(`/hit/project/detail/${projectId}`);
};

// 点赞
const handleLike = async (project: ProjectInfo) => {
  try {
    if (!project.userLiked) {
      await likeProject(project.projectId);
      project.likeCount = (project.likeCount || 0) + 1;
      project.userLiked = true;
      ElMessage.success('点赞成功');
    } else {
      // 暂时不支持取消点赞，等待后端实现
      ElMessage.info('已经点赞过了');
      // TODO: 等后端实现取消点赞接口后启用
      // await unlikeProject(project.projectId);
      // project.likeCount = Math.max((project.likeCount || 0) - 1, 0);
      // project.userLiked = false;
      // ElMessage.success('取消点赞');
    }
  } catch (error) {
    ElMessage.error('操作失败，请先登录');
  }
};

// 收藏
const handleCollect = async (project: ProjectInfo) => {
  try {
    if (!project.userCollected) {
      await collectProject(project.projectId);
      project.collectCount = (project.collectCount || 0) + 1;
      project.userCollected = true;
      ElMessage.success('收藏成功');
    } else {
      // 暂时不支持取消收藏，等待后端实现
      ElMessage.info('已经收藏过了');
      // TODO: 等后端实现取消收藏接口后启用
      // await uncollectProject(project.projectId);
      // project.collectCount = Math.max((project.collectCount || 0) - 1, 0);
      // project.userCollected = false;
      // ElMessage.success('取消收藏');
    }
  } catch (error) {
    ElMessage.error('操作失败，请先登录');
  }
};

// 工具函数
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString();
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

// 生命周期
onMounted(() => {
  getProjectList();
});
</script>

<style scoped lang="scss">
.project-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0;
}

.page-header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 40px 0;
  text-align: center;
  color: white;
  margin-bottom: 30px;

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .page-title {
    font-size: 3rem;
    font-weight: bold;
    margin: 0 0 10px 0;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .page-subtitle {
    font-size: 1.2rem;
    margin: 0 0 30px 0;
    opacity: 0.9;
  }

  .create-btn {
    font-size: 1.1rem;
    padding: 12px 30px;
    border-radius: 25px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }
}

.filter-section {
  max-width: 1200px;
  margin: 0 auto 30px auto;
  padding: 0 20px;

  .filter-card {
    border-radius: 15px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    border: none;
  }

  .filter-row {
    align-items: center;
  }
}

.tags-section {
  max-width: 1200px;
  margin: 0 auto 30px auto;
  padding: 0 20px;

  .tag-group {
    display: flex;
    align-items: center;
    gap: 15px;
    background: rgba(255, 255, 255, 0.9);
    padding: 20px;
    border-radius: 15px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }

  .tag-label {
    font-weight: 500;
    color: #666;
  }

  .filter-tag {
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
    }
  }
}

.project-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;

  .project-card {
    margin-bottom: 30px;
    border-radius: 20px;
    overflow: hidden;
    transition: all 0.3s ease;
    cursor: pointer;
    border: none;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);

    &:hover {
      transform: translateY(-10px);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
    }
  }

  .project-cover {
    position: relative;
    height: 200px;
    overflow: hidden;

    .cover-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .cover-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), transparent);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 15px;

      .project-tags {
        display: flex;
        gap: 8px;
      }
    }

    &:hover .cover-image {
      transform: scale(1.05);
    }
  }

  .project-info {
    padding: 25px;

    .project-title {
      font-size: 1.4rem;
      font-weight: bold;
      margin: 0 0 15px 0;
      color: #2c3e50;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .project-description {
      color: #666;
      line-height: 1.6;
      margin: 0 0 20px 0;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      height: 72px;
    }

    .project-meta {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 5px;
        color: #888;
        font-size: 0.9rem;

        .el-icon {
          font-size: 16px;
        }
      }
    }

    .project-stats {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 10px;

      .stat-item {
        display: flex;
        align-items: center;
        gap: 5px;
        color: #666;
        font-size: 0.9rem;

        .el-icon {
          font-size: 16px;
          color: #409eff;
        }
      }
    }

    .project-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .action-buttons {
        display: flex;
        gap: 10px;
      }
    }
  }
}

.empty-state {
  text-align: center;
  padding: 60px 0;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 40px;
  padding-bottom: 40px;
}

// 响应式设计
@media (max-width: 768px) {
  .project-list {
    .el-col {
      span: 24 !important;
    }
  }

  .page-header .page-title {
    font-size: 2rem;
  }

  .filter-row {
    .el-col {
      margin-bottom: 10px;
    }
  }
}
</style>
