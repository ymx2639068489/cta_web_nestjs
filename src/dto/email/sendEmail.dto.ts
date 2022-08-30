
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