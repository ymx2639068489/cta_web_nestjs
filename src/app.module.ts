import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from './common/common.module';
import { UserController } from './modules/user/user.controller';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guard/jwt.guard';
import { TasksModule } from './tasks/tasks.module';
import {
  GxaWorksModule,
  ActiveTimeModule,
  MessageModule,
  GxaApplicationModule,
  EmailModule,
  _CommonModule,
  AuthModule,
  UserModule,
  RecruitmentModule,
  EventsModule
} from './modules';
import { JournalismModule } from './modules/journalism/journalism.module';
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
    RecruitmentModule,
    CommonModule,
    UserModule,
    _CommonModule,
    AuthModule,
    EmailModule,
    TasksModule,
    MessageModule,
    ActiveTimeModule,
    GxaApplicationModule,
    GxaWorksModule,
    JournalismModule,
    EventsModule,
  ],
  controllers: [UserController],
  providers: [
    // 全局使用jwt验证
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
