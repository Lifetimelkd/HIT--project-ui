import request from '@/utils/request';

// 技能标签表单对象
export interface SkillTagForm {
  tagId?: string;
  tagName: string;
  tagCategory: string;
  parentId?: string;
  tagDescription?: string;
  tagColor?: string;
  isActive?: string;
  sortOrder?: number;
  useCount?: number;
}

// 查询技能标签列表
export function getSkillTagList(query?: any) {
  return request({
    url: '/hit/skillTag/list',
    method: 'get',
    params: query
  });
}

// 查询技能标签详细信息
export function getSkillTag(tagId: string) {
  return request({
    url: `/hit/skillTag/${tagId}`,
    method: 'get'
  });
}

// 新增技能标签
export function addSkillTag(data: SkillTagForm) {
  return request({
    url: '/hit/skillTag',
    method: 'post',
    data: data
  });
}

// 修改技能标签
export function updateSkillTag(data: SkillTagForm) {
  return request({
    url: '/hit/skillTag',
    method: 'put',
    data: data
  });
}

// 删除技能标签
export function delSkillTag(tagIds: string[]) {
  return request({
    url: `/hit/skillTag/${tagIds}`,
    method: 'delete'
  });
}

// 查询热门标签
export function getHotTags() {
  return request({
    url: '/hit/skillTag/hot',
    method: 'get'
  });
}

// 根据分类查询标签
export function getTagsByCategory(category: string) {
  return request({
    url: `/hit/skillTag/category/${category}`,
    method: 'get'
  });
}

// 增加使用次数
export function increaseUseCount(tagId: string) {
  return request({
    url: `/hit/skillTag/use/${tagId}`,
    method: 'post'
  });
}
