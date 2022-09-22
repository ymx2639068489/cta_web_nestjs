import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ComputerCompetitionService } from './computer-competition.service';
@ApiTags('computer-competition')
@ApiBearerAuth()
@Controller('computer-competition')
export class ComputerCompetitionController {
  constructor(
    private readonly computerService: ComputerCompetitionService,
  ) {}
}
