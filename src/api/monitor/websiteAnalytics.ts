import request from '@/utils/request';
import { AxiosPromise } from 'axios';

// 网站分析概览数据接口
export interface WebsiteAnalyticsVo {
  userStats: {
    totalUsers: number;
    todayRegistrations: number;
    weekRegistrations: number;
    monthRegistrations: number;
    dailyGrowthRate: number;
    weeklyGrowthRate: number;
  };
  projectStats: {
    totalProjects: number;
    todayProjects: number;
    weekProjects: number;
    monthProjects: number;
    activeProjects: number;
    completedProjects: number;
    dailyGrowthRate: number;
    weeklyGrowthRate: number;
  };
  onlineStats: {
    currentOnlineUsers: number;
    todayMaxOnlineUsers: number;
    todayAvgOnlineUsers: number;
  };
  lastUpdateTime: string;
}

// 趋势数据接口
export interface TrendData {
  dates: string[];
  registrations?: number[];
  creations?: number[];
  period: string;
}

// 项目类型分布接口
export interface ProjectTypeDistribution {
  name: string;
  value: number;
  percentage: string;
}

/**
 * 获取网站分析概览数据
 */
export function getWebsiteOverview(): AxiosPromise<WebsiteAnalyticsVo> {
  return request({
    url: '/monitor/websiteAnalytics/overview',
    method: 'get'
  });
}

/**
 * 获取用户注册趋势数据
 */
export function getUserTrends(days: number = 30): AxiosPromise<TrendData> {
  return request({
    url: '/monitor/websiteAnalytics/userTrends',
    method: 'get',
    params: { days }
  });
}

/**
 * 获取项目创建趋势数据
 */
export function getProjectTrends(days: number = 30): AxiosPromise<TrendData> {
  return request({
    url: '/monitor/websiteAnalytics/projectTrends',
    method: 'get',
    params: { days }
  });
}

/**
 * 获取项目类型分布数据
 */
export function getProjectTypeDistribution(): AxiosPromise<ProjectTypeDistribution[]> {
  return request({
    url: '/monitor/websiteAnalytics/projectTypeDistribution',
    method: 'get'
  });
}

/**
 * 获取今日统计数据
 */
export function getTodayStats(): AxiosPromise<any> {
  return request({
    url: '/monitor/websiteAnalytics/todayStats',
    method: 'get'
  });
}

/**
 * 获取本周统计数据
 */
export function getWeekStats(): AxiosPromise<any> {
  return request({
    url: '/monitor/websiteAnalytics/weekStats',
    method: 'get'
  });
}
