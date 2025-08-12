import request from '@/utils/request';
import { AxiosPromise } from 'axios';

// 用户档案信息接口
export interface UserProfileInfo {
  profileId?: number;
  userId?: number;
  studentId?: string;
  realName?: string;
  college?: string;
  major?: string;
  grade?: string;
  className?: string;
  phone?: string;
  email?: string;
  qq?: string;
  wechat?: string;
  github?: string;
  linkedin?: string;
  personalIntro?: string;
  careerPlan?: string;
  avatarUrl?: string;
  coverUrl?: string;
  reputationScore?: number;
  totalProjects?: number;
  completedProjects?: number;
  status?: string;
  deptId?: number;
}

// 用户技能信息接口
export interface UserSkillInfo {
  skillName: string;
  proficiency: number;
}

// 分享统计信息接口
export interface ShareStatsInfo {
  viewCount: number;
  shareCount: number;
  downloadCount: number;
}

/**
 * 获取当前用户的档案信息
 */
export function getCurrentUserProfile(): AxiosPromise<UserProfileInfo> {
  return request({
    url: '/hitUserProfile/userProfile/current',
    method: 'get'
  });
}

/**
 * 根据ID获取用户档案信息
 */
export function getUserProfile(profileId: number): AxiosPromise<UserProfileInfo> {
  return request({
    url: `/hitUserProfile/userProfile/${profileId}`,
    method: 'get'
  });
}

/**
 * 更新用户档案信息
 */
export function updateUserProfile(data: UserProfileInfo): AxiosPromise<any> {
  return request({
    url: '/hitUserProfile/userProfile',
    method: 'put',
    data: data
  });
}

/**
 * 新增用户档案信息
 */
export function addUserProfile(data: UserProfileInfo): AxiosPromise<any> {
  return request({
    url: '/hitUserProfile/userProfile',
    method: 'post',
    data: data
  });
}

/**
 * 获取用户技能列表（这里假设有相关接口，如果没有可以先返回模拟数据）
 */
export function getUserSkills(): AxiosPromise<UserSkillInfo[]> {
  // 暂时返回模拟数据，后续可以替换为真实API
  return Promise.resolve({
    data: [
      { skillName: 'Python', proficiency: 85 },
      { skillName: 'Vue.js', proficiency: 90 },
      { skillName: '机器学习', proficiency: 75 },
      { skillName: '数据分析', proficiency: 80 },
      { skillName: '团队协作', proficiency: 95 }
    ]
  } as any);
}

/**
 * 获取分享统计信息（这里假设有相关接口，如果没有可以先返回模拟数据）
 */
export function getShareStats(): AxiosPromise<ShareStatsInfo> {
  // 暂时返回模拟数据，后续可以替换为真实API
  return Promise.resolve({
    data: {
      viewCount: 128,
      shareCount: 24,
      downloadCount: 12
    }
  } as any);
} 