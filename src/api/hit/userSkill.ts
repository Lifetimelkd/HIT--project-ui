import request from '@/utils/request';

// 用户技能表单对象
export interface UserSkillForm {
  userSkillId?: string | number;
  userId?: string | number;
  tagId?: string | number;
  skillName?: string; // 技能名称（用于前端显示）
  skillLevel: number;
  learningTime?: number;
  projectCount?: number;
  isCertified?: boolean | number; // 支持boolean和number类型
  skillDescription?: string;
}

// 查询用户技能列表
export function getUserSkillList(query?: any) {
  return request({
    url: '/hit/userSkill/list',
    method: 'get',
    params: query
  });
}

// 获取用户技能详情
export function getUserSkill(userSkillId: string) {
  return request({
    url: `/hit/userSkill/${userSkillId}`,
    method: 'get'
  });
}

// 新增用户技能
export function addUserSkill(data: UserSkillForm) {
  return request({
    url: '/hit/userSkill',
    method: 'post',
    data: data
  });
}

// 修改用户技能
export function updateUserSkill(data: UserSkillForm) {
  return request({
    url: '/hit/userSkill',
    method: 'put',
    data: data
  });
}

// 删除用户技能
export function delUserSkill(userSkillIds: string[]) {
  return request({
    url: `/hit/userSkill/${userSkillIds}`,
    method: 'delete'
  });
}

// 查询用户技能列表（包含标签信息）
export function getUserSkillsWithTag(userId: string | number) {
  return request({
    url: `/hit/userSkill/user/${userId}`,
    method: 'get'
  });
}

// 根据标签ID查询用户列表
export function getUsersBySkillTag(tagId: string) {
  return request({
    url: `/hit/userSkill/tag/${tagId}`,
    method: 'get'
  });
}

// 批量保存用户技能
export function batchSaveUserSkills(userId: string | number, skillList: UserSkillForm[]) {
  return request({
    url: `/hit/userSkill/batch/${userId}`,
    method: 'post',
    data: skillList
  });
}

// 技能认证
export function certifySkill(userSkillId: string, certifiedRemark: string) {
  return request({
    url: `/hit/userSkill/certify/${userSkillId}`,
    method: 'put',
    data: { certifiedRemark }
  });
}
