import { AlgorithmIntegral } from '@/entities/algorithmIntegral';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';

@Injectable()
export class AlgorithmIntegralService {
  constructor(
    @InjectRepository(AlgorithmIntegral)
    private readonly integralRepository: Repository<AlgorithmIntegral>,
    private readonly userService: UserService,
  ) {}

  async 

}
