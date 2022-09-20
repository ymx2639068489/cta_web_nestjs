import { Module } from '@nestjs/common';
import { JournalismService } from './journalism.service';
import { JournalismController } from './journalism.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { journalism, AdminUser, Roles, Router } from '@/entities/journalism';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      journalism,
      AdminUser,
      Roles,
      Router
    ])
  ],
  providers: [JournalismService],
  controllers: [JournalismController],
})
export class JournalismModule {}
