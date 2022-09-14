import { GxaWork, GxaScore } from '@/entities/GXA';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActiveTimeModule } from '../active-time/active-time.module';
import { EmailModule } from '../email/email.module';
import { GxaApplicationModule } from '../gxa_application/gxa_application.module';
import { UserModule } from '../user/user.module';
import { GxaWorksController } from './gxa_works.controller';
import { GxaWorksService } from './gxa_works.service';
@Module({
  imports: [
    UserModule,
    GxaApplicationModule,
    ActiveTimeModule,
    EmailModule,
    TypeOrmModule.forFeature([GxaWork, GxaScore])
  ],
  controllers: [GxaWorksController],
  providers: [GxaWorksService],
})
export class GxaWorksModule {}
