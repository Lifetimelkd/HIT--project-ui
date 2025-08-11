export interface UserProfileVO {
  /**
   * 用户档案ID
   */
  profileId: string | number;

  /**
   * 关联用户id
   */
  userId: string | number;

  /**
   * 学号
   */
  studentId: string | number;

  /**
   * 真实姓名
   */
  realName: string;

  /**
   * 所属学院
   */
  college: string;

  /**
   * 专业
   */
  major: string;

  /**
   * 年级
   */
  grade: string;

  /**
   * 班级
   */
  className: string;

  /**
   * 手机号
   */
  phone: string;

  /**
   * 邮箱
   */
  email: string;

  /**
   * QQ号
   */
  qq: string;

  /**
   * 微信号
   */
  wechat: string;

  /**
   * GitHub地址
   */
  github: string;

  /**
   * LinkedIn地址
   */
  linkedin: string;

  /**
   * 个人简介
   */
  personalIntro: string;

  /**
   * 职业规划
   */
  careerPlan: string;

  /**
   * 头像地址
   */
  avatarUrl: string;

  /**
   * 封面地址
   */
  coverUrl: string;

  /**
   * 信誉积分
   */
  reputationScore: number;

  /**
   * 参与项目总数
   */
  totalProjects: number;

  /**
   * 完成项目数
   */
  completedProjects: number;

  /**
   * 状态(0正常 1禁用)
   */
  status: string;

  /**
   * 关联部门id
   */
  deptId: string | number;

}

export interface UserProfileForm extends BaseEntity {
  /**
   * 用户档案ID
   */
  profileId?: string | number;

  /**
   * 关联用户id
   */
  userId?: string | number;

  /**
   * 学号
   */
  studentId?: string | number;

  /**
   * 真实姓名
   */
  realName?: string;

  /**
   * 所属学院
   */
  college?: string;

  /**
   * 专业
   */
  major?: string;

  /**
   * 年级
   */
  grade?: string;

  /**
   * 班级
   */
  className?: string;

  /**
   * 手机号
   */
  phone?: string;

  /**
   * 邮箱
   */
  email?: string;

  /**
   * QQ号
   */
  qq?: string;

  /**
   * 微信号
   */
  wechat?: string;

  /**
   * GitHub地址
   */
  github?: string;

  /**
   * LinkedIn地址
   */
  linkedin?: string;

  /**
   * 个人简介
   */
  personalIntro?: string;

  /**
   * 职业规划
   */
  careerPlan?: string;

  /**
   * 头像地址
   */
  avatarUrl?: string;

  /**
   * 封面地址
   */
  coverUrl?: string;

  /**
   * 信誉积分
   */
  reputationScore?: number;

  /**
   * 参与项目总数
   */
  totalProjects?: number;

  /**
   * 完成项目数
   */
  completedProjects?: number;

  /**
   * 状态(0正常 1禁用)
   */
  status?: string;

  /**
   * 关联部门id
   */
  deptId?: string | number;

}

export interface UserProfileQuery extends PageQuery {

  /**
   * 关联用户id
   */
  userId?: string | number;

  /**
   * 学号
   */
  studentId?: string | number;

  /**
   * 真实姓名
   */
  realName?: string;

  /**
   * 所属学院
   */
  college?: string;

  /**
   * 专业
   */
  major?: string;

  /**
   * 年级
   */
  grade?: string;

  /**
   * 班级
   */
  className?: string;

  /**
   * 手机号
   */
  phone?: string;

  /**
   * 邮箱
   */
  email?: string;

  /**
   * QQ号
   */
  qq?: string;

  /**
   * 微信号
   */
  wechat?: string;

  /**
   * GitHub地址
   */
  github?: string;

  /**
   * LinkedIn地址
   */
  linkedin?: string;

  /**
   * 个人简介
   */
  personalIntro?: string;

  /**
   * 职业规划
   */
  careerPlan?: string;

  /**
   * 头像地址
   */
  avatarUrl?: string;

  /**
   * 封面地址
   */
  coverUrl?: string;

  /**
   * 信誉积分
   */
  reputationScore?: number;

  /**
   * 参与项目总数
   */
  totalProjects?: number;

  /**
   * 完成项目数
   */
  completedProjects?: number;

  /**
   * 状态(0正常 1禁用)
   */
  status?: string;

  /**
   * 关联部门id
   */
  deptId?: string | number;

    /**
     * 日期范围参数
     */
    params?: any;
}



