import { GxaWork } from '@/entities/GXA';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActiveTimeModule } from '../active-time/active-time.module';
import { GxaApplicationModule } from '../gxa_application/gxa_application.module';
import { GxaWorksController } from './gxa_works.controller';
import { GxaWorksService } from './gxa_works.service';
@Module({
  imports: [
    GxaApplicationModule,
    ActiveTimeModule,
    TypeOrmModule.forFeature([GxaWork])
  ],
  controllers: [GxaWorksController],
  providers: [GxaWorksService],
})
export class GxaWorksModule {}
