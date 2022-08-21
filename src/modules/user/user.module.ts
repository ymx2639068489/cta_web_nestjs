import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { CommonModule } from '../../common/common.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, UserIdentity } from '../../entities/users';
@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserIdentity]),
    CommonModule,
  ],
  // controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
