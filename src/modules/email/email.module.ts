import { Module, CacheModule } from '@nestjs/common';
import { EmailService } from './email.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import * as path from 'path';
import {
  EMAIL_AUTH_PASS,
  EMAIL_AUTH_USER,
  EMAIL_AUTH_USERNAME,
} from '@/config/app.config';
@Module({
  imports: [
    CacheModule.register(),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.qq.com',
        port: 465,
        auth: {
          user: EMAIL_AUTH_USER,
          pass: EMAIL_AUTH_PASS,
        },
      },
      preview: false,
      defaults: {
        from: EMAIL_AUTH_USERNAME,
      },
      template: {
        dir: path.join(process.cwd(), './src/modules/email/template'),
        adapter: new EjsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
