import { Module, CacheModule } from '@nestjs/common';
import { EmailService } from './email.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import * as path from 'path';
@Module({
  imports: [
    CacheModule.register(),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.qq.com',
        port: 465,
        auth: {
          user: '2639068489@qq.com',
          pass: 'ryqicumkapkaecgf'
        }
      },
      preview: false,
      defaults: {
        from: '测试邮件 <2639068489@qq.com>'
      },
      template: {
        dir: path.join(process.cwd(), './src/modules/email/template'),
        adapter: new EjsAdapter(),
        options: {
          strict: true,
        }
      }
    })
  ],
  providers: [EmailService],
  exports: [EmailService]
})
export class EmailModule {}
