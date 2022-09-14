import { Module } from '@nestjs/common';
import { JournalismService } from './journalism.service';
import { JournalismController } from './journalism.controller';

@Module({
  providers: [JournalismService],
  controllers: [JournalismController],
})
export class JournalismModule {}
