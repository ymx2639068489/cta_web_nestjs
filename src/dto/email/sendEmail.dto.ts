
export class SendEmailDto {
  email: string; // 目标邮箱
  code: string; // 验证码
  sign: string; // 签名
  subject: string;
}