import { Module } from '@nestjs/common';
import { RecruitmentService } from './recruitment.service';
import { RecruitmentController } from './recruitment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recruitment } from '@/entities/recruitment';
import { UserModule } from '../user/user.module';
import { EmailModule } from '..';
import {
  MessageModule,
  ActiveTimeModule
} from '..';

@Module({
  imports: [
    TypeOrmModule.forFeature([Recruitment]),
    UserModule,
    MessageModule,
    ActiveTimeModule,
    EmailModule,
  ],
  controllers: [RecruitmentController],
  providers: [
    RecruitmentService,
  ],
  exports: []
})
export class RecruitmentModule {}
