import { Module } from '@nestjs/common';
import { GxaService } from './gxa.service';
import { GxaController } from './gxa.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GxaApplicationForm, GxaWork } from '@/entities/GXA';
import { MessageModule } from '../message/message.module';
import { UserModule } from '../user/user.module';
@Module({
  imports: [
    UserModule,
    MessageModule,
    TypeOrmModule.forFeature([
      GxaApplicationForm,
      GxaWork
    ]),
  ],
  controllers: [GxaController],
  providers: [GxaService]
})
export class GxaModule {}
