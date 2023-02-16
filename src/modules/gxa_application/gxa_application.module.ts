import { CacheModule, Module } from '@nestjs/common';
import { GxaApplicationService } from './gxa_application.service';
import { GxaApplicationController } from './gxa_application.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GxaApplicationForm } from '@/entities/GXA';
import { MessageModule } from '../message/message.module';
import { UserModule } from '../user/user.module';
import { ActiveTimeModule } from '../active-time/active-time.module';
import { EmailModule } from '../email/email.module';
@Module({
  imports: [
    UserModule,
    EmailModule,
    MessageModule,
    ActiveTimeModule,
    CacheModule.register(),
    TypeOrmModule.forFeature([GxaApplicationForm]),
  ],
  controllers: [GxaApplicationController],
  providers: [GxaApplicationService],
  exports: [GxaApplicationService],
})
export class GxaApplicationModule {}
