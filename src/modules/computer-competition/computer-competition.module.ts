import { Module } from '@nestjs/common';
import { ComputerCompetitionService } from './computer-competition.service';
import { ComputerCompetitionController } from './computer-competition.controller';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestPaper, Question } from '@/entities/computerKnowledge';
import { ActiveTimeModule } from '../active-time/active-time.module';

@Module({
  imports: [
    UserModule,
    ActiveTimeModule,
    TypeOrmModule.forFeature([TestPaper, Question])
  ],
  providers: [ComputerCompetitionService],
  controllers: [ComputerCompetitionController]
})
export class ComputerCompetitionModule {}
