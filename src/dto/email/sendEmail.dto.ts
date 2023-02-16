
export class SendVerifyEmailDto {
  qq: string; // 目标邮箱
  code: string; // 验证码
  sign: string; // 签名
  subject: string;
}

export class SendRecuritmentEmail {
  qq: string;
  username: string;
}
export class SubmitGxaApplicationEmail {
  qq: string;
  teamName: string;
}
export class SubmitGxaWorksEmail {
  qq: string;
  teamName: string;
  url: string;
}
export class InviteGxaByStudentEmail {
  qq: string;
  fromUsername: string;
  toUsername: string;
  teamName: string;
  agreenInvitation: string;
  fromUserId: number | string;
}