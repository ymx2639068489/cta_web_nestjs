import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';

@Module({})
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer.apply().forRoutes('*');
  }
}
