import { Module } from '@nestjs/common';
import { CommonModule } from '@/common/common.module';
import { TypeOrmModule } from '@nestjs/typeorm';
// service
import { UserService } from './user.service';
import { EmailModule } from '../email/email.module';
// entities
import { User, UserIdentity } from '@/entities/users';
@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserIdentity]),
    CommonModule,
    EmailModule,
  ],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
