import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { UserProfileVO, UserProfileForm, UserProfileQuery } from '@/api/hitUserProfile/userProfile/types';

/**
 * 查询用户扩展档案列表
 * @param query
 * @returns {*}
 */

export const listUserProfile = (query?: UserProfileQuery): AxiosPromise<UserProfileVO[]> => {
  return request({
    url: '/hitUserProfile/userProfile/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询用户扩展档案详细
 * @param profileId
 */
export const getUserProfile = (profileId: string | number): AxiosPromise<UserProfileVO> => {
  return request({
    url: '/hitUserProfile/userProfile/' + profileId,
    method: 'get'
  });
};

/**
 * 新增用户扩展档案
 * @param data
 */
export const addUserProfile = (data: UserProfileForm) => {
  return request({
    url: '/hitUserProfile/userProfile',
    method: 'post',
    data: data
  });
};

/**
 * 修改用户扩展档案
 * @param data
 */
export const updateUserProfile = (data: UserProfileForm) => {
  return request({
    url: '/hitUserProfile/userProfile',
    method: 'put',
    data: data
  });
};

/**
 * 删除用户扩展档案
 * @param profileId
 */
export const delUserProfile = (profileId: string | number | Array<string | number>) => {
  return request({
    url: '/hitUserProfile/userProfile/' + profileId,
    method: 'delete'
  });
};
