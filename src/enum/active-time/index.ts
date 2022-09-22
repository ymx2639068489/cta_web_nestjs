export enum activeName {
  // 国信安， 注册
  GXA_register = 'GXA_register',
  // 提交作品
  GXA_works = 'GXA_works',
  // 初审
  GXA_approve = 'GXA_approve',
  // 作品打分， 公式阶段
  GXA_works_scoring = 'GXA_works_scoring',
  // 决赛阶段
  GXA_finals = 'GXA_finals',
  // 国信安活动结束，公示获奖名单
  GXA_end = 'GXA_end',
  // 提交干事申请表
  recruitment = 'recruitment',
  // 面试通知阶段
  recruitment_interview_notice = 'recruitment_interview_notice',
  // 设置干事阶段
  set_official = 'set_official',
  computer_knowledge_competition = 'computer_knowledge_competition'
}

export const gxa_status = [
  activeName.GXA_register,
  activeName.GXA_works,
  activeName.GXA_approve,
  activeName.GXA_works_scoring,
  activeName.GXA_finals,
  activeName.GXA_end
]