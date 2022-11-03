import { Module, CacheModule } from '@nestjs/common';
import { EmailService } from './email.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import * as path from 'path';
console.log(process.env);

@Module({
  imports: [
    CacheModule.register(),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.qq.com',
        port: 465,
        auth: {
          user: process.env.EMAIL_AUTH_USER,
          pass: process.env.EMAIL_AUTH_PASS
        }
      },
      preview: false,
      defaults: {
        from: '四川轻化工大学计算机技术协会 <3491357178@qq.com>'
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
