<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="关联用户id" prop="userId">
              <el-input v-model="queryParams.userId" placeholder="请输入关联用户id" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="学号" prop="studentId">
              <el-input v-model="queryParams.studentId" placeholder="请输入学号" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="真实姓名" prop="realName">
              <el-input v-model="queryParams.realName" placeholder="请输入真实姓名" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="所属学院" prop="college">
              <el-select v-model="queryParams.college" placeholder="请选择所属学院" clearable>
                <el-option v-for="dict in hit_college" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="专业" prop="major">
              <el-input v-model="queryParams.major" placeholder="请输入专业" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="年级" prop="grade">
              <el-select v-model="queryParams.grade" placeholder="请选择年级" clearable>
                <el-option v-for="dict in hit_grade" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="班级" prop="className">
              <el-input v-model="queryParams.className" placeholder="请输入班级" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="queryParams.phone" placeholder="请输入手机号" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="queryParams.email" placeholder="请输入邮箱" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="QQ号" prop="qq">
              <el-input v-model="queryParams.qq" placeholder="请输入QQ号" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="微信号" prop="wechat">
              <el-input v-model="queryParams.wechat" placeholder="请输入微信号" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="GitHub地址" prop="github">
              <el-input v-model="queryParams.github" placeholder="请输入GitHub地址" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="LinkedIn地址" prop="linkedin">
              <el-input v-model="queryParams.linkedin" placeholder="请输入LinkedIn地址" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="个人简介" prop="personalIntro">
              <el-input v-model="queryParams.personalIntro" placeholder="请输入个人简介" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="职业规划" prop="careerPlan">
              <el-input v-model="queryParams.careerPlan" placeholder="请输入职业规划" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="头像地址" prop="avatarUrl">
              <el-input v-model="queryParams.avatarUrl" placeholder="请输入头像地址" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="封面地址" prop="coverUrl">
              <el-input v-model="queryParams.coverUrl" placeholder="请输入封面地址" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="信誉积分" prop="reputationScore">
              <el-input v-model="queryParams.reputationScore" placeholder="请输入信誉积分" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="参与项目总数" prop="totalProjects">
              <el-input v-model="queryParams.totalProjects" placeholder="请输入参与项目总数" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="完成项目数" prop="completedProjects">
              <el-input v-model="queryParams.completedProjects" placeholder="请输入完成项目数" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="关联部门id" prop="deptId">
              <el-input v-model="queryParams.deptId" placeholder="请输入关联部门id" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>

    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['hitUserProfile:userProfile:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['hitUserProfile:userProfile:edit']"
              >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="danger"
              plain
              icon="Delete"
              :disabled="multiple"
              @click="handleDelete()"
              v-hasPermi="['hitUserProfile:userProfile:remove']"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['hitUserProfile:userProfile:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="userProfileList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="用户档案ID" align="center" prop="profileId" v-if="true" />
        <el-table-column label="关联用户id" align="center" prop="userId" />
        <el-table-column label="学号" align="center" prop="studentId" />
        <el-table-column label="真实姓名" align="center" prop="realName" />
        <el-table-column label="所属学院" align="center" prop="college">
          <template #default="scope">
            <dict-tag :options="hit_college" :value="scope.row.college" />
          </template>
        </el-table-column>
        <el-table-column label="专业" align="center" prop="major" />
        <el-table-column label="年级" align="center" prop="grade">
          <template #default="scope">
            <dict-tag :options="hit_grade" :value="scope.row.grade" />
          </template>
        </el-table-column>
        <el-table-column label="班级" align="center" prop="className" />
        <el-table-column label="手机号" align="center" prop="phone" />
        <el-table-column label="邮箱" align="center" prop="email" />
        <el-table-column label="QQ号" align="center" prop="qq" />
        <el-table-column label="微信号" align="center" prop="wechat" />
        <el-table-column label="GitHub地址" align="center" prop="github" />
        <el-table-column label="LinkedIn地址" align="center" prop="linkedin" />
        <el-table-column label="个人简介" align="center" prop="personalIntro" />
        <el-table-column label="职业规划" align="center" prop="careerPlan" />
        <el-table-column label="头像地址" align="center" prop="avatarUrl" />
        <el-table-column label="封面地址" align="center" prop="coverUrl" />
        <el-table-column label="信誉积分" align="center" prop="reputationScore" />
        <el-table-column label="参与项目总数" align="center" prop="totalProjects" />
        <el-table-column label="完成项目数" align="center" prop="completedProjects" />
        <el-table-column label="状态(0正常 1禁用)" align="center" prop="status" />
        <el-table-column label="关联部门id" align="center" prop="deptId" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button
                link
                type="primary"
                icon="Edit"
                @click="handleUpdate(scope.row)"
                v-hasPermi="['hitUserProfile:userProfile:edit']"
              ></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button
                link
                type="primary"
                icon="Delete"
                @click="handleDelete(scope.row)"
                v-hasPermi="['hitUserProfile:userProfile:remove']"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改用户扩展档案对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="userProfileFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="关联用户id" prop="userId">
          <el-input v-model="form.userId" placeholder="请输入关联用户id" />
        </el-form-item>
        <el-form-item label="学号" prop="studentId">
          <el-input v-model="form.studentId" placeholder="请输入学号" />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="form.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="所属学院" prop="college">
          <el-select v-model="form.college" placeholder="请选择所属学院">
            <el-option v-for="dict in hit_college" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="专业" prop="major">
          <el-input v-model="form.major" placeholder="请输入专业" />
        </el-form-item>
        <el-form-item label="年级" prop="grade">
          <el-select v-model="form.grade" placeholder="请选择年级">
            <el-option v-for="dict in hit_grade" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="班级" prop="className">
          <el-input v-model="form.className" placeholder="请输入班级" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="QQ号" prop="qq">
          <el-input v-model="form.qq" placeholder="请输入QQ号" />
        </el-form-item>
        <el-form-item label="微信号" prop="wechat">
          <el-input v-model="form.wechat" placeholder="请输入微信号" />
        </el-form-item>
        <el-form-item label="GitHub地址" prop="github">
          <el-input v-model="form.github" placeholder="请输入GitHub地址" />
        </el-form-item>
        <el-form-item label="LinkedIn地址" prop="linkedin">
          <el-input v-model="form.linkedin" placeholder="请输入LinkedIn地址" />
        </el-form-item>
        <el-form-item label="个人简介" prop="personalIntro">
          <el-input v-model="form.personalIntro" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="职业规划" prop="careerPlan">
          <el-input v-model="form.careerPlan" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="头像地址" prop="avatarUrl">
          <el-input v-model="form.avatarUrl" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="封面地址" prop="coverUrl">
          <el-input v-model="form.coverUrl" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="信誉积分" prop="reputationScore">
          <el-input v-model="form.reputationScore" placeholder="请输入信誉积分" />
        </el-form-item>
        <el-form-item label="参与项目总数" prop="totalProjects">
          <el-input v-model="form.totalProjects" placeholder="请输入参与项目总数" />
        </el-form-item>
        <el-form-item label="完成项目数" prop="completedProjects">
          <el-input v-model="form.completedProjects" placeholder="请输入完成项目数" />
        </el-form-item>
        <el-form-item label="关联部门id" prop="deptId">
          <el-input v-model="form.deptId" placeholder="请输入关联部门id" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="UserProfile" lang="ts">
import { listUserProfile, getUserProfile, delUserProfile, addUserProfile, updateUserProfile } from '@/api/hitUserProfile/userProfile';
import { UserProfileVO, UserProfileQuery, UserProfileForm } from '@/api/hitUserProfile/userProfile/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { hit_college, hit_grade } = toRefs<any>(proxy?.useDict('hit_college', 'hit_grade'));

const userProfileList = ref<UserProfileVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const userProfileFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: UserProfileForm = {
  profileId: undefined,
  userId: undefined,
  studentId: undefined,
  realName: undefined,
  college: undefined,
  major: undefined,
  grade: undefined,
  className: undefined,
  phone: undefined,
  email: undefined,
  qq: undefined,
  wechat: undefined,
  github: undefined,
  linkedin: undefined,
  personalIntro: undefined,
  careerPlan: undefined,
  avatarUrl: undefined,
  coverUrl: undefined,
  reputationScore: undefined,
  totalProjects: undefined,
  completedProjects: undefined,
  status: undefined,
  deptId: undefined
};
const data = reactive<PageData<UserProfileForm, UserProfileQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userId: undefined,
    studentId: undefined,
    realName: undefined,
    college: undefined,
    major: undefined,
    grade: undefined,
    className: undefined,
    phone: undefined,
    email: undefined,
    qq: undefined,
    wechat: undefined,
    github: undefined,
    linkedin: undefined,
    personalIntro: undefined,
    careerPlan: undefined,
    avatarUrl: undefined,
    coverUrl: undefined,
    reputationScore: undefined,
    totalProjects: undefined,
    completedProjects: undefined,
    status: undefined,
    deptId: undefined,
    params: {}
  },
  rules: {
    studentId: [{ required: true, message: '学号不能为空', trigger: 'blur' }],
    realName: [{ required: true, message: '真实姓名不能为空', trigger: 'blur' }],
    college: [{ required: true, message: '所属学院不能为空', trigger: 'change' }],
    major: [{ required: true, message: '专业不能为空', trigger: 'blur' }],
    grade: [{ required: true, message: '年级不能为空', trigger: 'change' }],
    className: [{ required: true, message: '班级不能为空', trigger: 'blur' }],
    phone: [{ required: true, message: '手机号不能为空', trigger: 'blur' }],
    email: [{ required: true, message: '邮箱不能为空', trigger: 'blur' }],
    qq: [{ required: true, message: 'QQ号不能为空', trigger: 'blur' }],
    wechat: [{ required: true, message: '微信号不能为空', trigger: 'blur' }],
    github: [{ required: true, message: 'GitHub地址不能为空', trigger: 'blur' }],
    linkedin: [{ required: true, message: 'LinkedIn地址不能为空', trigger: 'blur' }],
    personalIntro: [{ required: true, message: '个人简介不能为空', trigger: 'blur' }],
    careerPlan: [{ required: true, message: '职业规划不能为空', trigger: 'blur' }],
    avatarUrl: [{ required: true, message: '头像地址不能为空', trigger: 'blur' }],
    coverUrl: [{ required: true, message: '封面地址不能为空', trigger: 'blur' }],
    reputationScore: [{ required: true, message: '信誉积分不能为空', trigger: 'blur' }],
    totalProjects: [{ required: true, message: '参与项目总数不能为空', trigger: 'blur' }],
    completedProjects: [{ required: true, message: '完成项目数不能为空', trigger: 'blur' }],
    status: [{ required: true, message: '状态(0正常 1禁用)不能为空', trigger: 'change' }],
    deptId: [{ required: true, message: '关联部门id不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询用户扩展档案列表 */
const getList = async () => {
  loading.value = true;
  const res = await listUserProfile(queryParams.value);
  userProfileList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
};

/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  userProfileFormRef.value?.resetFields();
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

/** 多选框选中数据 */
const handleSelectionChange = (selection: UserProfileVO[]) => {
  ids.value = selection.map((item) => item.profileId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加用户扩展档案';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: UserProfileVO) => {
  reset();
  const _profileId = row?.profileId || ids.value[0];
  const res = await getUserProfile(_profileId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改用户扩展档案';
};

/** 提交按钮 */
const submitForm = () => {
  userProfileFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.profileId) {
        await updateUserProfile(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addUserProfile(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: UserProfileVO) => {
  const _profileIds = row?.profileId || ids.value;
  await proxy?.$modal.confirm('是否确认删除用户扩展档案编号为"' + _profileIds + '"的数据项？').finally(() => (loading.value = false));
  await delUserProfile(_profileIds);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'hitUserProfile/userProfile/export',
    {
      ...queryParams.value
    },
    `userProfile_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
});
</script>
