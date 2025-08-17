import request from '@/utils/request';

// 用户作品集表单对象
export interface UserPortfolioForm {
  portfolioId?: string;
  userId?: string;
  portfolioTitle: string;
  portfolioDescription: string;
  portfolioContent: string;
  portfolioType: string;
  coverImage?: string;
  attachments?: string;
  tags?: string;
  isPublic: string;
  allowComments: string;
  viewCount?: number;
  likeCount?: number;
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

// 查询用户作品集详细信息
export function getUserPortfolio(portfolioId: string) {
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
export function delUserPortfolio(portfolioIds: string[]) {
  return request({
    url: `/hit/userPortfolio/${portfolioIds}`,
    method: 'delete'
  });
}

// 查询公开作品集
export function getPublicPortfolios(userId: string) {
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

// 增加浏览量
export function increaseViewCount(portfolioId: string) {
  return request({
    url: `/hit/userPortfolio/view/${portfolioId}`,
    method: 'post'
  });
}

// 增加点赞数
export function increaseLikeCount(portfolioId: string) {
  return request({
    url: `/hit/userPortfolio/like/${portfolioId}`,
    method: 'post'
  });
}

// 设置作品集置顶
export function setPortfolioTop(portfolioId: string, isTop: number) {
  return request({
    url: `/hit/userPortfolio/top/${portfolioId}`,
    method: 'put',
    params: { isTop }
  });
}
