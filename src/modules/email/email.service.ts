import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { Result } from '@/common/interface/result';
import { formatDate } from '@/common/utils';
import { Cache } from 'cache-manager';
import { ForgotPasswordDto } from '@/dto/users';
import { EmailEnum } from '@/enum/email';
import {
  SendRecuritmentEmail,
  SubmitGxaApplicationEmail
} from '@/dto/email';
@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    @Inject(CACHE_MANAGER)
    private readonly cacheService: Cache,
  ) {}
  // 不适合做节流的原因：多个用户不方便管理, 会消耗过多内存, 也不方便进行内存管理，不如用cache
  async sendverifyEmailCode(data: any): Promise<Result<string>> {
    if (!data.email) return { code: -2, message: '请填写email' };
    // check data.email
    const lastDate = await this.cacheService.get('邮箱验证' + data.email);
    if (lastDate) return { code: -3, message: '请稍后再试' };
    try {
      const code = Math.random().toString().slice(-6);
      const sendMailOptions: ISendMailOptions = this.getMessageBody(
        EmailEnum.VerifyEmail,
        {
          ...data,
          code,
        }
      )
      // 发送，提示用户已发送
      await this.mailerService.sendMail(sendMailOptions)
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
    return value === code;
  }

  async sendRecuritmentEmail(data: SendRecuritmentEmail) {
    try {
      const sendMailOptions = this.getMessageBody(
        EmailEnum.RecuritmentEmail,
        data
      )
      await this.mailerService.sendMail(sendMailOptions)
    } catch (error) {
      console.error('发送邮件出错:', error);
      return { code: -1, message: error };
    }
  }

  async sendSubmitGxaApplicationEmail(data: SubmitGxaApplicationEmail) {
    try {
      const options = this.getMessageBody(
        EmailEnum.SubmitGxaApplicationEmail,
        data,
      );
      await this.mailerService.sendMail(options);
    } catch (err) {
      console.error('发送邮件出错:', err);
      return { code: -1, message: err };
    }
  }

  private getMessageBody(type: EmailEnum, data: any): ISendMailOptions {
    switch(type) {
      case EmailEnum.VerifyEmail: {
        return {
          to: data.qq + '@qq.com',
          subject: '用户邮箱验证',
          template: 'validate.code.ejs',
          context: {
            code: data.code,
            date: formatDate(new Date()),
            sign: data.sign || '四川轻化工大学计算机技术协会'
          }
        };
      }
      case EmailEnum.InterviewNoticeEmail: {
      }
      case EmailEnum.RecuritmentEmail: {
        return {
          to: data.qq + '@qq.com',
          subject: '计协干事申请',
          template: 'recuitment.code.ejs',
          context: {
            username: data.username,
            date: formatDate(new Date()),
            sign: data.sign || '四川轻化工大学计算机技术协会'
          }
        };
      }
      case EmailEnum.AdmissionEmail: {
      }
      case EmailEnum.SubmitGxaApplicationEmail: {
        return {
          to: `${data.qq}@qq.com`,
          subject: '国信安网页设计竞赛报名',
          template: 'gxa-application.code.ejs',
          context: {
            teamName: data.teamName,
            date: formatDate(new Date()),
            sign: '四川轻化工大学计算机技术协会',
          }
        }
      }
    }
  }
}
