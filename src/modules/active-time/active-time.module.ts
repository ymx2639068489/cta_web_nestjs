import { ActiveTime } from '@/entities/active-time';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActiveTimeService } from './active-time.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ActiveTime])
  ],
  providers: [ActiveTimeService],
  exports: [ActiveTimeService],
})
export class ActiveTimeModule {}
