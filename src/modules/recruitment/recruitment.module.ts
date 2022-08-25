import { Module } from '@nestjs/common';
import { RecruitmentService } from './recruitment.service';
import { RecruitmentController } from './recruitment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recruitment } from '@/entities/recruitment';
import { UserModule } from '../user/user.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from '@/common/guard';
@Module({
  imports: [TypeOrmModule.forFeature([Recruitment]), UserModule],
  controllers: [RecruitmentController],
  providers: [
    RecruitmentService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class RecruitmentModule {}
