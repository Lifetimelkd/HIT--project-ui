import request from '@/utils/request'

export interface SkillTagForm {
  tagId?: number
  tagName?: string
  tagCategory?: string
  parentId?: number
  description?: string
  isHot?: boolean
  orderNum?: number
  status?: string
}

// 查询技能标签列表
export function getSkillTagList(query?: any) {
  return request({
    url: '/hit/skillTag/list',
    method: 'get',
    params: query
  })
}

// 获取技能标签详情
export function getSkillTag(tagId: number) {
  return request({
    url: `/hit/skillTag/${tagId}`,
    method: 'get'
  })
}

// 新增技能标签
export function addSkillTag(data: SkillTagForm) {
  return request({
    url: '/hit/skillTag',
    method: 'post',
    data: data
  })
}

// 修改技能标签
export function updateSkillTag(data: SkillTagForm) {
  return request({
    url: '/hit/skillTag',
    method: 'put',
    data: data
  })
}

// 删除技能标签
export function delSkillTag(tagIds: number[]) {
  return request({
    url: `/hit/skillTag/${tagIds}`,
    method: 'delete'
  })
}

// 查询热门标签
export function getHotTags() {
  return request({
    url: '/hit/skillTag/hot',
    method: 'get'
  })
}

// 根据分类查询标签
export function getTagsByCategory(category: string) {
  return request({
    url: `/hit/skillTag/category/${category}`,
    method: 'get'
  })
}

// 增加标签使用次数
export function increaseUseCount(tagId: number) {
  return request({
    url: `/hit/skillTag/useCount/${tagId}`,
    method: 'post'
  })
} 