import { Injectable } from '@nestjs/common';
import { TestPaper, Question } from '@/entities/computerKnowledge';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';

@Injectable()
export class ComputerCompetitionService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(TestPaper)
    private readonly testPaperRepository: Repository<TestPaper>,
    private readonly userService: UserService,
  ) {}
}
