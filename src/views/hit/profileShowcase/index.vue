<template>
  <div class="profile-showcase-container">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="floating-shape shape-1"></div>
      <div class="floating-shape shape-2"></div>
      <div class="floating-shape shape-3"></div>
      <div class="floating-shape shape-4"></div>
    </div>

    <div class="profile-showcase">
      <!-- 页面头部 -->
      <div class="page-header">
        <h1 class="page-title">资料展示</h1>
        <p class="page-subtitle">展示您的个人风采，让世界看见您的才华</p>
      </div>

      <!-- 主要内容区域 -->
      <div class="showcase-content" v-loading="loading" element-loading-text="正在加载数据...">
        <!-- 左侧个人信息 -->
        <div class="personal-info glass-card">
          <div class="avatar-section">
            <img 
              :src="finalAvatarUrl" 
              :alt="userProfile.realName || '用户头像'" 
              class="avatar"
              @error="handleAvatarError"
            />
            <h2 class="user-name">{{ userProfile.realName || '未设置姓名' }}</h2>
            <p class="user-title">{{ userProfile.major || '专业' }} · {{ userProfile.college || '学院' }}</p>
          </div>

          <div class="info-list">
            <div class="info-item">
              <div class="info-icon">🎓</div>
              <div class="info-text">{{ userProfile.college || '未设置学院' }} · {{ userProfile.grade || '未设置年级' }}</div>
            </div>
            <div class="info-item" v-if="userProfile.email">
              <div class="info-icon">📧</div>
              <div class="info-text">{{ userProfile.email }}</div>
            </div>
            <div class="info-item" v-if="userProfile.phone">
              <div class="info-icon">📱</div>
              <div class="info-text">{{ userProfile.phone }}</div>
            </div>
            <div class="info-item" v-if="userProfile.github">
              <div class="info-icon">🌐</div>
              <div class="info-text">{{ userProfile.github }}</div>
            </div>
            <div class="info-item" v-if="userProfile.linkedin">
              <div class="info-icon">💼</div>
              <div class="info-text">{{ userProfile.linkedin }}</div>
            </div>
            <div class="info-item" v-if="userProfile.reputationScore">
              <div class="info-icon">🏆</div>
              <div class="info-text">声誉积分: {{ userProfile.reputationScore }}</div>
            </div>
          </div>
        </div>

        <!-- 中间主要展示区域 -->
        <div class="main-showcase glass-card">
          <div class="showcase-tabs">
            <div 
              class="tab-item" 
              :class="{ active: activeTab === 'portfolio' }"
              @click="switchTab('portfolio')"
            >
              作品集
            </div>
            <div 
              class="tab-item" 
              :class="{ active: activeTab === 'skills' }"
              @click="switchTab('skills')"
            >
              技能专长
            </div>
            <div 
              class="tab-item" 
              :class="{ active: activeTab === 'projects' }"
              @click="switchTab('projects')"
            >
              参与项目
            </div>
          </div>

          <!-- 作品集内容 -->
          <div class="tab-content" v-show="activeTab === 'portfolio'">
            <div class="portfolio-showcase" v-if="portfolioList.length > 0">
              <!-- 作品集网格展示 -->
              <div class="portfolio-grid">
                <div
                  v-for="work in portfolioList"
                  :key="work.portfolioId"
                  class="work-showcase-item"
                  @click="handleViewPortfolioDetail(work)"
                >
                  <!-- 作品封面 -->
                  <div class="work-cover">
                    <img v-if="work.coverImage" :src="work.coverImage" :alt="work.portfolioTitle" />
                    <div v-else class="cover-placeholder">
                      <el-icon class="placeholder-icon"><Document /></el-icon>
                      <div class="placeholder-text">{{ getPortfolioIcon(work.portfolioType) }}</div>
                    </div>

                    <!-- 悬浮操作 -->
                    <div class="work-overlay">
                      <div class="overlay-actions">
                        <el-button circle size="small" @click.stop="handleViewPortfolioDetail(work)">
                          <el-icon><View /></el-icon>
                        </el-button>
                      </div>
                    </div>

                    <!-- 作品标签 -->
                    <div class="work-badges">
                      <el-tag v-if="work.isPublic === '1'" type="success" size="small">公开</el-tag>
                      <el-tag v-if="work.portfolioType" size="small">{{ getPortfolioTypeLabel(work.portfolioType) }}</el-tag>
                    </div>
                  </div>

                  <!-- 作品信息 -->
                  <div class="work-info">
                    <div class="work-title">{{ work.portfolioTitle }}</div>
                    <div class="work-description">{{ work.portfolioDescription || '暂无描述' }}</div>
                    <div class="work-stats">
                      <span class="stat">
                        <el-icon><View /></el-icon>
                        {{ work.viewCount || 0 }}
                      </span>
                      <span class="stat">
                        <el-icon><Star /></el-icon>
                        {{ work.likeCount || 0 }}
                      </span>
                      <span class="stat">
                        <el-icon><Timer /></el-icon>
                        {{ formatDate(work.createTime) }}
                      </span>
                    </div>

                    <!-- 技术标签 -->
                    <div class="work-tags" v-if="work.tags">
                      <el-tag
                        v-for="tag in getPortfolioTags(work.tags)"
                        :key="tag"
                        size="small"
                        style="margin-right: 4px; margin-bottom: 4px;"
                      >
                        {{ tag }}
                      </el-tag>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="empty-state">
              <el-empty description="暂无作品集数据" />
              <el-button type="primary" @click="router.push('/profile/userPortfolio')" style="margin-top: 16px;">
                管理作品集
              </el-button>
            </div>

            
          </div>

          <!-- 技能专长内容 -->
          <div class="tab-content" v-show="activeTab === 'skills'">
            <div class="skills-section" v-if="skillCategories.length > 0">
              <div v-for="category in skillCategories" :key="category.name" class="skill-category-section">
                <h3 class="skills-category">{{ category.icon }} {{ category.name }}</h3>
                <div class="skills-container">
                  <div 
                    v-for="skill in category.skills" 
                    :key="skill.userSkillId || skill.skillName" 
                    class="skill-tag"
                    :class="getSkillLevelClass(skill.skillLevel)"
                  >
                    {{ skill.skillName }}
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <el-empty description="暂无技能数据" />
            </div>
          </div>

          <!-- 参与项目内容 -->
          <div class="tab-content" v-show="activeTab === 'projects'">
            <div class="projects-grid" v-if="projectList.length > 0">
              <div 
                v-for="project in projectList" 
                :key="project.projectId" 
                class="project-item"
                @click="viewProject(project)"
              >
                <h3 class="project-title">{{ getProjectIcon(project.projectType) }} {{ project.projectName }}</h3>
                <p class="project-desc">{{ project.projectDescription }}</p>
                <div class="project-meta">
                  <span class="project-status" :class="getProjectStatusClass(project.status)">
                    {{ getProjectStatusText(project.status) }}
                  </span>
                  <span class="project-members">👥 {{ project.currentMembers || 0 }}/{{ project.teamSizeMax || 0 }}</span>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <el-empty description="暂无项目数据" />
            </div>
          </div>
        </div>

        <!-- 右侧统计信息 -->
        <div class="stats-panel">
          <div class="stat-card glass-card">
            <div class="stat-icon">🚀</div>
            <div class="stat-number">{{ stats.totalProjects }}</div>
            <div class="stat-label">完成项目</div>
          </div>
          <div class="stat-card glass-card">
            <div class="stat-icon">📁</div>
            <div class="stat-number">{{ stats.totalPortfolios }}</div>
            <div class="stat-label">作品集</div>
          </div>
          <div class="stat-card glass-card">
            <div class="stat-icon">🏷️</div>
            <div class="stat-number">{{ stats.totalSkills }}</div>
            <div class="stat-label">技能标签</div>
          </div>
          <div class="stat-card glass-card">
            <div class="stat-icon">👁️</div>
            <div class="stat-number">{{ stats.totalViews }}</div>
            <div class="stat-label">总浏览量</div>
          </div>
          <div class="stat-card glass-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-number">{{ userProfile.reputationScore || 0 }}</div>
            <div class="stat-label">声誉积分</div>
          </div>
          <div class="stat-card glass-card">
            <div class="stat-icon">👥</div>
            <div class="stat-number">{{ stats.totalLikes }}</div>
            <div class="stat-label">获赞数</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 作品集详情弹窗 - 使用Teleport避免Transition警告 -->
    <Teleport to="body">
      <el-dialog v-model="portfolioDetailVisible" :title="currentPortfolio?.portfolioTitle" width="900px">
        <div v-if="currentPortfolio" class="portfolio-detail">
          <!-- 作品封面 -->
          <div class="detail-cover">
            <img v-if="currentPortfolio.coverImage" :src="currentPortfolio.coverImage" :alt="currentPortfolio.portfolioTitle" />
            <div v-else class="cover-placeholder">
              <el-icon><Document /></el-icon>
            </div>
          </div>

          <!-- 作品信息 -->
          <div class="detail-info">
            <!-- 标签信息 -->
            <div class="detail-meta">
              <el-tag>{{ getPortfolioTypeLabel(currentPortfolio.portfolioType) }}</el-tag>
              <el-tag v-if="currentPortfolio.isPublic === '1'" type="success">公开作品</el-tag>
            </div>

            <!-- 作品描述 -->
            <div class="detail-description">
              {{ currentPortfolio.portfolioDescription || '暂无描述' }}
            </div>

            <!-- 作品内容 -->
            <div v-if="currentPortfolio.portfolioContent" class="detail-content">
              <div class="content-label">作品详情：</div>
              <div class="content-text" v-html="currentPortfolio.portfolioContent"></div>
            </div>

            <!-- 技术标签 -->
            <div v-if="currentPortfolio.tags" class="detail-tech">
              <div class="tech-label">技术标签：</div>
              <div class="tech-tags">
                <el-tag
                  v-for="tag in getPortfolioTags(currentPortfolio.tags)"
                  :key="tag"
                  size="small"
                  style="margin-right: 8px; margin-bottom: 8px;"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </div>

            <!-- 附件链接 -->
            <div v-if="currentPortfolio.attachments" class="detail-attachments">
              <div class="attachments-label">相关链接：</div>
              <div class="attachments-links">
                <el-link :href="currentPortfolio.attachments" target="_blank" type="primary">
                  <el-icon><View /></el-icon>
                  查看附件
                </el-link>
              </div>
            </div>

            <!-- 统计信息 -->
            <div class="detail-stats">
              <div class="stat-item">
                <div class="stat-label">浏览量</div>
                <div class="stat-value">{{ currentPortfolio.viewCount || 0 }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">点赞数</div>
                <div class="stat-value">{{ currentPortfolio.likeCount || 0 }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">创建时间</div>
                <div class="stat-value">{{ formatDate(currentPortfolio.createTime) }}</div>
              </div>
            </div>
          </div>
        </div>
      </el-dialog>
    </Teleport>
  </div>
</template>

<script setup lang="ts" name="ProfileShowcase">
import { ref, reactive, computed, onMounted, onUnmounted, onBeforeUnmount, nextTick } from 'vue'
import { ElMessage, ElEmpty } from 'element-plus'
import { useRouter } from 'vue-router'
import {
  Document,
  View,
  Star,
  Timer
} from '@element-plus/icons-vue'
import {
  getCurrentUserProfile,
  type UserProfileInfo
} from '@/api/hit/userProfile'
import {
  getCurrentUserPortfolios,
  type UserPortfolioForm
} from '@/api/hit/userPortfolio'
import {
  getUserSkillsWithTag
} from '@/api/hit/userSkill'
import {
  listMyProject,
  type ProjectInfo
} from '@/api/hit/project'
import { useUserStore } from '@/store/modules/user'
import defaultAvatar from '@/assets/logo/鼠鼠.png'

// 用户store和路由
const userStore = useUserStore()
const router = useRouter()

// 响应式数据
const loading = ref(false)
const activeTab = ref('portfolio')
const avatarError = ref(false)

// 组件状态管理
const isUnmounted = ref(false)
const isInitializing = ref(false)
const hasInitialized = ref(false)

// 用于取消正在进行的异步操作
let abortController: AbortController | null = null

// 用户档案数据
const userProfile = reactive<UserProfileInfo>({
  realName: '',
  college: '',
  major: '',
  grade: '',
  email: '',
  phone: '',
  github: '',
  linkedin: '',
  avatarUrl: '',
  reputationScore: 0
})

// 作品集数据
const portfolioList = ref<ExtendedPortfolioForm[]>([])

// 技能数据
const skillList = ref<any[]>([])

// 项目数据
const projectList = ref<ProjectInfo[]>([])

// 统计数据
const stats = reactive({
  totalProjects: 0,
  totalPortfolios: 0,
  totalSkills: 0,
  totalViews: 0,
  totalLikes: 0
})

// 计算属性
const finalAvatarUrl = computed(() => {
  if (userProfile.avatarUrl && !avatarError.value) {
    return userProfile.avatarUrl
  }
  return defaultAvatar
})

// 技能分类 - 使用缓存避免重复计算
const skillCategories = computed(() => {
  // 如果没有技能数据，直接返回空数组
  if (!skillList.value || skillList.value.length === 0) {
    return []
  }

  try {
    const categories = [
      { name: '前端开发', icon: '💻', skills: [] as any[] },
      { name: '后端开发', icon: '🔧', skills: [] as any[] },
      { name: '数据库与工具', icon: '🗄️', skills: [] as any[] },
      { name: 'AI与数据科学', icon: '🤖', skills: [] as any[] },
      { name: '设计与管理', icon: '🎨', skills: [] as any[] }
    ]

    // 安全地处理技能分类
    for (const skill of skillList.value) {
      if (!skill) continue

      const skillName = skill.skillName || skill.tagName || ''
      if (!skillName) continue

      try {
        if (isFrontendSkill(skillName)) {
          categories[0].skills.push(skill)
        } else if (isBackendSkill(skillName)) {
          categories[1].skills.push(skill)
        } else if (isDatabaseSkill(skillName)) {
          categories[2].skills.push(skill)
        } else if (isAISkill(skillName)) {
          categories[3].skills.push(skill)
        } else {
          categories[4].skills.push(skill)
        }
      } catch (error) {
        console.warn('技能分类处理错误:', error, skill)
      }
    }

    return categories.filter(category => category.skills.length > 0)
  } catch (error) {
    console.error('技能分类计算错误:', error)
    return []
  }
})

// 方法
const handleAvatarError = () => {
  avatarError.value = true
}

const switchTab = (tab: string) => {
  activeTab.value = tab
}

// 获取作品集图标
const getPortfolioIcon = (type: string) => {
  const icons: Record<string, string> = {
    'web': '🌐',
    'mobile': '📱',
    'desktop': '💻',
    'ai': '🤖',
    'blockchain': '🔐',
    'game': '🎮',
    'design': '🎨',
    'other': '📄'
  }
  return icons[type] || '📄'
}

// 获取作品集标签
const getPortfolioTags = (tags?: string) => {
  if (!tags) return []
  return tags.split(',').slice(0, 3) // 最多显示3个标签
}

// 获取项目图标
const getProjectIcon = (type: string) => {
  const icons: Record<string, string> = {
    'web': '🌐',
    'mobile': '📱',
    'ai': '🤖',
    'blockchain': '🔐',
    'game': '🎮',
    'research': '🔬',
    'competition': '🏆',
    'other': '📋'
  }
  return icons[type] || '📋'
}

// 获取项目状态样式类
const getProjectStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    'active': 'status-active',
    'completed': 'status-completed',
    'paused': 'status-paused',
    'cancelled': 'status-cancelled'
  }
  return classes[status] || 'status-default'
}

// 获取项目状态文本
const getProjectStatusText = (status: string) => {
  const texts: Record<string, string> = {
    'active': '进行中',
    'completed': '已完成',
    'paused': '暂停',
    'cancelled': '已取消'
  }
  return texts[status] || '未知'
}

// 获取技能等级样式类
const getSkillLevelClass = (level: number) => {
  if (level >= 80) return 'skill-expert'
  if (level >= 60) return 'skill-advanced'
  if (level >= 40) return 'skill-intermediate'
  return 'skill-beginner'
}

// 技能分类判断函数
const isFrontendSkill = (skillName: string) => {
  const frontendSkills = ['Vue', 'React', 'Angular', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Webpack', 'Vite']
  return frontendSkills.some(skill => skillName.toLowerCase().includes(skill.toLowerCase()))
}

const isBackendSkill = (skillName: string) => {
  const backendSkills = ['Node.js', 'Python', 'Java', 'Spring', 'Express', 'Django', 'Flask', 'Go', 'PHP']
  return backendSkills.some(skill => skillName.toLowerCase().includes(skill.toLowerCase()))
}

const isDatabaseSkill = (skillName: string) => {
  const databaseSkills = ['MySQL', 'Redis', 'MongoDB', 'PostgreSQL', 'Git', 'Docker', 'Linux', 'AWS']
  return databaseSkills.some(skill => skillName.toLowerCase().includes(skill.toLowerCase()))
}

const isAISkill = (skillName: string) => {
  const aiSkills = ['机器学习', '深度学习', '数据分析', 'TensorFlow', 'PyTorch', 'NLP', 'AI', '人工智能']
  return aiSkills.some(skill => skillName.toLowerCase().includes(skill.toLowerCase()))
}

// 扩展的作品集类型，包含createTime
interface ExtendedPortfolioForm extends UserPortfolioForm {
  createTime?: string
}

// 作品集详情弹窗相关
const portfolioDetailVisible = ref(false)
const currentPortfolio = ref<ExtendedPortfolioForm | null>(null)

// 查看作品集详情
const handleViewPortfolioDetail = async (portfolio: ExtendedPortfolioForm) => {
  currentPortfolio.value = portfolio
  portfolioDetailVisible.value = true

  // 增加浏览次数（如果需要的话）
  try {
    // 这里可以调用增加浏览次数的API
    // await increaseViewCount(portfolio.portfolioId)
  } catch (error) {
    console.error('增加浏览次数失败:', error)
  }
}

// 获取作品集类型标签
const getPortfolioTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    'web': 'Web项目',
    'mobile': '移动应用',
    'ai': 'AI项目',
    'design': '设计作品',
    'academic': '学术成果',
    'media': '媒体作品',
    'project': '项目作品'
  }
  return typeMap[type] || type
}

// 格式化日期
const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return '未知时间'
  return new Date(dateStr).toLocaleDateString()
}

// 查看项目详情
const viewProject = (project: ProjectInfo) => {
  // 这里可以跳转到项目详情页面
  ElMessage.info(`查看项目: ${project.projectName}`)
}

// 获取用户档案数据
const fetchUserProfile = async () => {
  // 检查组件状态
  if (isUnmounted.value || abortController?.signal.aborted) return

  try {
    const response = await getCurrentUserProfile()
    // 检查组件是否已卸载或操作被取消
    if (isUnmounted.value || abortController?.signal.aborted) return

    if (response.data) {
      Object.assign(userProfile, response.data)
    }
  } catch (error) {
    // 检查组件是否已卸载或操作被取消
    if (isUnmounted.value || abortController?.signal.aborted) return

    console.error('ProfileShowcase: 获取用户档案失败:', error)
    // 使用模拟数据
    Object.assign(userProfile, {
      realName: '张明轩',
      college: '计算机科学与技术学院',
      major: '计算机科学与技术',
      grade: '2021级',
      email: 'zhangmx@hit.edu.cn',
      phone: '+86 138-0451-****',
      github: 'github.com/zhangmingxuan',
      linkedin: 'HIT创新实验室 · 前端负责人',
      avatarUrl: '',
      reputationScore: 2850
    })
  }
}

// 获取作品集数据
const fetchPortfolios = async () => {
  // 检查组件状态
  if (isUnmounted.value || abortController?.signal.aborted) return

  try {
    console.log('ProfileShowcase: 开始获取作品集数据...')
    const response = await getCurrentUserPortfolios()

    // 检查组件是否已卸载或操作被取消
    if (isUnmounted.value || abortController?.signal.aborted) return

    console.log('ProfileShowcase: 作品集API响应:', response)

    if (response && response.code === 200) {
      // 处理API返回的数据格式
      if (response.rows && Array.isArray(response.rows)) {
        portfolioList.value = response.rows.map((item: any) => ({
          portfolioId: item.portfolioId,
          portfolioTitle: item.portfolioTitle,
          portfolioDescription: item.portfolioDescription,
          portfolioContent: item.portfolioContent || '',
          portfolioType: item.portfolioType || item.workType || 'web',
          tags: item.tags,
          isPublic: item.isPublic || '1',
          allowComments: item.allowComments || '1',
          viewCount: item.viewCount || 0,
          likeCount: item.likeCount || 0,
          coverImage: item.coverImage,
          attachments: item.attachments,
          status: item.status,
          createTime: item.createTime
        }))
        stats.totalPortfolios = response.total || portfolioList.value.length
      } else if (response.data && Array.isArray(response.data)) {
        // 处理另一种可能的数据格式
        portfolioList.value = response.data.map((item: any) => ({
          portfolioId: item.portfolioId,
          portfolioTitle: item.portfolioTitle,
          portfolioDescription: item.portfolioDescription,
          portfolioContent: item.portfolioContent || '',
          portfolioType: item.portfolioType || item.workType || 'web',
          tags: item.tags,
          isPublic: item.isPublic || '1',
          allowComments: item.allowComments || '1',
          viewCount: item.viewCount || 0,
          likeCount: item.likeCount || 0,
          coverImage: item.coverImage,
          attachments: item.attachments,
          status: item.status,
          createTime: item.createTime
        }))
        stats.totalPortfolios = portfolioList.value.length
      } else {
        console.warn('作品集数据格式不正确:', response)
        portfolioList.value = []
        stats.totalPortfolios = 0
      }

      // 计算统计数据
      stats.totalViews = portfolioList.value.reduce((sum, item) => sum + (item.viewCount || 0), 0)
      stats.totalLikes = portfolioList.value.reduce((sum, item) => sum + (item.likeCount || 0), 0)

      console.log('ProfileShowcase: 作品集数据加载完成:', portfolioList.value)
    } else {
      console.warn('ProfileShowcase: 获取作品集数据失败:', response?.msg || '未知错误')
      portfolioList.value = []
      stats.totalPortfolios = 0
      stats.totalViews = 0
      stats.totalLikes = 0
    }
  } catch (error) {
    // 检查组件是否已卸载或操作被取消
    if (isUnmounted.value || abortController?.signal.aborted) return

    console.error('ProfileShowcase: 获取作品集失败:', error)
    // 清空数据而不是使用模拟数据
    portfolioList.value = []
    stats.totalPortfolios = 0
    stats.totalViews = 0
    stats.totalLikes = 0
  }
}

// 获取技能数据
const fetchSkills = async () => {
  // 检查组件状态
  if (isUnmounted.value || abortController?.signal.aborted) return

  try {
    // 使用当前登录用户的ID
    const currentUserId = userStore.userId;
    if (!currentUserId) {
      console.warn('ProfileShowcase: 用户未登录，无法获取技能数据');
      skillList.value = [];
      stats.totalSkills = 0;
      return;
    }

    const response = await getUserSkillsWithTag(currentUserId);

    // 检查组件是否已卸载或操作被取消
    if (isUnmounted.value || abortController?.signal.aborted) return

    if (response.code === 200 && response.data && Array.isArray(response.data)) {
      // 转换数据格式以适配现有的显示逻辑
      skillList.value = response.data.map((skill: any) => ({
        skillName: skill.tagName || skill.skillName,
        skillLevel: skill.skillLevel || 0,
        tagCategory: skill.tagCategory,
        userSkillId: skill.userSkillId
      }));
      stats.totalSkills = skillList.value.length;
    } else {
      console.warn('ProfileShowcase: 技能数据格式不正确或为空:', response);
      skillList.value = [];
      stats.totalSkills = 0;
    }
  } catch (error) {
    // 检查组件是否已卸载或操作被取消
    if (isUnmounted.value || abortController?.signal.aborted) return

    console.error('ProfileShowcase: 获取技能数据失败:', error);
    // 如果获取失败，显示空数据而不是模拟数据
    skillList.value = [];
    stats.totalSkills = 0;
  }
}

// 获取项目数据
const fetchProjects = async () => {
  // 检查组件状态
  if (isUnmounted.value || abortController?.signal.aborted) return

  try {
    const response = await listMyProject({ pageNum: 1, pageSize: 20 })

    // 检查组件是否已卸载或操作被取消
    if (isUnmounted.value || abortController?.signal.aborted) return

    if (response && response.code === 200) {
      // 处理API返回的数据格式
      if (response.rows && Array.isArray(response.rows)) {
        projectList.value = response.rows
        stats.totalProjects = response.total || projectList.value.length
      } else if (response.data && Array.isArray(response.data)) {
        projectList.value = response.data
        stats.totalProjects = projectList.value.length
      } else {
        console.warn('ProfileShowcase: 项目数据格式不正确:', response)
        projectList.value = []
        stats.totalProjects = 0
      }
      console.log('ProfileShowcase: 项目数据加载完成:', projectList.value)
    } else {
      console.warn('ProfileShowcase: 获取项目数据失败:', response?.msg || '未知错误')
      projectList.value = []
      stats.totalProjects = 0
    }
  } catch (error) {
    // 检查组件是否已卸载或操作被取消
    if (isUnmounted.value || abortController?.signal.aborted) return

    console.error('ProfileShowcase: 获取项目数据失败:', error)
    // 清空数据而不是使用模拟数据
    projectList.value = []
    stats.totalProjects = 0
  }
}

// 初始化数据
const initData = async () => {
  // 防止重复初始化
  if (isInitializing.value || hasInitialized.value || isUnmounted.value) {
    return
  }

  // 取消之前的异步操作
  if (abortController) {
    abortController.abort()
  }
  abortController = new AbortController()

  isInitializing.value = true
  loading.value = true

  try {
    console.log('ProfileShowcase: 开始初始化数据...')

    // 检查组件是否已卸载
    if (isUnmounted.value || abortController.signal.aborted) return

    // 获取用户档案
    await fetchUserProfile()

    // 检查组件是否已卸载
    if (isUnmounted.value || abortController.signal.aborted) return

    // 使用 Promise.allSettled 而不是 Promise.all，避免单个请求失败影响整体
    const results = await Promise.allSettled([
      fetchPortfolios(),
      fetchSkills(),
      fetchProjects()
    ])

    // 检查组件是否已卸载
    if (isUnmounted.value || abortController.signal.aborted) return

    // 记录结果
    results.forEach((result, index) => {
      const names = ['作品集', '技能', '项目']
      if (result.status === 'rejected') {
        console.warn(`ProfileShowcase: ${names[index]}数据获取失败:`, result.reason)
      }
    })

    hasInitialized.value = true
    console.log('ProfileShowcase: 数据初始化完成')
  } catch (error) {
    if (!abortController?.signal.aborted) {
      console.error('ProfileShowcase: 初始化数据失败:', error)
    }
  } finally {
    isInitializing.value = false
    // 检查组件是否已卸载
    if (!isUnmounted.value && !abortController?.signal.aborted) {
      loading.value = false
    }
  }
}

// 清理函数
const cleanup = () => {
  console.log('ProfileShowcase: 执行清理操作')

  // 取消所有异步操作
  if (abortController) {
    abortController.abort()
    abortController = null
  }

  // 设置卸载标志
  isUnmounted.value = true
  isInitializing.value = false
  hasInitialized.value = false

  // 清理UI状态
  loading.value = false
  portfolioDetailVisible.value = false
  currentPortfolio.value = null

  // 清理数据
  portfolioList.value = []
  skillList.value = []
  projectList.value = []

  // 重置统计数据
  stats.totalProjects = 0
  stats.totalPortfolios = 0
  stats.totalSkills = 0
  stats.totalViews = 0
  stats.totalLikes = 0

  // 重置用户档案
  Object.assign(userProfile, {
    realName: '',
    college: '',
    major: '',
    grade: '',
    email: '',
    phone: '',
    github: '',
    linkedin: '',
    avatarUrl: '',
    reputationScore: 0
  })
}

// 生命周期
onMounted(async () => {
  console.log('ProfileShowcase: 组件挂载')
  isUnmounted.value = false
  isInitializing.value = false
  hasInitialized.value = false

  // 使用 nextTick 确保DOM已经渲染完成
  await nextTick()

  // 延迟初始化，避免与路由切换冲突
  setTimeout(() => {
    if (!isUnmounted.value) {
      initData()
    }
  }, 50)
})

onBeforeUnmount(() => {
  console.log('ProfileShowcase: 组件即将卸载')
  cleanup()
})

onUnmounted(() => {
  console.log('ProfileShowcase: 组件已卸载')
  // 确保清理操作已执行
  if (!isUnmounted.value) {
    cleanup()
  }
})
</script>

<style scoped lang="scss">
.profile-showcase-container {
  min-height: calc(100vh - 84px);
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 75%, #0f3460 100%);
  color: #ffffff;
  overflow-x: hidden;
  position: relative;
}

/* 背景装饰元素 */
.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.floating-shape {
  position: absolute;
  background: linear-gradient(45deg, rgba(64, 158, 255, 0.1), rgba(103, 194, 58, 0.1));
  backdrop-filter: blur(10px);
  animation: float 8s ease-in-out infinite;
  border: 1px solid rgba(64, 158, 255, 0.2);
}

.shape-1 {
  width: 120px; height: 120px; top: 10%; left: 5%;
  border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
  animation-delay: 0s;
}
.shape-2 {
  width: 80px; height: 80px; top: 20%; right: 10%;
  border-radius: 50%;
  animation-delay: 2s;
}
.shape-3 {
  width: 150px; height: 150px; bottom: 15%; left: 8%;
  border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
  animation-delay: 4s;
}
.shape-4 {
  width: 100px; height: 100px; bottom: 25%; right: 15%;
  border-radius: 40% 60% 60% 40% / 60% 30% 70% 40%;
  animation-delay: 1s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-30px) rotate(180deg); }
}

/* 主容器 */
.profile-showcase {
  position: relative;
  z-index: 1;
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

/* 页面头部 */
.page-header {
  text-align: center;
  margin-bottom: 40px;
  animation: slideInDown 0.8s ease-out;
}

.page-title {
  font-size: 2.8rem;
  font-weight: 700;
  background: linear-gradient(135deg, #409eff 0%, #67c23a 50%, #e6a23c 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 10px;
  text-shadow: 0 0 30px rgba(64, 158, 255, 0.3);
}

.page-subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 400;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* 主要内容区域 */
.showcase-content {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 30px;
  margin-bottom: 40px;
}

/* 毛玻璃卡片基础样式 */
.glass-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(64, 158, 255, 0.2);
  padding: 30px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.glass-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(64, 158, 255, 0.6), transparent);
}

.glass-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.glass-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 60px rgba(64, 158, 255, 0.2);
  border-color: rgba(64, 158, 255, 0.4);
}

.glass-card:hover::after {
  opacity: 1;
}

/* 左侧个人信息卡片 */
.personal-info {
  animation: slideInLeft 0.8s ease-out;
}

.avatar-section {
  text-align: center;
  margin-bottom: 30px;
}

.avatar {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  border: 3px solid rgba(64, 158, 255, 0.4);
  object-fit: cover;
  transition: all 0.4s ease;
  animation: pulse 3s infinite;
  box-shadow: 0 0 30px rgba(64, 158, 255, 0.3);
}

.avatar:hover {
  transform: scale(1.08);
  border-color: rgba(64, 158, 255, 0.8);
  box-shadow: 0 0 50px rgba(64, 158, 255, 0.5);
}

@keyframes pulse {
  0% { box-shadow: 0 0 30px rgba(64, 158, 255, 0.3); }
  50% { box-shadow: 0 0 50px rgba(64, 158, 255, 0.5); }
  100% { box-shadow: 0 0 30px rgba(64, 158, 255, 0.3); }
}

.user-name {
  font-size: 1.8rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.user-title {
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 25px;
  font-size: 1.1rem;
  font-weight: 500;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding: 14px 16px;
  border-radius: 12px;
  background: rgba(64, 158, 255, 0.1);
  border: 1px solid rgba(64, 158, 255, 0.2);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.info-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(to bottom, #409eff, #67c23a);
  transform: scaleY(0);
  transition: transform 0.3s ease;
}

.info-item:hover {
  background: rgba(64, 158, 255, 0.15);
  transform: translateX(8px);
  border-color: rgba(64, 158, 255, 0.4);
}

.info-item:hover::before {
  transform: scaleY(1);
}

.info-icon {
  width: 24px;
  height: 24px;
  margin-right: 14px;
  font-size: 1.2rem;
  color: #409eff;
}

.info-text {
  color: #ffffff;
  font-size: 1rem;
  font-weight: 500;
}

/* 中间主要展示区域 */
.main-showcase {
  animation: slideInUp 0.8s ease-out;
}

.showcase-tabs {
  display: flex;
  margin-bottom: 30px;
  background: rgba(64, 158, 255, 0.1);
  border-radius: 16px;
  padding: 6px;
  border: 1px solid rgba(64, 158, 255, 0.2);
}

.tab-item {
  flex: 1;
  padding: 14px 24px;
  text-align: center;
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.4s ease;
  font-weight: 600;
  font-size: 1rem;
  position: relative;
  overflow: hidden;
}

.tab-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s ease;
}

.tab-item:hover::before {
  left: 100%;
}

.tab-item.active {
  background: linear-gradient(135deg, #409eff, #67c23a);
  color: white;
  transform: scale(1.02);
  box-shadow: 0 4px 20px rgba(64, 158, 255, 0.4);
}

.tab-content {
  min-height: 450px;
}

/* 作品集网格 */
.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.portfolio-item {
  background: rgba(64, 158, 255, 0.08);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.4s ease;
  cursor: pointer;
  border: 1px solid rgba(64, 158, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.portfolio-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.1), rgba(103, 194, 58, 0.1));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.portfolio-item:hover {
  transform: translateY(-6px);
  border-color: rgba(64, 158, 255, 0.4);
  box-shadow: 0 12px 40px rgba(64, 158, 255, 0.2);
}

.portfolio-item:hover::before {
  opacity: 1;
}

.portfolio-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 12px;
  position: relative;
  z-index: 1;
}

.portfolio-desc {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  line-height: 1.6;
  position: relative;
  z-index: 1;
  margin-bottom: 16px;
}

.portfolio-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid rgba(64, 158, 255, 0.2);
  position: relative;
  z-index: 1;
}

.meta-tags {
  display: flex;
  gap: 8px;
}

.meta-tag {
  background: rgba(64, 158, 255, 0.2);
  color: #409eff;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.meta-views {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  font-weight: 500;
}

/* 技能展示 */
.skills-section {
  padding: 10px 0;
}

.skill-category-section {
  margin-bottom: 30px;
}

.skills-category {
  color: #ffffff;
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0 0 15px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid rgba(64, 158, 255, 0.3);
  position: relative;
}

.skills-category::before {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, #409eff, #67c23a);
}

.skills-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.skill-tag {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.2), rgba(103, 194, 58, 0.2));
  color: #ffffff;
  padding: 12px 20px;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  border: 1px solid rgba(64, 158, 255, 0.3);
  transition: all 0.4s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.skill-tag::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.skill-tag:hover::before {
  left: 100%;
}

.skill-tag:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(64, 158, 255, 0.3);
  border-color: rgba(64, 158, 255, 0.6);
}

/* 技能等级样式 */
.skill-expert {
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.3), rgba(103, 194, 58, 0.2)) !important;
  border-color: rgba(103, 194, 58, 0.5) !important;
}

.skill-expert:hover {
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.5), rgba(103, 194, 58, 0.4)) !important;
  box-shadow: 0 8px 25px rgba(103, 194, 58, 0.3) !important;
}

.skill-advanced {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.3), rgba(64, 158, 255, 0.2)) !important;
  border-color: rgba(64, 158, 255, 0.5) !important;
}

.skill-intermediate {
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.3), rgba(230, 162, 60, 0.2)) !important;
  border-color: rgba(230, 162, 60, 0.5) !important;
}

.skill-beginner {
  background: linear-gradient(135deg, rgba(144, 147, 153, 0.3), rgba(144, 147, 153, 0.2)) !important;
  border-color: rgba(144, 147, 153, 0.5) !important;
}

/* 项目网格 */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.project-item {
  background: rgba(64, 158, 255, 0.08);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.4s ease;
  cursor: pointer;
  border: 1px solid rgba(64, 158, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.project-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.1), rgba(103, 194, 58, 0.1));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.project-item:hover {
  transform: translateY(-6px);
  border-color: rgba(64, 158, 255, 0.4);
  box-shadow: 0 12px 40px rgba(64, 158, 255, 0.2);
}

.project-item:hover::before {
  opacity: 1;
}

.project-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 12px;
  position: relative;
  z-index: 1;
}

.project-desc {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  line-height: 1.6;
  position: relative;
  z-index: 1;
  margin-bottom: 16px;
}

.project-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid rgba(64, 158, 255, 0.2);
  position: relative;
  z-index: 1;
}

.project-status {
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-active {
  background: rgba(103, 194, 58, 0.2);
  color: #67c23a;
  border: 1px solid rgba(103, 194, 58, 0.3);
}

.status-completed {
  background: rgba(64, 158, 255, 0.2);
  color: #409eff;
  border: 1px solid rgba(64, 158, 255, 0.3);
}

.status-paused {
  background: rgba(230, 162, 60, 0.2);
  color: #e6a23c;
  border: 1px solid rgba(230, 162, 60, 0.3);
}

.status-cancelled {
  background: rgba(245, 108, 108, 0.2);
  color: #f56c6c;
  border: 1px solid rgba(245, 108, 108, 0.3);
}

.project-members {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  font-weight: 500;
}

/* 右侧统计信息 */
.stats-panel {
  animation: slideInRight 0.8s ease-out;
}

.stat-card {
  background: rgba(64, 158, 255, 0.08);
  border-radius: 18px;
  padding: 25px;
  margin-bottom: 24px;
  text-align: center;
  transition: all 0.4s ease;
  border: 1px solid rgba(64, 158, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.1), rgba(103, 194, 58, 0.1));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-6px) scale(1.02);
  border-color: rgba(64, 158, 255, 0.4);
  box-shadow: 0 12px 40px rgba(64, 158, 255, 0.2);
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-icon {
  font-size: 1.5rem;
  margin-bottom: 8px;
  position: relative;
  z-index: 1;
}

.stat-number {
  font-size: 2.4rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 8px;
  position: relative;
  z-index: 1;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.stat-label {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  font-weight: 600;
  position: relative;
  z-index: 1;
}

/* 空状态 */
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

/* 动画定义 */
@keyframes slideInDown {
  from { opacity: 0; transform: translateY(-30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slideInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .showcase-content {
    grid-template-columns: 1fr 2fr;
  }

  .stats-panel {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
  }

  .stat-card {
    margin-bottom: 0;
  }
}

@media (max-width: 768px) {
  .profile-showcase {
    padding: 15px;
  }

  .showcase-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .portfolio-grid,
  .projects-grid {
    grid-template-columns: 1fr;
  }

  .page-title {
    font-size: 2rem;
  }

  .page-subtitle {
    font-size: 1rem;
  }

  .glass-card {
    padding: 20px;
  }

  .avatar {
    width: 100px;
    height: 100px;
  }

  .user-name {
    font-size: 1.5rem;
  }

  .showcase-tabs {
    flex-direction: column;
    gap: 5px;
  }

  .tab-item {
    padding: 12px 16px;
  }

  .stats-panel {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .profile-showcase {
    padding: 10px;
  }

  .page-title {
    font-size: 1.8rem;
  }

  .glass-card {
    padding: 15px;
  }

  .portfolio-item,
  .project-item {
    padding: 16px;
  }

  .portfolio-title,
  .project-title {
    font-size: 1.1rem;
  }

  .portfolio-desc,
  .project-desc {
    font-size: 0.9rem;
  }

  .stats-panel {
    grid-template-columns: 1fr;
  }

  .stat-number {
    font-size: 2rem;
  }
}

/* 新的作品集展示样式 */
.portfolio-showcase {
  .portfolio-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 24px;
    margin-top: 20px;
  }

  .work-showcase-item {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 16px;
    overflow: hidden;
    transition: all 0.3s ease;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    cursor: pointer;

    &:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    }

    .work-cover {
      position: relative;
      height: 200px;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
      }

      &:hover img {
        transform: scale(1.05);
      }

      .cover-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;

        .placeholder-icon {
          font-size: 48px;
          margin-bottom: 8px;
          opacity: 0.8;
        }

        .placeholder-text {
          font-size: 24px;
          opacity: 0.9;
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
        transition: opacity 0.3s ease;

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
        gap: 6px;
      }
    }

    .work-info {
      padding: 20px;

      .work-title {
        font-size: 1.2rem;
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 8px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .work-description {
        color: #7f8c8d;
        font-size: 0.9rem;
        line-height: 1.5;
        margin-bottom: 12px;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
      }

      .work-stats {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;
        font-size: 0.8rem;
        color: #95a5a6;

        .stat {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }

      .work-tags {
        margin-top: 8px;
      }
    }
  }
}

/* 作品集详情弹窗样式 */
.portfolio-detail {
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;

      .el-icon {
        font-size: 64px;
        opacity: 0.8;
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
      color: #2c3e50;
      margin-bottom: 20px;
    }

    .detail-content {
      margin-bottom: 20px;

      .content-label {
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 8px;
      }

      .content-text {
        color: #7f8c8d;
        line-height: 1.6;
      }
    }

    .detail-tech {
      display: flex;
      align-items: flex-start;
      margin-bottom: 16px;

      .tech-label {
        font-weight: 600;
        color: #2c3e50;
        margin-right: 12px;
        min-width: 80px;
      }

      .tech-tags {
        flex: 1;
      }
    }

    .detail-attachments {
      margin-bottom: 20px;

      .attachments-label {
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 8px;
      }

      .attachments-links {
        .el-link {
          margin-right: 16px;
        }
      }
    }

    .detail-stats {
      display: flex;
      gap: 32px;
      padding-top: 20px;
      border-top: 1px solid #ecf0f1;

      .stat-item {
        text-align: center;

        .stat-label {
          font-size: 12px;
          color: #95a5a6;
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 18px;
          font-weight: 600;
          color: #3498db;
        }
      }
    }
  }
}
</style>
