import { Module } from '@nestjs/common';
import { WsStartGateway } from './events.gateway';

@Module({
  providers: [WsStartGateway],
})
export class EventsModule {}