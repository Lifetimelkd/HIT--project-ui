import request from '@/utils/request';

export interface UserPortfolioForm {
  portfolioId?: number;
  userId?: number;
  portfolioTitle?: string;
  workType?: string;
  portfolioDescription?: string;
  techStack?: string;
  personalRole?: string;
  projectUrl?: string;
  repositoryUrl?: string;
  downloadUrl?: string;
  coverImage?: string;
  startDate?: string;
  endDate?: string;
  teamSize?: number;
  viewCount?: number;
  likeCount?: number;
  isFeatured?: string;
  isPublic?: string;
  orderNum?: number;
  status?: string;
}

// 查询用户作品集列表
export function getUserPortfolioList(query?: any) {
  return request({
    url: '/hit/userPortfolio/list',
    method: 'get',
    params: query
  });
}

// 获取当前用户的作品集列表
export function getCurrentUserPortfolios(query?: any) {
  return request({
    url: '/hit/userPortfolio/current',
    method: 'get',
    params: query
  });
}

// 获取用户作品集详情
export function getUserPortfolio(portfolioId: number) {
  return request({
    url: `/hit/userPortfolio/${portfolioId}`,
    method: 'get'
  });
}

// 新增用户作品集
export function addUserPortfolio(data: UserPortfolioForm) {
  return request({
    url: '/hit/userPortfolio',
    method: 'post',
    data: data
  });
}

// 修改用户作品集
export function updateUserPortfolio(data: UserPortfolioForm) {
  return request({
    url: '/hit/userPortfolio',
    method: 'put',
    data: data
  });
}

// 删除用户作品集
export function delUserPortfolio(portfolioIds: number[]) {
  return request({
    url: `/hit/userPortfolio/${portfolioIds}`,
    method: 'delete'
  });
}

// 查询用户作品集列表（公开展示）
export function getPublicPortfolios(userId: number) {
  return request({
    url: `/hit/userPortfolio/public/${userId}`,
    method: 'get'
  });
}

// 根据作品类型查询作品集
export function getPortfoliosByWorkType(workType: string) {
  return request({
    url: `/hit/userPortfolio/workType/${workType}`,
    method: 'get'
  });
}

// 查询热门作品集（按浏览量排序）
export function getHotPortfolios(limit: number = 10) {
  return request({
    url: '/hit/userPortfolio/hot',
    method: 'get',
    params: { limit }
  });
}

// 增加浏览次数
export function increaseViewCount(portfolioId: number) {
  return request({
    url: `/hit/userPortfolio/view/${portfolioId}`,
    method: 'post'
  });
}

// 增加点赞次数
export function increaseLikeCount(portfolioId: number) {
  return request({
    url: `/hit/userPortfolio/like/${portfolioId}`,
    method: 'post'
  });
}

// 设置作品集置顶
export function setPortfolioTop(portfolioId: number, isTop: number) {
  return request({
    url: `/hit/userPortfolio/setTop/${portfolioId}`,
    method: 'post',
    params: { isTop }
  });
}
