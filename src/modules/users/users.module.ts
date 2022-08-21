import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { CommonModule } from '../../common/common.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, UserIdentity } from '../../entities/users';
import { AuthModule } from '../autuh/auth.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserIdentity]),
    CommonModule,
    AuthModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
