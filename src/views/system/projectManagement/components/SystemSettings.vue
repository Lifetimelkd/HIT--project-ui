<template>
  <div class="system-settings">
    <el-row :gutter="20">
      <!-- 左侧配置表单 -->
      <el-col :span="16">
        <el-card class="settings-card" shadow="hover">
          <template #header>
            <h3>系统配置管理</h3>
          </template>
          
          <el-tabs v-model="activeSettingsTab" class="settings-tabs">
            <!-- 基础配置 -->
            <el-tab-pane label="基础配置" name="basic">
              <el-form :model="basicSettings" label-width="140px">
                <el-form-item label="系统名称">
                  <el-input v-model="basicSettings.systemName" placeholder="请输入系统名称" />
                </el-form-item>
                
                <el-form-item label="系统Logo">
                  <el-upload
                    class="logo-uploader"
                    :show-file-list="false"
                    :on-success="handleLogoSuccess"
                    :before-upload="beforeLogoUpload"
                    action="/api/upload/logo"
                  >
                    <img v-if="basicSettings.systemLogo" :src="basicSettings.systemLogo" class="logo-image" />
                    <div v-else class="logo-placeholder">
                      <el-icon><Plus /></el-icon>
                      <div>上传Logo</div>
                    </div>
                  </el-upload>
                </el-form-item>
                
                <el-form-item label="系统描述">
                  <el-input
                    v-model="basicSettings.systemDescription"
                    type="textarea"
                    :rows="3"
                    placeholder="请输入系统描述"
                  />
                </el-form-item>
                
                <el-form-item label="联系邮箱">
                  <el-input v-model="basicSettings.contactEmail" placeholder="请输入联系邮箱" />
                </el-form-item>
                
                <el-form-item label="客服电话">
                  <el-input v-model="basicSettings.servicePhone" placeholder="请输入客服电话" />
                </el-form-item>
                
                <el-form-item label="系统版本">
                  <el-input v-model="basicSettings.systemVersion" placeholder="请输入系统版本" />
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <!-- 项目配置 -->
            <el-tab-pane label="项目配置" name="project">
              <el-form :model="projectSettings" label-width="140px">
                <el-form-item label="默认团队规模">
                  <el-input-number
                    v-model="projectSettings.defaultTeamSize"
                    :min="2"
                    :max="50"
                    placeholder="默认团队规模"
                  />
                </el-form-item>
                
                <el-form-item label="最大团队规模">
                  <el-input-number
                    v-model="projectSettings.maxTeamSize"
                    :min="5"
                    :max="100"
                    placeholder="最大团队规模"
                  />
                </el-form-item>
                
                <el-form-item label="项目审核模式">
                  <el-radio-group v-model="projectSettings.approvalMode">
                    <el-radio value="auto">自动审核</el-radio>
                    <el-radio value="manual">人工审核</el-radio>
                  </el-radio-group>
                </el-form-item>
                
                <el-form-item label="默认项目周期">
                  <el-select v-model="projectSettings.defaultDuration" placeholder="请选择默认周期">
                    <el-option label="1-3个月" value="short" />
                    <el-option label="3-6个月" value="medium" />
                    <el-option label="6个月以上" value="long" />
                  </el-select>
                </el-form-item>
                
                <el-form-item label="允许的项目类型">
                  <el-checkbox-group v-model="projectSettings.allowedTypes">
                    <el-checkbox value="academic">学术研究</el-checkbox>
                    <el-checkbox value="competition">竞赛项目</el-checkbox>
                    <el-checkbox value="practice">实践项目</el-checkbox>
                    <el-checkbox value="graduation">毕业设计</el-checkbox>
                    <el-checkbox value="course">课程项目</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
                
                <el-form-item label="项目推荐算法">
                  <el-radio-group v-model="projectSettings.recommendAlgorithm">
                    <el-radio value="similarity">相似度推荐</el-radio>
                    <el-radio value="popularity">热度推荐</el-radio>
                    <el-radio value="collaborative">协同过滤</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <!-- 安全配置 -->
            <el-tab-pane label="安全配置" name="security">
              <el-form :model="securitySettings" label-width="140px">
                <el-form-item label="密码最小长度">
                  <el-input-number
                    v-model="securitySettings.minPasswordLength"
                    :min="6"
                    :max="20"
                    placeholder="密码最小长度"
                  />
                </el-form-item>
                
                <el-form-item label="密码复杂度要求">
                  <el-checkbox-group v-model="securitySettings.passwordComplexity">
                    <el-checkbox value="uppercase">包含大写字母</el-checkbox>
                    <el-checkbox value="lowercase">包含小写字母</el-checkbox>
                    <el-checkbox value="number">包含数字</el-checkbox>
                    <el-checkbox value="special">包含特殊字符</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
                
                <el-form-item label="登录失败限制">
                  <el-input-number
                    v-model="securitySettings.maxLoginAttempts"
                    :min="3"
                    :max="10"
                    placeholder="最大登录失败次数"
                  />
                </el-form-item>
                
                <el-form-item label="账户锁定时间">
                  <el-input-number
                    v-model="securitySettings.lockoutDuration"
                    :min="5"
                    :max="60"
                    placeholder="账户锁定时间（分钟）"
                  />
                </el-form-item>
                
                <el-form-item label="启用双因素认证">
                  <el-switch v-model="securitySettings.enableTwoFactor" />
                </el-form-item>
                
                <el-form-item label="IP白名单">
                  <el-input
                    v-model="securitySettings.ipWhitelist"
                    type="textarea"
                    :rows="3"
                    placeholder="请输入IP白名单，一行一个"
                  />
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <!-- 通知配置 -->
            <el-tab-pane label="通知配置" name="notification">
              <el-form :model="notificationSettings" label-width="140px">
                <el-form-item label="邮件通知">
                  <el-switch v-model="notificationSettings.enableEmail" />
                </el-form-item>
                
                <el-form-item label="短信通知">
                  <el-switch v-model="notificationSettings.enableSms" />
                </el-form-item>
                
                <el-form-item label="站内通知">
                  <el-switch v-model="notificationSettings.enableInApp" />
                </el-form-item>
                
                <el-form-item label="邮件服务器">
                  <el-input v-model="notificationSettings.emailServer" placeholder="请输入邮件服务器地址" />
                </el-form-item>
                
                <el-form-item label="邮件端口">
                  <el-input-number v-model="notificationSettings.emailPort" :min="1" :max="65535" />
                </el-form-item>
                
                <el-form-item label="发件人邮箱">
                  <el-input v-model="notificationSettings.senderEmail" placeholder="请输入发件人邮箱" />
                </el-form-item>
                
                <el-form-item label="短信API密钥">
                  <el-input
                    v-model="notificationSettings.smsApiKey"
                    type="password"
                    placeholder="请输入短信API密钥"
                    show-password
                  />
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
          
          <div class="settings-actions">
            <el-button @click="resetSettings">重置</el-button>
            <el-button type="primary" @click="saveSettings" :loading="saveLoading">
              保存配置
            </el-button>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧操作区域 -->
      <el-col :span="8">
        <div class="operation-area">
          <!-- 快捷操作 -->
          <el-card class="operation-card" shadow="hover">
            <template #header>
              <h3>快捷操作</h3>
            </template>
            
            <div class="operation-list">
              <el-button type="primary" class="operation-btn" @click="handleBackup">
                <el-icon><Download /></el-icon>
                备份数据库
              </el-button>
              
              <el-button type="success" class="operation-btn" @click="handleClearCache">
                <el-icon><Refresh /></el-icon>
                清理缓存
              </el-button>
              
              <el-button type="warning" class="operation-btn" @click="handleOptimizeDB">
                <el-icon><Tools /></el-icon>
                优化数据库
              </el-button>
              
              <el-button type="info" class="operation-btn" @click="handleGenerateReport">
                <el-icon><Document /></el-icon>
                生成报告
              </el-button>
              
              <el-button type="danger" class="operation-btn" @click="handleMaintenanceMode">
                <el-icon><Warning /></el-icon>
                维护模式
              </el-button>
            </div>
          </el-card>

          <!-- 系统信息 -->
          <el-card class="info-card" shadow="hover" style="margin-top: 20px;">
            <template #header>
              <h3>系统信息</h3>
            </template>
            
            <div class="info-list">
              <div class="info-item">
                <span class="info-label">系统版本</span>
                <span class="info-value">v1.2.3</span>
              </div>
              <div class="info-item">
                <span class="info-label">数据库版本</span>
                <span class="info-value">MySQL 8.0</span>
              </div>
              <div class="info-item">
                <span class="info-label">运行时间</span>
                <span class="info-value">15天 8小时</span>
              </div>
              <div class="info-item">
                <span class="info-label">内存使用</span>
                <span class="info-value">2.5GB / 8GB</span>
              </div>
              <div class="info-item">
                <span class="info-label">CPU使用率</span>
                <span class="info-value">15.3%</span>
              </div>
              <div class="info-item">
                <span class="info-label">磁盘空间</span>
                <span class="info-value">75.2GB / 200GB</span>
              </div>
            </div>
          </el-card>

          <!-- 最近更新 -->
          <el-card class="updates-card" shadow="hover" style="margin-top: 20px;">
            <template #header>
              <h3>最近更新</h3>
            </template>
            
            <div class="updates-list">
              <div class="update-item">
                <div class="update-date">2024-01-15</div>
                <div class="update-content">
                  <div class="update-title">v1.2.3 更新</div>
                  <div class="update-desc">修复了批量操作的bug，优化了系统性能</div>
                </div>
              </div>
              <div class="update-item">
                <div class="update-date">2024-01-10</div>
                <div class="update-content">
                  <div class="update-title">v1.2.2 更新</div>
                  <div class="update-desc">新增了数据统计功能，增强了安全性</div>
                </div>
              </div>
              <div class="update-item">
                <div class="update-date">2024-01-05</div>
                <div class="update-content">
                  <div class="update-title">v1.2.1 更新</div>
                  <div class="update-desc">优化了用户界面，提升了用户体验</div>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const activeSettingsTab = ref('basic');
const saveLoading = ref(false);

// 基础配置
const basicSettings = reactive({
  systemName: 'HIT项目组队通',
  systemLogo: '',
  systemDescription: '哈尔滨工业大学项目组队协作平台',
  contactEmail: 'admin@hit.edu.cn',
  servicePhone: '400-123-4567',
  systemVersion: 'v1.2.3'
});

// 项目配置
const projectSettings = reactive({
  defaultTeamSize: 5,
  maxTeamSize: 20,
  approvalMode: 'auto',
  defaultDuration: 'medium',
  allowedTypes: ['academic', 'competition', 'practice', 'graduation', 'course'],
  recommendAlgorithm: 'similarity'
});

// 安全配置
const securitySettings = reactive({
  minPasswordLength: 8,
  passwordComplexity: ['uppercase', 'lowercase', 'number'],
  maxLoginAttempts: 5,
  lockoutDuration: 30,
  enableTwoFactor: false,
  ipWhitelist: ''
});

// 通知配置
const notificationSettings = reactive({
  enableEmail: true,
  enableSms: false,
  enableInApp: true,
  emailServer: 'smtp.hit.edu.cn',
  emailPort: 587,
  senderEmail: 'noreply@hit.edu.cn',
  smsApiKey: ''
});

// Logo上传成功处理
const handleLogoSuccess = (response: any) => {
  basicSettings.systemLogo = response.data.url;
  ElMessage.success('Logo上传成功');
};

// Logo上传前验证
const beforeLogoUpload = (file: File) => {
  const isImage = file.type.startsWith('image/');
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isImage) {
    ElMessage.error('只能上传图片文件!');
    return false;
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!');
    return false;
  }
  return true;
};

// 保存配置
const saveSettings = async () => {
  try {
    saveLoading.value = true;
    
    // TODO: 调用后端API保存配置
    const allSettings = {
      basic: basicSettings,
      project: projectSettings,
      security: securitySettings,
      notification: notificationSettings
    };
    
    console.log('保存配置:', allSettings);
    
    // 模拟保存
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    ElMessage.success('配置保存成功');
  } catch (error) {
    console.error('保存配置失败:', error);
    ElMessage.error('保存配置失败');
  } finally {
    saveLoading.value = false;
  }
};

// 重置配置
const resetSettings = () => {
  ElMessageBox.confirm('确定要重置所有配置吗？此操作不可撤销。', '确认重置', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 重置配置到默认值
    Object.assign(basicSettings, {
      systemName: 'HIT项目组队通',
      systemLogo: '',
      systemDescription: '哈尔滨工业大学项目组队协作平台',
      contactEmail: 'admin@hit.edu.cn',
      servicePhone: '400-123-4567',
      systemVersion: 'v1.2.3'
    });
    
    ElMessage.success('配置重置成功');
  });
};

// 快捷操作
const handleBackup = () => {
  ElMessage.info('数据库备份功能开发中...');
};

const handleClearCache = () => {
  ElMessage.info('缓存清理功能开发中...');
};

const handleOptimizeDB = () => {
  ElMessage.info('数据库优化功能开发中...');
};

const handleGenerateReport = () => {
  ElMessage.info('报告生成功能开发中...');
};

const handleMaintenanceMode = () => {
  ElMessage.info('维护模式功能开发中...');
};
</script>

<style scoped lang="scss">
.system-settings {
  .settings-card {
    .settings-tabs {
      margin-bottom: 20px;
    }
    
    .settings-actions {
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #f0f0f0;
    }
  }

  .logo-uploader {
    .logo-image {
      width: 100px;
      height: 100px;
      object-fit: contain;
      border: 1px solid #dcdfe6;
      border-radius: 6px;
    }

    .logo-placeholder {
      width: 100px;
      height: 100px;
      border: 2px dashed #d3d3d3;
      border-radius: 6px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #666;
      transition: all 0.3s;

      &:hover {
        border-color: #409eff;
        color: #409eff;
      }
    }
  }

  .operation-area {
    .operation-card {
      .operation-list {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .operation-btn {
          width: 100%;
          justify-content: flex-start;
          text-align: left;
        }
      }
    }

    .info-card {
      .info-list {
        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;

          &:last-child {
            border-bottom: none;
          }

          .info-label {
            color: #666;
            font-size: 14px;
          }

          .info-value {
            color: #333;
            font-weight: 500;
          }
        }
      }
    }

    .updates-card {
      .updates-list {
        .update-item {
          display: flex;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;

          &:last-child {
            border-bottom: none;
          }

          .update-date {
            color: #666;
            font-size: 12px;
            white-space: nowrap;
            min-width: 60px;
          }

          .update-content {
            flex: 1;

            .update-title {
              font-weight: 500;
              color: #333;
              margin-bottom: 4px;
            }

            .update-desc {
              font-size: 12px;
              color: #666;
              line-height: 1.4;
            }
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

  :deep(.el-form-item__label) {
    font-weight: 500;
  }
}
</style> 