<template>
  <div class="user-portfolio-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-title">
        <el-icon class="title-icon"><Document /></el-icon>
        作品集管理
      </div>
      <div class="page-description">展示您的项目作品和创作成果，打造个人品牌</div>
    </div>

    <div class="portfolio-content">
      <!-- 左侧作品统计 -->
      <div class="portfolio-left">
        <!-- 作品统计卡片 -->
        <el-card class="portfolio-stats-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><DataBoard /></el-icon>
                作品统计
              </span>
            </div>
          </template>

          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">{{ portfolioStats.totalWorks }}</div>
              <div class="stat-label">总作品数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ portfolioStats.publicWorks }}</div>
              <div class="stat-label">公开作品</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ portfolioStats.featuredWorks }}</div>
              <div class="stat-label">精选作品</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ portfolioStats.totalViews }}</div>
              <div class="stat-label">总浏览量</div>
            </div>
          </div>
        </el-card>

        <!-- 作品分类统计 -->
        <el-card class="category-stats-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><PieChart /></el-icon>
                分类统计
              </span>
            </div>
          </template>

          <div class="category-list">
            <div
              v-for="category in categoryStats"
              :key="category.type"
              class="category-item"
            >
              <div class="category-info">
                <div class="category-name">{{ category.label }}</div>
                <div class="category-count">{{ category.count }} 个作品</div>
              </div>
              <div class="category-progress">
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    :style="`width: ${category.percentage}%; background-color: ${category.color}`"
                  ></div>
                </div>
                <span class="percentage">{{ category.percentage }}%</span>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 最近浏览 -->
        <el-card class="recent-views-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><View /></el-icon>
                最近浏览
              </span>
            </div>
          </template>

          <div class="recent-views-list">
            <div
              v-for="view in recentViews"
              :key="view.id"
              class="view-item"
            >
              <div class="view-avatar">{{ view.viewerName.charAt(0) }}</div>
              <div class="view-info">
                <div class="viewer-name">{{ view.viewerName }}</div>
                <div class="view-time">{{ formatDate(view.viewTime) }}</div>
              </div>
              <div class="view-work">{{ view.workTitle }}</div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 右侧作品管理 -->
      <div class="portfolio-right">
        <!-- 操作栏 -->
        <el-card class="portfolio-action-card" shadow="hover">
          <div class="action-header">
            <div class="search-filter">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索作品..."
                style="width: 300px;"
                clearable
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              
              <el-select v-model="activeCategory" placeholder="作品分类" style="width: 150px; margin-left: 12px;">
                <el-option
                  v-for="category in workCategories"
                  :key="category.value"
                  :label="category.label"
                  :value="category.value"
                />
              </el-select>
            </div>
            
            <div class="action-buttons">
              <el-button type="primary" @click="handleAddWork">
                <el-icon><Plus /></el-icon>
                添加作品
              </el-button>
              <el-button @click="handleBatchUpload">
                <el-icon><Upload /></el-icon>
                批量上传
              </el-button>
            </div>
          </div>

          <!-- 视图切换和排序 -->
          <div class="view-controls">
            <div class="view-mode">
              <el-button-group>
                <el-button
                  :type="viewMode === 'grid' ? 'primary' : ''"
                  @click="viewMode = 'grid'"
                  size="small"
                >
                  <el-icon><Grid /></el-icon>
                  网格
                </el-button>
                <el-button
                  :type="viewMode === 'list' ? 'primary' : ''"
                  @click="viewMode = 'list'"
                  size="small"
                >
                  <el-icon><List /></el-icon>
                  列表
                </el-button>
              </el-button-group>
            </div>
            
            <div class="sort-options">
              <el-select v-model="sortBy" placeholder="排序方式" size="small" style="width: 120px;">
                <el-option label="创建时间" value="createTime" />
                <el-option label="浏览量" value="viewCount" />
                <el-option label="作品名称" value="workTitle" />
              </el-select>
              <el-checkbox v-model="showFeaturedOnly" style="margin-left: 12px;">仅显示精选</el-checkbox>
            </div>
          </div>
        </el-card>

        <!-- 作品列表 -->
        <el-card class="portfolio-list-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><Collection /></el-icon>
                我的作品 ({{ filteredPortfolio.length }})
              </span>
            </div>
          </template>

          <!-- 网格视图 -->
          <div v-if="viewMode === 'grid'" class="grid-view">
            <div class="portfolio-grid">
              <div
                v-for="work in filteredPortfolio"
                :key="work.portfolioId"
                class="work-item"
                :class="{ 'is-featured': work.isFeatured }"
              >
                <div class="work-cover" @click="handleViewWork(work)">
                  <img v-if="work.coverImage" :src="work.coverImage" :alt="work.workTitle" />
                  <div v-else class="cover-placeholder">
                    <el-icon class="placeholder-icon"><Document /></el-icon>
                    <div class="placeholder-text">{{ getWorkTypeIcon(work.workType) }}</div>
                  </div>
                  
                  <div class="work-overlay">
                    <div class="overlay-actions">
                      <el-button circle size="small" @click.stop="handleEditWork(work)">
                        <el-icon><Edit /></el-icon>
                      </el-button>
                      <el-button circle size="small" @click.stop="handleViewWork(work)">
                        <el-icon><View /></el-icon>
                      </el-button>
                      <el-button circle size="small" type="danger" @click.stop="handleDeleteWork(work)">
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </div>
                  </div>
                  
                  <div class="work-badges">
                    <el-tag v-if="work.isFeatured" type="warning" size="small">精选</el-tag>
                    <el-tag v-if="work.isPublic" type="success" size="small">公开</el-tag>
                  </div>
                </div>
                
                <div class="work-info">
                  <div class="work-title">{{ work.workTitle }}</div>
                  <div class="work-category">{{ getWorkTypeLabel(work.workType) }}</div>
                  <div class="work-stats">
                    <span class="stat">
                      <el-icon><View /></el-icon>
                      {{ work.viewCount }}
                    </span>
                    <span class="stat">
                      <el-icon><Timer /></el-icon>
                      {{ formatDate(work.createTime) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 列表视图 -->
          <div v-else class="list-view">
            <div class="portfolio-list">
              <div
                v-for="work in filteredPortfolio"
                :key="work.portfolioId"
                class="work-list-item"
              >
                <div class="work-thumbnail">
                  <img v-if="work.coverImage" :src="work.coverImage" :alt="work.workTitle" />
                  <div v-else class="thumbnail-placeholder">
                    <el-icon><Document /></el-icon>
                  </div>
                </div>
                
                <div class="work-details">
                  <div class="work-header">
                    <div class="work-title">{{ work.workTitle }}</div>
                    <div class="work-actions">
                      <el-button type="text" size="small" @click="handleEditWork(work)">
                        <el-icon><Edit /></el-icon>
                        编辑
                      </el-button>
                      <el-button type="text" size="small" @click="handleViewWork(work)">
                        <el-icon><View /></el-icon>
                        查看
                      </el-button>
                      <el-button type="text" size="small" @click="handleDeleteWork(work)" class="delete-btn">
                        <el-icon><Delete /></el-icon>
                        删除
                      </el-button>
                    </div>
                  </div>
                  
                  <div class="work-description">{{ work.description || '暂无描述' }}</div>
                  
                  <div class="work-meta">
                    <div class="meta-tags">
                      <el-tag size="small">{{ getWorkTypeLabel(work.workType) }}</el-tag>
                      <el-tag v-if="work.isFeatured" type="warning" size="small">精选</el-tag>
                      <el-tag v-if="work.isPublic" type="success" size="small">公开</el-tag>
                    </div>
                    
                    <div class="meta-stats">
                      <span class="stat">
                        <el-icon><View /></el-icon>
                        {{ work.viewCount }} 浏览
                      </span>
                      <span class="stat">
                        <el-icon><Timer /></el-icon>
                        {{ formatDate(work.createTime) }}
                      </span>
                    </div>
                  </div>
                  
                  <div class="work-links">
                    <el-link v-if="work.demoUrl" :href="work.demoUrl" target="_blank" type="primary">
                      <el-icon><Link /></el-icon>
                      在线演示
                    </el-link>
                    <el-link v-if="work.repositoryUrl" :href="work.repositoryUrl" target="_blank" type="info">
                      <el-icon><Link /></el-icon>
                      源码地址
                    </el-link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-if="filteredPortfolio.length === 0" class="empty-state">
            <el-empty description="暂无作品" />
            <el-button type="primary" @click="handleAddWork">添加第一个作品</el-button>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 添加/编辑作品对话框 -->
    <el-dialog
      v-model="workDialogVisible"
      :title="isEdit ? '编辑作品' : '添加作品'"
      width="800px"
      @close="handleDialogClose"
    >
      <el-form
        ref="workFormRef"
        :model="workForm"
        :rules="workRules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="作品标题" prop="workTitle">
              <el-input v-model="workForm.workTitle" placeholder="请输入作品标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="作品类型" prop="workType">
              <el-select v-model="workForm.workType" placeholder="请选择作品类型" style="width: 100%">
                <el-option
                  v-for="type in workCategories.slice(1)"
                  :key="type.value"
                  :label="type.label"
                  :value="type.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="作品描述" prop="description">
          <el-input
            v-model="workForm.description"
            type="textarea"
            :rows="3"
            placeholder="描述您的作品内容、特色和亮点..."
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="技术栈" prop="techStack">
              <el-input v-model="workForm.techStack" placeholder="如：Vue.js, Node.js, MySQL" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="我的角色" prop="myRole">
              <el-input v-model="workForm.myRole" placeholder="如：全栈开发、前端负责人" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="演示地址" prop="demoUrl">
              <el-input v-model="workForm.demoUrl" placeholder="在线演示链接（可选）" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="源码地址" prop="repositoryUrl">
              <el-input v-model="workForm.repositoryUrl" placeholder="GitHub/Gitee链接（可选）" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="封面图片">
          <el-upload
            class="cover-uploader"
            :action="uploadUrl"
            :headers="uploadHeaders"
            :show-file-list="false"
            :on-success="handleCoverSuccess"
            :before-upload="beforeCoverUpload"
          >
            <img v-if="workForm.coverImage" :src="workForm.coverImage" class="cover-preview" />
            <div v-else class="cover-placeholder">
              <el-icon class="upload-icon"><Plus /></el-icon>
              <div class="upload-text">上传封面</div>
            </div>
          </el-upload>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="精选作品">
              <el-switch
                v-model="workForm.isFeatured"
                active-text="是"
                inactive-text="否"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="公开作品">
              <el-switch
                v-model="workForm.isPublic"
                active-text="是"
                inactive-text="否"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="workDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveWork" :loading="loading">
            {{ isEdit ? '更新' : '添加' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 作品详情对话框 -->
    <el-dialog
      v-model="workDetailVisible"
      :title="currentWork?.workTitle"
      width="900px"
    >
      <div v-if="currentWork" class="work-detail">
        <div class="detail-cover">
          <img v-if="currentWork.coverImage" :src="currentWork.coverImage" :alt="currentWork.workTitle" />
          <div v-else class="cover-placeholder">
            <el-icon><Document /></el-icon>
          </div>
        </div>
        
        <div class="detail-info">
          <div class="detail-meta">
            <el-tag>{{ getWorkTypeLabel(currentWork.workType) }}</el-tag>
            <el-tag v-if="currentWork.isFeatured" type="warning">精选作品</el-tag>
            <el-tag v-if="currentWork.isPublic" type="success">公开作品</el-tag>
          </div>
          
          <div class="detail-description">
            {{ currentWork.description || '暂无描述' }}
          </div>
          
          <div class="detail-tech">
            <div class="tech-label">技术栈：</div>
            <div class="tech-tags">
              <el-tag
                v-for="tech in (currentWork.techStack || '').split(',')"
                :key="tech"
                size="small"
                style="margin-right: 8px;"
              >
                {{ tech.trim() }}
              </el-tag>
            </div>
          </div>
          
          <div class="detail-role">
            <div class="role-label">我的角色：</div>
            <div class="role-text">{{ currentWork.myRole || '未指定' }}</div>
          </div>
          
          <div class="detail-links">
            <el-link v-if="currentWork.demoUrl" :href="currentWork.demoUrl" target="_blank" type="primary">
              <el-icon><Link /></el-icon>
              在线演示
            </el-link>
            <el-link v-if="currentWork.repositoryUrl" :href="currentWork.repositoryUrl" target="_blank" type="info">
              <el-icon><Link /></el-icon>
              源码地址
            </el-link>
          </div>
          
          <div class="detail-stats">
            <div class="stat-item">
              <div class="stat-label">浏览量</div>
              <div class="stat-value">{{ currentWork.viewCount }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">创建时间</div>
              <div class="stat-value">{{ formatDate(currentWork.createTime) }}</div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="UserPortfolio">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Document, DataBoard, PieChart, View, Search, Plus, Upload, Grid, List,
  Collection, Edit, Delete, Timer, Link
} from '@element-plus/icons-vue'
import { getToken } from '@/utils/auth'
import { globalHeaders } from '@/utils/request'
import { 
  getUserPortfolioList, 
  getCurrentUserPortfolios,
  addUserPortfolio, 
  updateUserPortfolio, 
  delUserPortfolio,
  increaseViewCount,
  increaseLikeCount
} from '@/api/hit/userPortfolio'

// 响应式数据
const searchKeyword = ref('')
const activeCategory = ref('all')
const viewMode = ref('grid')
const sortBy = ref('createTime')
const showFeaturedOnly = ref(false)
const workDialogVisible = ref(false)
const workDetailVisible = ref(false)
const isEdit = ref(false)
const loading = ref(false)
const workFormRef = ref()
const currentWork = ref(null)

const uploadUrl = ref(import.meta.env.VITE_APP_BASE_API + '/resource/oss/upload')
const uploadHeaders = ref(globalHeaders())

// 作品表单数据
const workForm = reactive({
  portfolioId: undefined,
  userId: undefined,
  workTitle: '',
  workType: '',
  description: '',
  techStack: '',
  myRole: '',
  demoUrl: '',
  repositoryUrl: '',
  coverImage: '',
  isFeatured: false,
  isPublic: true
})

// 作品分类
const workCategories = [
  { label: '全部', value: 'all' },
  { label: '项目作品', value: 'project' },
  { label: '设计作品', value: 'design' },
  { label: '学术成果', value: 'academic' },
  { label: '媒体作品', value: 'media' }
]

// 作品列表数据
const portfolioList = ref([])

// 加载作品集数据
const loadPortfolioData = async () => {
  try {
    loading.value = true
    const response = await getCurrentUserPortfolios()
    if (response && response.code === 200) {
      // 转换后端数据格式到前端格式
      portfolioList.value = (response.rows || []).map(item => ({
        portfolioId: item.portfolioId,
        workTitle: item.portfolioTitle,
        workType: item.workType,
        description: item.portfolioDescription,
        techStack: item.techStack,
        myRole: item.personalRole,
        demoUrl: item.projectUrl,
        repositoryUrl: item.repositoryUrl,
        coverImage: item.coverImage,
        viewCount: item.viewCount || 0,
        likeCount: item.likeCount || 0,
        isFeatured: item.isFeatured === '1',
        isPublic: item.isPublic === '1',
        createTime: item.createTime,
        status: item.status
      }))
      console.log('作品集数据加载完成:', portfolioList.value)
    } else {
      console.error('获取作品集数据失败:', response?.msg || '未知错误')
      ElMessage.error(response?.msg || '获取作品集数据失败')
    }
  } catch (error) {
    console.error('加载作品集数据失败:', error)
    ElMessage.error('加载作品集数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 最近浏览数据
const recentViews = ref([
  {
    id: 1,
    viewerName: '张三',
    workTitle: '智能垃圾分类系统',
    viewTime: '2024-01-15T14:30:00'
  },
  {
    id: 2,
    viewerName: '李四',
    workTitle: '校园外卖数据可视化',
    viewTime: '2024-01-15T13:20:00'
  },
  {
    id: 3,
    viewerName: '王五',
    workTitle: '移动应用UI设计',
    viewTime: '2024-01-15T11:45:00'
  }
])

// 表单验证规则
const workRules = reactive({
  workTitle: [{ required: true, message: '请输入作品标题', trigger: 'blur' }],
  workType: [{ required: true, message: '请选择作品类型', trigger: 'change' }],
  description: [{ required: true, message: '请输入作品描述', trigger: 'blur' }]
})

// 计算属性
const filteredPortfolio = computed(() => {
  let result = portfolioList.value

  // 分类筛选
  if (activeCategory.value !== 'all') {
    result = result.filter(work => work.workType === activeCategory.value)
  }

  // 关键词搜索
  if (searchKeyword.value) {
    result = result.filter(work =>
      work.workTitle.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      work.description.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      work.techStack.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }

  // 精选作品筛选
  if (showFeaturedOnly.value) {
    result = result.filter(work => work.isFeatured)
  }

  // 排序
  result = result.sort((a, b) => {
    if (sortBy.value === 'viewCount') {
      return b.viewCount - a.viewCount
    } else if (sortBy.value === 'createTime') {
      return new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
    } else {
      return a.workTitle.localeCompare(b.workTitle)
    }
  })

  return result
})

const portfolioStats = computed(() => {
  const total = portfolioList.value.length
  const publicWorks = portfolioList.value.filter(work => work.isPublic).length
  const featured = portfolioList.value.filter(work => work.isFeatured).length
  const totalViews = portfolioList.value.reduce((sum, work) => sum + work.viewCount, 0)

  return {
    totalWorks: total,
    publicWorks,
    featuredWorks: featured,
    totalViews
  }
})

const categoryStats = computed(() => {
  const total = portfolioList.value.length
  const colors = ['#005BAC', '#0077C8', '#67C23A', '#E6A23C', '#F56C6C']
  
  return workCategories.slice(1).map((category, index) => {
    const count = portfolioList.value.filter(work => work.workType === category.value).length
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0
    
    return {
      type: category.value,
      label: category.label,
      count,
      percentage,
      color: colors[index % colors.length]
    }
  })
})

// 方法
const getWorkTypeLabel = (type: string) => {
  const category = workCategories.find(c => c.value === type)
  return category ? category.label : type
}

const getWorkTypeIcon = (type: string) => {
  const icons = {
    project: '🚀',
    design: '🎨',
    academic: '📚',
    media: '🎬'
  }
  return icons[type] || '📄'
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString()
}

const handleAddWork = () => {
  isEdit.value = false
  resetWorkForm()
  // 不需要手动设置userId，后端会自动从登录状态获取
  workDialogVisible.value = true
}

const handleEditWork = (work: any) => {
  isEdit.value = true
  Object.assign(workForm, work)
  workDialogVisible.value = true
}

const handleViewWork = async (work: any) => {
  currentWork.value = work
  workDetailVisible.value = true
  
  // 增加浏览次数
  try {
    await increaseViewCount(work.portfolioId)
    // 更新本地数据中的浏览次数
    const index = portfolioList.value.findIndex(w => w.portfolioId === work.portfolioId)
    if (index !== -1) {
      portfolioList.value[index].viewCount = (portfolioList.value[index].viewCount || 0) + 1
    }
  } catch (error) {
    console.error('增加浏览次数失败:', error)
  }
}

const handleDeleteWork = async (work: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除作品"${work.workTitle}"吗？删除后无法恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response = await delUserPortfolio([work.portfolioId])
    if (response && response.code === 200) {
      ElMessage.success('删除成功')
      await loadPortfolioData() // 重新加载数据
    } else {
      ElMessage.error(response?.msg || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const handleSaveWork = async () => {
  try {
    await workFormRef.value.validate()
    loading.value = true

    // 转换前端数据格式到后端格式
    const portfolioData: any = {
      portfolioId: workForm.portfolioId,
      // 移除userId，让后端自动设置当前登录用户ID
      portfolioTitle: workForm.workTitle,
      workType: workForm.workType,
      portfolioDescription: workForm.description,
      techStack: workForm.techStack,
      personalRole: workForm.myRole,
      projectUrl: workForm.demoUrl,
      repositoryUrl: workForm.repositoryUrl,
      coverImage: workForm.coverImage,
      isFeatured: workForm.isFeatured ? '1' : '0',
      isPublic: workForm.isPublic ? '1' : '0'
    }

    let response
    if (isEdit.value) {
      // 更新作品时需要包含userId以进行权限检查
      portfolioData.userId = workForm.userId
      response = await updateUserPortfolio(portfolioData)
    } else {
      // 添加作品时不包含userId，让后端自动设置
      response = await addUserPortfolio(portfolioData)
    }

    if (response && response.code === 200) {
      ElMessage.success(isEdit.value ? '作品更新成功' : '作品添加成功')
      workDialogVisible.value = false
      await loadPortfolioData() // 重新加载数据
    } else {
      ElMessage.error(response?.msg || '保存失败')
    }
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  } finally {
    loading.value = false
  }
}

const handleDialogClose = () => {
  resetWorkForm()
}

const resetWorkForm = () => {
  Object.assign(workForm, {
    portfolioId: undefined,
    userId: undefined,
    workTitle: '',
    workType: '',
    description: '',
    techStack: '',
    myRole: '',
    demoUrl: '',
    repositoryUrl: '',
    coverImage: '',
    isFeatured: false,
    isPublic: true
  })
}

const handleBatchUpload = () => {
  ElMessage.info('批量上传功能开发中...')
}

const handleCoverSuccess = (response: any) => {
  if (response.code === 200) {
    workForm.coverImage = response.data.url
    ElMessage.success('封面上传成功')
  } else {
    ElMessage.error('封面上传失败')
  }
}

const beforeCoverUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!')
    return false
  }
  return true
}

// 生命周期
onMounted(async () => {
  await loadPortfolioData()
  
  // 如果没有数据，显示提示信息
  if (portfolioList.value.length === 0) {
    console.log('暂无作品集数据，请添加作品集')
  }
})
</script>

<style scoped lang="scss">
.user-portfolio-container {
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
        color: #005BAC;
      }
    }

    .page-description {
      color: #606266;
      font-size: 14px;
    }
  }

  .portfolio-content {
    display: flex;
    gap: 20px;

    .portfolio-left {
      width: 320px;

      .portfolio-stats-card {
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
              color: #005BAC;
              margin-bottom: 4px;
            }

            .stat-label {
              font-size: 12px;
              color: #909399;
            }
          }
        }
      }

      .category-stats-card {
        margin-bottom: 20px;

        .category-list {
          .category-item {
            margin-bottom: 16px;

            .category-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;

              .category-name {
                font-weight: 500;
                color: #303133;
              }

              .category-count {
                font-size: 12px;
                color: #909399;
              }
            }

            .category-progress {
              display: flex;
              align-items: center;
              gap: 8px;

              .progress-bar {
                flex: 1;
                height: 6px;
                background-color: #f0f0f0;
                border-radius: 3px;
                overflow: hidden;

                .progress-fill {
                  height: 100%;
                  border-radius: 3px;
                  transition: width 0.3s;
                }
              }

              .percentage {
                font-size: 12px;
                color: #909399;
                min-width: 35px;
                text-align: right;
              }
            }
          }
        }
      }

      .recent-views-card {
        .recent-views-list {
          .view-item {
            display: flex;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #f0f0f0;

            &:last-child {
              border-bottom: none;
            }

            .view-avatar {
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background-color: #005BAC;
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 600;
              margin-right: 12px;
            }

            .view-info {
              flex: 1;

              .viewer-name {
                font-weight: 500;
                color: #303133;
                margin-bottom: 4px;
              }

              .view-time {
                font-size: 12px;
                color: #909399;
              }
            }

            .view-work {
              font-size: 12px;
              color: #606266;
              max-width: 100px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }
        }
      }
    }

    .portfolio-right {
      flex: 1;

      .portfolio-action-card {
        margin-bottom: 20px;

        .action-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;

          .search-filter {
            display: flex;
            align-items: center;
          }

          .action-buttons {
            display: flex;
            gap: 12px;
          }
        }

        .view-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .sort-options {
            display: flex;
            align-items: center;
          }
        }
      }

      .portfolio-list-card {
        .grid-view {
          .portfolio-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 20px;

            .work-item {
              background: white;
              border-radius: 8px;
              overflow: hidden;
              transition: all 0.3s;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

              &:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
              }

              &.is-featured {
                border-top: 3px solid #e6a23c;
              }

              .work-cover {
                position: relative;
                height: 180px;
                overflow: hidden;
                cursor: pointer;

                img {
                  width: 100%;
                  height: 100%;
                  object-fit: cover;
                }

                .cover-placeholder {
                  width: 100%;
                  height: 100%;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  background-color: #f8f9fa;
                  color: #909399;

                  .placeholder-icon {
                    font-size: 48px;
                    margin-bottom: 8px;
                  }

                  .placeholder-text {
                    font-size: 24px;
                  }
                }

                .work-overlay {
                  position: absolute;
                  top: 0;
                  left: 0;
                  right: 0;
                  bottom: 0;
                  background: rgba(0, 0, 0, 0.7);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  opacity: 0;
                  transition: opacity 0.3s;

                  .overlay-actions {
                    display: flex;
                    gap: 12px;
                  }
                }

                &:hover .work-overlay {
                  opacity: 1;
                }

                .work-badges {
                  position: absolute;
                  top: 12px;
                  right: 12px;
                  display: flex;
                  flex-direction: column;
                  gap: 4px;
                }
              }

              .work-info {
                padding: 16px;

                .work-title {
                  font-size: 16px;
                  font-weight: 600;
                  color: #303133;
                  margin-bottom: 8px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                }

                .work-category {
                  font-size: 12px;
                  color: #909399;
                  margin-bottom: 12px;
                }

                .work-stats {
                  display: flex;
                  justify-content: space-between;
                  font-size: 12px;
                  color: #606266;

                  .stat {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                  }
                }
              }
            }
          }
        }

        .list-view {
          .portfolio-list {
            .work-list-item {
              display: flex;
              padding: 20px;
              background: white;
              border-radius: 8px;
              margin-bottom: 16px;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              transition: all 0.3s;

              &:hover {
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
              }

              .work-thumbnail {
                width: 120px;
                height: 80px;
                border-radius: 6px;
                overflow: hidden;
                margin-right: 20px;

                img {
                  width: 100%;
                  height: 100%;
                  object-fit: cover;
                }

                .thumbnail-placeholder {
                  width: 100%;
                  height: 100%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  background-color: #f8f9fa;
                  color: #909399;

                  .el-icon {
                    font-size: 32px;
                  }
                }
              }

              .work-details {
                flex: 1;

                .work-header {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  margin-bottom: 8px;

                  .work-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: #303133;
                  }

                  .work-actions {
                    display: flex;
                    gap: 8px;

                    .delete-btn {
                      color: #f56c6c;
                    }
                  }
                }

                .work-description {
                  color: #606266;
                  line-height: 1.5;
                  margin-bottom: 12px;
                  overflow: hidden;
                  display: -webkit-box;
                  -webkit-line-clamp: 2;
                  -webkit-box-orient: vertical;
                }

                .work-meta {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  margin-bottom: 12px;

                  .meta-tags {
                    display: flex;
                    gap: 8px;
                  }

                  .meta-stats {
                    display: flex;
                    gap: 16px;
                    font-size: 12px;
                    color: #909399;

                    .stat {
                      display: flex;
                      align-items: center;
                      gap: 4px;
                    }
                  }
                }

                .work-links {
                  display: flex;
                  gap: 16px;
                }
              }
            }
          }
        }

        .empty-state {
          text-align: center;
          padding: 60px 0;
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
        color: #005BAC;
      }
    }
  }

  .cover-uploader {
    :deep(.el-upload) {
      border: 1px dashed #d9d9d9;
      border-radius: 6px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: all 0.3s;
      width: 200px;
      height: 120px;

      &:hover {
        border-color: #005BAC;
      }

      .cover-preview {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .cover-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #8c939d;

        .upload-icon {
          font-size: 28px;
          margin-bottom: 8px;
        }

        .upload-text {
          font-size: 14px;
        }
      }
    }
  }

  .work-detail {
    .detail-cover {
      width: 100%;
      height: 300px;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 20px;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .cover-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #f8f9fa;
        color: #909399;

        .el-icon {
          font-size: 64px;
        }
      }
    }

    .detail-info {
      .detail-meta {
        margin-bottom: 16px;

        .el-tag {
          margin-right: 8px;
        }
      }

      .detail-description {
        font-size: 16px;
        line-height: 1.6;
        color: #303133;
        margin-bottom: 20px;
      }

      .detail-tech {
        display: flex;
        align-items: center;
        margin-bottom: 16px;

        .tech-label {
          font-weight: 600;
          color: #303133;
          margin-right: 12px;
        }

        .tech-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
      }

      .detail-role {
        display: flex;
        align-items: center;
        margin-bottom: 20px;

        .role-label {
          font-weight: 600;
          color: #303133;
          margin-right: 12px;
        }

        .role-text {
          color: #606266;
        }
      }

      .detail-links {
        margin-bottom: 20px;

        .el-link {
          margin-right: 16px;
        }
      }

      .detail-stats {
        display: flex;
        gap: 32px;

        .stat-item {
          text-align: center;

          .stat-label {
            font-size: 12px;
            color: #909399;
            margin-bottom: 4px;
          }

          .stat-value {
            font-size: 18px;
            font-weight: 600;
            color: #005BAC;
          }
        }
      }
    }
  }
}
</style> 