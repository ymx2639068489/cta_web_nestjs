import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// swagger
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
// 验证管道
import { ValidationPipe } from '@nestjs/common';
// 过滤器, 捕获异常
import { HttpExceptionFilter } from './common/filters';
// 全局拦截器
import {
  // 时间超时拦截器
  TimeoutInterceptor,
  // 响应包装拦截器
  WrapResponseInterceptor,
} from './common/interceptors';

async function bootstrap() {
  const appConfig = {
    cors: true,
    abortOnError: false,
  };
  const app = await NestFactory.create(AppModule, appConfig);

  app.setGlobalPrefix('api');

  // app.useStaticAssets()
  // swagger
  const options = new DocumentBuilder()
    .setTitle('CTA_WEB_API_DOCUMENT')
    .setDescription('The CTA_WEB_API_DOCUMENT API description')
    .setVersion('1.1.2')
    .addBearerAuth()
    .addTag('CTA_WEB_API_DOCUMENT')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('/docs', app, document);

  // 全局验证器
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 删除掉不需要验证的参数
      forbidNonWhitelisted: true, // 格式不对就直接报错
      transform: true, // 允许转换参数类型
      transformOptions: {
        enableImplicitConversion: true, // 允许隐式转换
      },
    }),
  );

  // 过滤器捕获异常
  app.useGlobalFilters(new HttpExceptionFilter());

  // 全局拦截器
  app.useGlobalInterceptors(
    new WrapResponseInterceptor(),
    new TimeoutInterceptor(),
  );

  // app.use(new HttpRequestMiddleware().use)
  await app.listen(3001);
}

bootstrap();
/**
 * 3001 is development
 * 3004 is process
 * class-validator class-transformer // 参数转换和验证
 * @nestjs/typeorm typeorm 0.2.x mysql // 实体类型orm
 * @nestjs/config // 配置文件
 * @nestjs/swagger // swagger文档
 */
