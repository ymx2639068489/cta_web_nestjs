import { Module } from '@nestjs/common';
import { RecruitmentService } from './recruitment.service';
import { RecruitmentController } from './recruitment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recruitment } from '@/entities/recruitment';
import { UserModule } from '../user/user.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from '@/common/guard';
import { ActiveTimeModule } from '../active-time/active-time.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Recruitment]),
    UserModule,
    ActiveTimeModule
  ],
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
