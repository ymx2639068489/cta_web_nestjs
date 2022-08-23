import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { Result } from '@/common/interface/result';
import { formatDate } from '@/common/utils';
import { Cache } from 'cache-manager';
import { ForgotPasswordDto } from '@/dto/users';
@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    @Inject(CACHE_MANAGER)
    private readonly cacheService: Cache,
  ) {}
  // 不适合做节流的原因：多个用户不方便管理, 会消耗过多内存, 也不方便进行内存管理，不如用cache
  async sendEmailCode(data: any): Promise<Result<string>> {
    if (!data.email) return { code: -2, message: '请填写email' };
    // check data.email
    const lastDate = await this.cacheService.get('邮箱验证' + data.email);
    if (lastDate) return { code: -3, message: '请稍后再试' };
    try {
      const code = Math.random().toString().slice(-6);
      const date = formatDate(new Date())
      const sendMailOptions: ISendMailOptions = {
        to: data.email,
        subject: data.subject || '用户邮箱验证',
        template: 'validate.code.ejs', //这里写你的模板名称，如果你的模板名称的单名如 validate.ejs ,直接写validate即可 系统会自动追加模板的后缀名,如果是多个，那就最好写全。
        //内容部分都是自定义的
        context: {
          code, //验证码
          date, //日期
          sign: data.sign || '四川轻化工大学计算机技术协会' //发送的签名,当然也可以不要
        }
        // attachments: [
        //     {
        //         filename: 'validate.code.ejs', //文件名
        //         path: path.join(process.cwd(), './src/email/template/validate.code.ejs') //服务端的文件地址
        //     }
        // ]
      };
      // 发送，提示用户已发送
      this.mailerService
          .sendMail(sendMailOptions)
          .then(() => {
              console.log(`发送邮件给:${data.email},成功!主题:${data.subject || '默认'}`);
          })
          .catch(error => {
              console.log(`发送邮件给:${data.email}出错!主题:${data.subject || '默认'}`, error);
          });
      await this.cacheService.set('邮箱验证' + data.email, code, { ttl: 600 });
      return { code: 0, message: '已发送' };
    } catch (error) {
      console.error('发送邮件出错:', error);
      return { code: -1, message: error };
    }
  }

  async verifyMailbox(forgotPasswordDto: ForgotPasswordDto): Promise<boolean> {
    const { qq, code } = forgotPasswordDto;
    const value = await this.cacheService.get('邮箱验证' + qq + '@qq.com');
    console.log(code, value);
    return value === code;
  }
}
