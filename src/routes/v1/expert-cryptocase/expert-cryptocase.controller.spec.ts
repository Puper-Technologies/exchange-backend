import { Test, TestingModule } from '@nestjs/testing';
import { ExpertCaseController } from './expert-cryptocases.controller';
import { ExpertCryptocasesService } from './expert-cryptocases.service';

describe('ExpertCaseController', () => {
  let controller: ExpertCaseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpertCaseController],
      providers: [ExpertCryptocasesService],
    }).compile();

    controller = module.get<ExpertCaseController>(ExpertCaseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
