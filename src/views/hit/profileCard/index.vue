<template>
  <div class="profile-card-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-title">
        <el-icon class="title-icon"><Postcard /></el-icon>
        名片展示
      </div>
      <div class="page-description">使用多种模板展示您的个人名片，一键分享给他人</div>
    </div>

    <div class="card-content">
      <!-- 左侧模板选择 -->
      <div class="card-left">
        <!-- 模板库 -->
        <el-card class="template-library-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><Brush /></el-icon>
                模板库
              </span>
            </div>
          </template>

          <div class="template-grid">
            <div
              v-for="template in templates"
              :key="template.id"
              class="template-item"
              :class="{ 'active': selectedTemplate === template.id }"
              @click="selectTemplate(template.id)"
            >
              <div class="template-preview">
                <div class="preview-image" :style="`background: ${template.gradient}`">
                  <div class="preview-content">
                    <div class="preview-avatar">
                      <img v-if="shouldShowAvatarImage" :src="finalAvatarUrl" class="preview-avatar-img" alt="预览头像" />
                      <span v-else>{{ getUserInitial }}</span>
                    </div>
                    <div class="preview-name">{{ userInfo.realName || '姓名' }}</div>
                    <div class="preview-title">{{ userInfo.college || '学院' }}</div>
                  </div>
                </div>
              </div>
              <div class="template-info">
                <div class="template-name">{{ template.name }}</div>
                <div class="template-desc">{{ template.description }}</div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 自定义选项 -->
        <el-card class="custom-options-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><Setting /></el-icon>
                自定义选项
              </span>
            </div>
          </template>

          <div class="custom-form">
            <div class="form-item">
              <label class="form-label">主题色</label>
              <el-color-picker v-model="customOptions.primaryColor" @change="updatePreview" :predefine="predefineColors" size="small" />
            </div>

            <div class="form-item">
              <label class="form-label">背景样式</label>
              <el-select v-model="customOptions.backgroundStyle" @change="updatePreview" size="small">
                <el-option label="渐变色" value="gradient" />
                <el-option label="纯色" value="solid" />
                <el-option label="图案" value="pattern" />
              </el-select>
            </div>

            <div class="form-item">
              <label class="form-label">字体大小</label>
              <el-slider v-model="customOptions.fontSize" :min="12" :max="20" @change="updatePreview" size="small" />
            </div>

            <div class="form-item">
              <label class="form-label">显示头像</label>
              <el-switch v-model="customOptions.showAvatar" @change="updatePreview" size="small" />
            </div>

            <div class="form-item">
              <label class="form-label">显示二维码</label>
              <el-switch v-model="customOptions.showQRCode" @change="updatePreview" size="small" />
            </div>

            <div class="form-item">
              <label class="form-label">显示技能</label>
              <el-switch v-model="customOptions.showSkills" @change="updatePreview" size="small" />
            </div>
          </div>
        </el-card>

        <!-- 统计信息 -->
        <el-card class="stats-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><DataAnalysis /></el-icon>
                分享统计
              </span>
            </div>
          </template>

          <div class="stats-list">
            <div class="stat-item">
              <div class="stat-icon">
                <el-icon><View /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ shareStats.viewCount }}</div>
                <div class="stat-label">浏览量</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">
                <el-icon><Share /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ shareStats.shareCount }}</div>
                <div class="stat-label">分享次数</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">
                <el-icon><Download /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ shareStats.downloadCount }}</div>
                <div class="stat-label">下载次数</div>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 右侧名片预览 -->
      <div class="card-right">
        <!-- 操作栏 -->
        <div class="action-bar">
          <div class="action-left">
            <el-button @click="refreshPreview">
              <el-icon><Refresh /></el-icon>
              刷新预览
            </el-button>
            <el-button @click="resetToDefault">
              <el-icon><RefreshLeft /></el-icon>
              重置默认
            </el-button>
            <el-button @click="showDebugInfo" type="info" size="small">
              <el-icon><DataAnalysis /></el-icon>
              数据状态
            </el-button>
          </div>
          <div class="action-right">
            <el-button type="success" @click="handleShare">
              <el-icon><Share /></el-icon>
              分享名片
            </el-button>
            <el-button type="primary" @click="handleDownload">
              <el-icon><Download /></el-icon>
              下载名片
            </el-button>
          </div>
        </div>

        <!-- 名片预览区域 -->
        <el-card class="preview-card" shadow="hover" v-loading="loading" element-loading-text="正在加载用户信息...">
          <div class="preview-container">
            <div class="business-card" :class="`template-${selectedTemplate}`" ref="businessCardRef">
              <!-- 模板1：简约风格 -->
              <div v-if="selectedTemplate === 'template1'" class="card-content template1">
                <div class="card-background" :style="cardBackgroundStyle"></div>
                <div class="card-body">
                  <div class="left-section">
                    <div v-if="customOptions.showAvatar" class="avatar-section">
                      <img
                        v-if="shouldShowAvatarImage"
                        :src="finalAvatarUrl"
                        class="avatar"
                        @error="handleAvatarError"
                        @load="handleAvatarLoad"
                        alt="用户头像"
                      />
                      <div v-else-if="shouldShowAvatarPlaceholder" class="avatar-placeholder">{{ getUserInitial }}</div>
                    </div>
                    <div class="info-section">
                      <h2 class="name" :style="nameStyle">{{ userInfo.realName || '加载中...' }}</h2>
                      <p class="title" :style="titleStyle">{{ userInfo.college || '加载中...' }} · {{ userInfo.grade || '加载中...' }}</p>
                      <p class="subtitle">哈尔滨工业大学</p>
                      <div class="contact-info">
                        <div v-if="userInfo.email" class="contact-item">
                          <el-icon><Message /></el-icon>
                          <span>{{ userInfo.email }}</span>
                        </div>
                        <div v-if="userInfo.phone" class="contact-item">
                          <el-icon><Phone /></el-icon>
                          <span>{{ userInfo.phone }}</span>
                        </div>
                        <div v-if="userInfo.github" class="contact-item">
                          <el-icon><Link /></el-icon>
                          <span>GitHub</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="right-section">
                    <div v-if="customOptions.showSkills" class="skills-section">
                      <h3>核心技能</h3>
                      <div class="skill-tags">
                        <span v-for="skill in topSkills" :key="skill" class="skill-tag">{{ skill }}</span>
                      </div>
                    </div>
                    <div v-if="customOptions.showQRCode" class="qr-section">
                      <div class="qr-code">
                        <el-icon><Goods /></el-icon>
                      </div>
                      <p class="qr-text">扫码查看详情</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 模板2：商务风格 -->
              <div v-else-if="selectedTemplate === 'template2'" class="card-content template2">
                <div class="card-background" :style="cardBackgroundStyle"></div>
                <div class="card-header">
                  <div class="header-left">
                    <div v-if="customOptions.showAvatar" class="avatar-section">
                      <img
                        v-if="shouldShowAvatarImage"
                        :src="finalAvatarUrl"
                        class="avatar"
                        @error="handleAvatarError"
                        @load="handleAvatarLoad"
                        alt="用户头像"
                      />
                      <div v-else-if="shouldShowAvatarPlaceholder" class="avatar-placeholder">{{ getUserInitial }}</div>
                    </div>
                  </div>
                  <div class="header-right">
                    <h2 class="name" :style="nameStyle">{{ userInfo.realName || '加载中...' }}</h2>
                    <p class="title" :style="titleStyle">{{ userInfo.college || '加载中...' }}</p>
                    <p class="subtitle">{{ userInfo.grade || '加载中...' }} · 哈尔滨工业大学</p>
                  </div>
                </div>
                <div class="card-body">
                  <div class="info-grid">
                    <div class="info-item">
                      <el-icon><Message /></el-icon>
                      <span>{{ userInfo.email || '未设置邮箱' }}</span>
                    </div>
                    <div class="info-item">
                      <el-icon><Phone /></el-icon>
                      <span>{{ userInfo.phone || '未设置手机号' }}</span>
                    </div>
                    <div class="info-item">
                      <el-icon><MapLocation /></el-icon>
                      <span>哈尔滨工业大学</span>
                    </div>
                    <div v-if="userInfo.github" class="info-item">
                      <el-icon><Link /></el-icon>
                      <span>GitHub</span>
                    </div>
                  </div>
                  <div v-if="customOptions.showSkills" class="skills-section">
                    <h4>专业技能</h4>
                    <div class="skill-list">
                      <div v-for="skill in topSkills" :key="skill" class="skill-item">
                        <span class="skill-name">{{ skill }}</span>
                        <div class="skill-bar">
                          <div class="skill-progress" :style="`width: ${Math.random() * 40 + 60}%`"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-if="customOptions.showQRCode" class="card-footer">
                  <div class="qr-code">
                    <el-icon><Goods /></el-icon>
                  </div>
                  <p class="qr-text">扫码了解更多</p>
                </div>
              </div>

              <!-- 模板3：创意风格 -->
              <div v-else-if="selectedTemplate === 'template3'" class="card-content template3">
                <div class="card-background" :style="cardBackgroundStyle"></div>
                <div class="decorative-elements">
                  <div class="circle circle1"></div>
                  <div class="circle circle2"></div>
                  <div class="triangle"></div>
                </div>
                <div class="content-wrapper">
                  <div class="main-content">
                    <div v-if="customOptions.showAvatar" class="avatar-section">
                      <img
                        v-if="shouldShowAvatarImage"
                        :src="finalAvatarUrl"
                        class="avatar"
                        @error="handleAvatarError"
                        @load="handleAvatarLoad"
                        alt="用户头像"
                      />
                      <div v-else-if="shouldShowAvatarPlaceholder" class="avatar-placeholder">{{ getUserInitial }}</div>
                    </div>
                    <div class="text-content">
                      <h2 class="name" :style="nameStyle">{{ userInfo.realName || '加载中...' }}</h2>
                      <p class="title" :style="titleStyle">{{ userInfo.college || '加载中...' }}</p>
                      <p class="subtitle">{{ userInfo.grade || '加载中...' }} | 哈工大</p>
                      <div class="description">
                        {{ userInfo.personalIntro || '请完善个人简介' }}
                      </div>
                    </div>
                  </div>
                  <div class="side-content">
                    <div v-if="customOptions.showSkills" class="skills-cloud">
                      <div v-for="(skill, index) in topSkills" :key="skill" class="skill-bubble" :style="getSkillBubbleStyle(index)">
                        {{ skill }}
                      </div>
                    </div>
                    <div v-if="customOptions.showQRCode" class="qr-section">
                      <div class="qr-code">
                        <el-icon><Goods /></el-icon>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 分享对话框 -->
    <el-dialog v-model="shareDialogVisible" title="分享名片" width="500px">
      <div class="share-options">
        <div class="share-item" @click="handleCopyLink">
          <div class="share-icon">
            <el-icon><Link /></el-icon>
          </div>
          <div class="share-text">
            <div class="share-title">复制链接</div>
            <div class="share-desc">复制名片链接分享给他人</div>
          </div>
        </div>
        <div class="share-item" @click="handleGenerateQR">
          <div class="share-icon">
            <el-icon><Goods /></el-icon>
          </div>
          <div class="share-text">
            <div class="share-title">生成二维码</div>
            <div class="share-desc">生成二维码图片用于分享</div>
          </div>
        </div>
        <div class="share-item" @click="handleSaveImage">
          <div class="share-icon">
            <el-icon><Picture /></el-icon>
          </div>
          <div class="share-text">
            <div class="share-title">保存图片</div>
            <div class="share-desc">将名片保存为图片格式</div>
          </div>
        </div>
      </div>

      <div v-if="shareUrl" class="share-url">
        <el-input v-model="shareUrl" readonly>
          <template #append>
            <el-button @click="copyToClipboard(shareUrl)">复制</el-button>
          </template>
        </el-input>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="ProfileCard">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import {
  Postcard,
  Brush,
  Setting,
  DataAnalysis,
  View,
  Share,
  Download,
  Refresh,
  RefreshLeft,
  Message,
  Phone,
  Link,
  MapLocation,
  Goods,
  Picture
} from '@element-plus/icons-vue';
import html2canvas from 'html2canvas';
import {
  getCurrentUserProfile,
  getUserSkills,
  getShareStats,
  type UserProfileInfo,
  type UserSkillInfo,
  type ShareStatsInfo
} from '@/api/hit/userProfile';
import { getUserSkillsWithTag } from '@/api/hit/userSkill';
import { useUserStore } from '@/store/modules/user';
// 导入默认头像
import defaultAvatar from '@/assets/logo/鼠鼠.png';

// 用户store
const userStore = useUserStore();

// 响应式数据
const selectedTemplate = ref('template1');
const shareDialogVisible = ref(false);
const shareUrl = ref('');
const businessCardRef = ref();
const loading = ref(false);
const avatarError = ref(false);

// 预定义颜色
const predefineColors = ['#005BAC', '#0077C8', '#67C23A', '#E6A23C', '#F56C6C', '#909399', '#409EFF', '#36CFC9', '#9254DE', '#FF85C0'];

// 自定义选项
const customOptions = reactive({
  primaryColor: '#005BAC',
  backgroundStyle: 'gradient',
  fontSize: 16,
  showAvatar: true,
  showQRCode: true,
  showSkills: true
});

// 用户信息（从后端获取）
const userInfo = reactive<UserProfileInfo>({
  realName: '',
  college: '',
  grade: '',
  avatarUrl: '',
  email: '',
  phone: '',
  github: '',
  personalIntro: ''
});

// 默认头像URL（可以是一个通用的头像图片）
const defaultAvatarUrl = defaultAvatar;

// 顶级技能
const topSkills = ref<string[]>([]);

// 模板配置
const templates = [
  {
    id: 'template1',
    name: '简约风格',
    description: '简洁大方，适合商务场合',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    id: 'template2',
    name: '商务风格',
    description: '专业正式，突出技能展示',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    id: 'template3',
    name: '创意风格',
    description: '时尚前卫，展现个性特色',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  }
];

// 分享统计
const shareStats = reactive<ShareStatsInfo>({
  viewCount: 0,
  shareCount: 0,
  downloadCount: 0
});

// 获取用户档案数据
const fetchUserProfile = async () => {
  try {
    loading.value = true;
    const response = await getCurrentUserProfile();
    if (response.data) {
      // 更新用户信息
      Object.assign(userInfo, response.data);
      // 重置头像错误状态
      avatarError.value = false;
    } else {
      // 如果没有档案数据，显示默认值
      Object.assign(userInfo, {
        realName: '请完善个人信息',
        college: '请选择学院',
        grade: '请选择年级',
        email: '请添加邮箱',
        phone: '请添加手机号',
        personalIntro: '请添加个人简介'
      });
      ElMessage.info('检测到您还未完善个人档案，请先完善基本信息');
    }
  } catch (error) {
    console.error('获取用户档案失败:', error);
    ElMessage.error('获取用户档案失败，请重试');
    // 显示默认数据
    Object.assign(userInfo, {
      realName: '加载失败',
      college: '数据获取中...',
      grade: '数据获取中...',
      email: '数据获取中...',
      phone: '数据获取中...',
      personalIntro: '数据获取中...'
    });
  } finally {
    loading.value = false;
  }
};

// 获取用户技能数据
const fetchUserSkills = async () => {
  try {
    // 使用真实的用户技能API
    const currentUserId = userStore.userId;
    if (!currentUserId) {
      console.warn('用户未登录，无法获取技能数据');
      topSkills.value = [];
      return;
    }

    const response = await getUserSkillsWithTag(currentUserId);
    if (response.code === 200 && response.data && Array.isArray(response.data)) {
      // 获取前5个技能，按技能等级排序
      const sortedSkills = response.data
        .sort((a: any, b: any) => (b.skillLevel || 0) - (a.skillLevel || 0))
        .slice(0, 5);
      topSkills.value = sortedSkills.map((skill: any) => skill.tagName || skill.skillName);
    } else {
      console.warn('技能数据格式不正确或为空:', response);
      topSkills.value = [];
    }
  } catch (error) {
    console.error('获取用户技能失败:', error);
    // 使用空数组而不是默认数据
    topSkills.value = [];
  }
};

// 获取分享统计数据
const fetchShareStats = async () => {
  try {
    const response = await getShareStats();
    if (response.data) {
      Object.assign(shareStats, response.data);
    }
  } catch (error) {
    console.error('获取分享统计失败:', error);
    // 使用默认统计数据
    Object.assign(shareStats, {
      viewCount: 0,
      shareCount: 0,
      downloadCount: 0
    });
  }
};

// 头像加载错误处理
const handleAvatarError = () => {
  avatarError.value = true;
  console.warn('头像加载失败:', userInfo.avatarUrl);
};

// 头像加载成功处理
const handleAvatarLoad = () => {
  avatarError.value = false;
};

// 检查头像URL是否有效
const isValidAvatarUrl = computed(() => {
  return (
    userInfo.avatarUrl &&
    userInfo.avatarUrl.trim() !== '' &&
    !avatarError.value &&
    (userInfo.avatarUrl.startsWith('http://') ||
      userInfo.avatarUrl.startsWith('https://') ||
      userInfo.avatarUrl.startsWith('/') ||
      userInfo.avatarUrl.startsWith('data:image/'))
  );
});

// 获取最终显示的头像URL
const finalAvatarUrl = computed(() => {
  if (isValidAvatarUrl.value) {
    return userInfo.avatarUrl;
  }
  return defaultAvatarUrl;
});

// 是否显示头像图片（而不是占位符）
const shouldShowAvatarImage = computed(() => {
  return customOptions.showAvatar && (isValidAvatarUrl.value || defaultAvatarUrl);
});

// 是否应该显示头像占位符（姓名首字母）
const shouldShowAvatarPlaceholder = computed(() => {
  return customOptions.showAvatar && !shouldShowAvatarImage.value;
});

// 计算属性
const cardBackgroundStyle = computed(() => {
  const color = customOptions.primaryColor;
  if (customOptions.backgroundStyle === 'gradient') {
    return `background: linear-gradient(135deg, ${color}, ${color}88)`;
  } else if (customOptions.backgroundStyle === 'solid') {
    return `background: ${color}`;
  } else {
    return `background: repeating-linear-gradient(45deg, ${color}22, ${color}22 10px, transparent 10px, transparent 20px)`;
  }
});

const nameStyle = computed(() => ({
  fontSize: `${customOptions.fontSize + 4}px`,
  color: '#333'
}));

const titleStyle = computed(() => ({
  fontSize: `${customOptions.fontSize}px`,
  color: '#666'
}));

// 获取用户姓名首字母
const getUserInitial = computed(() => {
  const name = userInfo.realName || 'U';
  return name.charAt(0).toUpperCase();
});

// 方法
const selectTemplate = (templateId: string) => {
  selectedTemplate.value = templateId;
  updatePreview();
};

const updatePreview = () => {
  // 更新预览（这里可以添加实时预览逻辑）
  console.log('更新预览');
  // 触发统计更新
  shareStats.viewCount++;
};

const refreshPreview = async () => {
  ElMessage.info('正在刷新数据...');
  await Promise.all([fetchUserProfile(), fetchUserSkills(), fetchShareStats()]);
  updatePreview();
  ElMessage.success('预览已刷新');
};

const resetToDefault = () => {
  Object.assign(customOptions, {
    primaryColor: '#005BAC',
    backgroundStyle: 'gradient',
    fontSize: 16,
    showAvatar: true,
    showQRCode: true,
    showSkills: true
  });
  selectedTemplate.value = 'template1';
  updatePreview();
  ElMessage.success('已重置为默认设置');
};

const handleShare = () => {
  shareUrl.value = `${window.location.origin}/profile/card/view?id=${Date.now()}`;
  shareDialogVisible.value = true;
  shareStats.viewCount++;
};

const handleDownload = async () => {
  try {
    if (!businessCardRef.value) {
      ElMessage.error('名片预览区域未找到');
      return;
    }

    ElMessage.info('正在生成名片图片，请稍候...');

    const canvas = await html2canvas(businessCardRef.value, {
      backgroundColor: '#ffffff',
      scale: 2, // 提高清晰度
      useCORS: true,
      allowTaint: true,
      logging: false,
      height: businessCardRef.value.offsetHeight,
      width: businessCardRef.value.offsetWidth
    });

    // 创建下载链接
    const link = document.createElement('a');
    link.download = `${userInfo.realName || '我的名片'}_名片.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    // 更新下载统计
    shareStats.downloadCount++;
    ElMessage.success('名片下载成功');
  } catch (error) {
    console.error('下载失败:', error);
    ElMessage.error('下载失败，请重试');
  }
};

const handleCopyLink = () => {
  shareUrl.value = `${window.location.origin}/profile/card/view?id=${Date.now()}`;
  copyToClipboard(shareUrl.value);
};

const handleGenerateQR = () => {
  ElMessage.info('二维码生成功能开发中...');
};

const handleSaveImage = () => {
  handleDownload();
  shareDialogVisible.value = false;
};

const copyToClipboard = (text: string) => {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      ElMessage.success('链接已复制到剪贴板');
      shareStats.shareCount++;
    })
    .catch(() => {
      // 降级方案
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        ElMessage.success('链接已复制到剪贴板');
        shareStats.shareCount++;
      } catch (err) {
        ElMessage.error('复制失败，请手动复制');
      }
      document.body.removeChild(textArea);
    });
};

const showDebugInfo = () => {
  const debugInfo = {
    用户信息: userInfo,
    头像状态: {
      avatarUrl: userInfo.avatarUrl,
      defaultAvatarUrl: defaultAvatarUrl,
      finalAvatarUrl: finalAvatarUrl.value,
      isValidAvatarUrl: isValidAvatarUrl.value,
      shouldShowAvatarImage: shouldShowAvatarImage.value,
      shouldShowAvatarPlaceholder: shouldShowAvatarPlaceholder.value,
      avatarError: avatarError.value
    },
    技能列表: topSkills.value,
    分享统计: shareStats,
    自定义选项: customOptions,
    当前模板: selectedTemplate.value
  };
  console.log('当前数据状态:', debugInfo);
  ElMessage.info('数据状态已输出到控制台，请按F12查看');
};

const getSkillBubbleStyle = (index: number) => {
  const positions = [
    { top: '10%', left: '20%' },
    { top: '30%', left: '70%' },
    { top: '60%', left: '15%' },
    { top: '80%', left: '60%' },
    { top: '50%', left: '45%' }
  ];
  const colors = ['#67C23A', '#E6A23C', '#F56C6C', '#409EFF', '#909399'];

  return {
    position: 'absolute' as const,
    top: positions[index]?.top || '50%',
    left: positions[index]?.left || '50%',
    backgroundColor: colors[index % colors.length],
    transform: 'translate(-50%, -50%)'
  };
};

// 监听自定义选项变化
watch(
  () => customOptions.primaryColor,
  () => {
    updatePreview();
  },
  { immediate: false }
);

watch(
  () => customOptions.backgroundStyle,
  () => {
    updatePreview();
  },
  { immediate: false }
);

watch(
  () => customOptions.fontSize,
  () => {
    updatePreview();
  },
  { immediate: false }
);

// 生命周期
onMounted(async () => {
  // 并行加载所有数据
  await Promise.all([fetchUserProfile(), fetchUserSkills(), fetchShareStats()]);
  updatePreview();
});
</script>

<style scoped lang="scss">
.profile-card-container {
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

  .card-content {
    display: flex;
    gap: 20px;

    .card-left {
      width: 300px;

      .template-library-card {
        margin-bottom: 20px;

        .template-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;

          .template-item {
            padding: 12px;
            border: 2px solid transparent;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s;

            &:hover {
              border-color: #005bac;
              box-shadow: 0 2px 8px rgba(0, 91, 172, 0.2);
            }

            &.active {
              border-color: #005bac;
              background-color: rgba(0, 91, 172, 0.05);
            }

            .template-preview {
              margin-bottom: 8px;

              .preview-image {
                width: 100%;
                height: 80px;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                overflow: hidden;

                .preview-content {
                  text-align: center;
                  color: white;

                  .preview-avatar {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 4px;
                    font-size: 12px;
                    font-weight: 600;
                    overflow: hidden;

                    .preview-avatar-img {
                      width: 100%;
                      height: 100%;
                      object-fit: cover;
                      border-radius: 50%;
                    }
                  }

                  .preview-name {
                    font-size: 12px;
                    font-weight: 600;
                    margin-bottom: 2px;
                  }

                  .preview-title {
                    font-size: 10px;
                    opacity: 0.8;
                  }
                }
              }
            }

            .template-info {
              .template-name {
                font-weight: 600;
                color: #303133;
                margin-bottom: 4px;
              }

              .template-desc {
                font-size: 12px;
                color: #909399;
              }
            }
          }
        }
      }

      .custom-options-card {
        margin-bottom: 20px;

        .custom-form {
          .form-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;

            .form-label {
              font-weight: 500;
              color: #303133;
              font-size: 14px;
            }
          }
        }
      }

      .stats-card {
        .stats-list {
          .stat-item {
            display: flex;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #f0f0f0;

            &:last-child {
              border-bottom: none;
            }

            .stat-icon {
              width: 40px;
              height: 40px;
              border-radius: 50%;
              background: rgba(0, 91, 172, 0.1);
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 12px;

              .el-icon {
                color: #005bac;
                font-size: 18px;
              }
            }

            .stat-info {
              .stat-value {
                font-size: 20px;
                font-weight: 600;
                color: #303133;
                margin-bottom: 4px;
              }

              .stat-label {
                font-size: 12px;
                color: #909399;
              }
            }
          }
        }
      }
    }

    .card-right {
      flex: 1;

      .action-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding: 16px 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

        .action-left {
          display: flex;
          gap: 12px;
        }

        .action-right {
          display: flex;
          gap: 12px;
        }
      }

      .preview-card {
        transition: all 0.3s ease;

        &:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .preview-container {
          .business-card {
            width: 600px;
            height: 360px;
            margin: 0 auto;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
            position: relative;
            transition: all 0.3s ease;

            &:hover {
              transform: translateY(-2px);
              box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
            }

            .card-content {
              width: 100%;
              height: 100%;
              position: relative;

              .card-background {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                opacity: 0.8;
              }

              // 模板1：简约风格
              &.template1 {
                .card-body {
                  position: relative;
                  z-index: 2;
                  padding: 30px;
                  height: 100%;
                  display: flex;
                  color: white;

                  .left-section {
                    flex: 2;
                    display: flex;
                    gap: 20px;

                    .avatar-section {
                      .avatar {
                        width: 80px;
                        height: 80px;
                        border-radius: 50%;
                        object-fit: cover;
                        border: 3px solid rgba(255, 255, 255, 0.3);
                        transition: all 0.3s ease;
                      }

                      .avatar-placeholder {
                        width: 80px;
                        height: 80px;
                        border-radius: 50%;
                        background: rgba(255, 255, 255, 0.3);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 32px;
                        font-weight: 600;
                        color: white;
                        border: 3px solid rgba(255, 255, 255, 0.3);
                        transition: all 0.3s ease;
                      }
                    }

                    .info-section {
                      flex: 1;

                      .name {
                        margin: 0 0 8px 0;
                        font-weight: 700;
                        color: white;
                      }

                      .title {
                        margin: 0 0 4px 0;
                        color: rgba(255, 255, 255, 0.9);
                      }

                      .subtitle {
                        margin: 0 0 20px 0;
                        color: rgba(255, 255, 255, 0.8);
                        font-size: 14px;
                      }

                      .contact-info {
                        .contact-item {
                          display: flex;
                          align-items: center;
                          gap: 8px;
                          margin-bottom: 8px;
                          font-size: 14px;
                          color: rgba(255, 255, 255, 0.9);
                        }
                      }
                    }
                  }

                  .right-section {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    align-items: flex-end;

                    .skills-section {
                      h3 {
                        margin: 0 0 12px 0;
                        color: white;
                        font-size: 16px;
                      }

                      .skill-tags {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 6px;

                        .skill-tag {
                          background: rgba(255, 255, 255, 0.2);
                          color: white;
                          padding: 4px 8px;
                          border-radius: 12px;
                          font-size: 12px;
                          backdrop-filter: blur(10px);
                        }
                      }
                    }

                    .qr-section {
                      text-align: center;

                      .qr-code {
                        width: 60px;
                        height: 60px;
                        background: rgba(255, 255, 255, 0.2);
                        border-radius: 8px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin-bottom: 8px;
                        backdrop-filter: blur(10px);

                        .el-icon {
                          font-size: 32px;
                          color: white;
                        }
                      }

                      .qr-text {
                        font-size: 12px;
                        color: rgba(255, 255, 255, 0.8);
                        margin: 0;
                      }
                    }
                  }
                }
              }

              // 模板2：商务风格
              &.template2 {
                background: white;
                color: #333;

                .card-header {
                  display: flex;
                  align-items: center;
                  padding: 20px 30px;
                  gap: 20px;
                  background: rgba(255, 255, 255, 0.95);
                  backdrop-filter: blur(10px);

                  .avatar-section {
                    .avatar,
                    .avatar-placeholder {
                      width: 60px;
                      height: 60px;
                      border-radius: 50%;
                    }

                    .avatar {
                      object-fit: cover;
                      border: 2px solid #005bac;
                      transition: all 0.3s ease;
                    }

                    .avatar-placeholder {
                      background: #005bac;
                      color: white;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      font-size: 24px;
                      font-weight: 600;
                      border: 2px solid #005bac;
                      transition: all 0.3s ease;
                    }
                  }

                  .header-right {
                    .name {
                      margin: 0 0 4px 0;
                      color: #333;
                    }

                    .title,
                    .subtitle {
                      margin: 0 0 2px 0;
                      color: #666;
                      font-size: 14px;
                    }
                  }
                }

                .card-body {
                  padding: 20px 30px;

                  .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    margin-bottom: 20px;

                    .info-item {
                      display: flex;
                      align-items: center;
                      gap: 8px;
                      font-size: 13px;
                      color: #666;

                      .el-icon {
                        color: #005bac;
                      }
                    }
                  }

                  .skills-section {
                    h4 {
                      margin: 0 0 12px 0;
                      color: #333;
                      font-size: 14px;
                    }

                    .skill-list {
                      .skill-item {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 8px;

                        .skill-name {
                          font-size: 12px;
                          color: #666;
                          width: 80px;
                        }

                        .skill-bar {
                          flex: 1;
                          height: 4px;
                          background: #f0f0f0;
                          border-radius: 2px;
                          overflow: hidden;
                          margin-left: 12px;

                          .skill-progress {
                            height: 100%;
                            background: #005bac;
                            border-radius: 2px;
                          }
                        }
                      }
                    }
                  }
                }

                .card-footer {
                  position: absolute;
                  bottom: 20px;
                  right: 30px;
                  text-align: center;

                  .qr-code {
                    width: 40px;
                    height: 40px;
                    background: #f8f9fa;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 4px;

                    .el-icon {
                      font-size: 20px;
                      color: #005bac;
                    }
                  }

                  .qr-text {
                    font-size: 10px;
                    color: #999;
                    margin: 0;
                  }
                }
              }

              // 模板3：创意风格
              &.template3 {
                background: white;
                color: #333;

                .decorative-elements {
                  position: absolute;
                  top: 0;
                  left: 0;
                  right: 0;
                  bottom: 0;
                  z-index: 1;

                  .circle {
                    position: absolute;
                    border-radius: 50%;

                    &.circle1 {
                      width: 120px;
                      height: 120px;
                      background: rgba(0, 91, 172, 0.1);
                      top: -60px;
                      right: -60px;
                    }

                    &.circle2 {
                      width: 80px;
                      height: 80px;
                      background: rgba(103, 194, 58, 0.1);
                      bottom: -40px;
                      left: -40px;
                    }
                  }

                  .triangle {
                    position: absolute;
                    width: 0;
                    height: 0;
                    border-left: 30px solid transparent;
                    border-right: 30px solid transparent;
                    border-bottom: 50px solid rgba(230, 162, 60, 0.1);
                    top: 50%;
                    left: 20px;
                    transform: translateY(-50%) rotate(45deg);
                  }
                }

                .content-wrapper {
                  position: relative;
                  z-index: 2;
                  padding: 30px;
                  height: 100%;
                  display: flex;

                  .main-content {
                    flex: 2;
                    display: flex;
                    gap: 20px;

                    .avatar-section {
                      .avatar,
                      .avatar-placeholder {
                        width: 100px;
                        height: 100px;
                        border-radius: 20px;
                      }

                      .avatar {
                        object-fit: cover;
                        border: 3px solid rgba(0, 91, 172, 0.3);
                        transition: all 0.3s ease;
                      }

                      .avatar-placeholder {
                        background: linear-gradient(135deg, #005bac, #0077c8);
                        color: white;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 40px;
                        font-weight: 600;
                        border: 3px solid rgba(0, 91, 172, 0.3);
                        transition: all 0.3s ease;
                      }
                    }

                    .text-content {
                      flex: 1;

                      .name {
                        margin: 0 0 8px 0;
                        color: #333;
                      }

                      .title {
                        margin: 0 0 4px 0;
                        color: #005bac;
                      }

                      .subtitle {
                        margin: 0 0 16px 0;
                        color: #999;
                        font-size: 14px;
                      }

                      .description {
                        color: #666;
                        line-height: 1.5;
                        font-size: 14px;
                      }
                    }
                  }

                  .side-content {
                    flex: 1;
                    position: relative;

                    .skills-cloud {
                      position: relative;
                      height: 200px;

                      .skill-bubble {
                        padding: 6px 12px;
                        border-radius: 20px;
                        color: white;
                        font-size: 12px;
                        font-weight: 500;
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                      }
                    }

                    .qr-section {
                      position: absolute;
                      bottom: 0;
                      right: 0;

                      .qr-code {
                        width: 50px;
                        height: 50px;
                        background: #f8f9fa;
                        border-radius: 10px;
                        display: flex;
                        align-items: center;
                        justify-content: center;

                        .el-icon {
                          font-size: 24px;
                          color: #005bac;
                        }
                      }
                    }
                  }
                }
              }
            }
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

  .share-options {
    .share-item {
      display: flex;
      align-items: center;
      padding: 16px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
      margin-bottom: 12px;

      &:hover {
        background-color: #f8f9fa;
      }

      .share-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(0, 91, 172, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 16px;

        .el-icon {
          color: #005bac;
          font-size: 18px;
        }
      }

      .share-text {
        .share-title {
          font-weight: 600;
          color: #303133;
          margin-bottom: 4px;
        }

        .share-desc {
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }

  .share-url {
    margin-top: 20px;
  }
}
</style>
