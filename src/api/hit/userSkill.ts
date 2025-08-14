import request from '@/utils/request';

export interface UserSkillForm {
  userSkillId?: number;
  userId?: number;
  tagId?: number;
  skillLevel?: number;
  learningTime?: number;
  projectCount?: number;
  isCertified?: boolean;
  description?: string;
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
export function getUserSkill(userSkillId: number) {
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
export function delUserSkill(userSkillIds: number[]) {
  return request({
    url: `/hit/userSkill/${userSkillIds}`,
    method: 'delete'
  });
}

// 查询用户技能列表（包含标签信息）
export function getUserSkillsWithTag(userId: number) {
  return request({
    url: `/hit/userSkill/user/${userId}`,
    method: 'get'
  });
}

// 根据标签ID查询用户列表
export function getUsersBySkillTag(tagId: number) {
  return request({
    url: `/hit/userSkill/tag/${tagId}`,
    method: 'get'
  });
}

// 批量保存用户技能
export function batchSaveUserSkills(userId: number, skillList: UserSkillForm[]) {
  return request({
    url: `/hit/userSkill/batch/${userId}`,
    method: 'post',
    data: skillList
  });
}

// 技能认证
export function certifySkill(userSkillId: number, certifiedRemark: string) {
  return request({
    url: `/hit/userSkill/certify/${userSkillId}`,
    method: 'post',
    params: { certifiedRemark }
  });
}
