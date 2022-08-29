import { Module, CacheModule } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { RecruitmentModule } from './modules/recruitment/recruitment.module';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from './common/common.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserController } from './modules/user/user.controller';
import { _CommonModule } from './modules/common/common.module';
import { EmailModule } from './modules/email/email.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guard/jwt.guard';
import { TasksModule } from './tasks/tasks.module';
import { GxaModule } from './modules/gxa/gxa.module';
import { MessageModule } from './modules/message/message.module';
import { ActiveTimeModule } from './modules/active-time/active-time.module';
import * as redisStore from 'cache-manager-redis-store';
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig],
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST,
      port: +process.env.DATABASE_PORT,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      autoLoadEntities: true, // 自动加载模块，而不是指定实体数组, 开发环境谨慎使用
      synchronize: true, // 同步数据库，如果不存在则创自动创建, 开发环境谨慎使用
    }),
    CommonModule,
    UserModule,
    RecruitmentModule,
    _CommonModule,
    AuthModule,
    EmailModule,
    TasksModule,
    GxaModule,
    MessageModule,
    ActiveTimeModule,
  ],
  controllers: [UserController],
  providers: [
    // 全局使用jwt验证
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    }
  ],
})
export class AppModule {}
