import { Test, TestingModule } from '@nestjs/testing';
import { ExpertCryptocasesService } from './expert-cryptocase.service';

describe('ExpertCryptocasesService', () => {
  let service: ExpertCryptocasesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExpertCryptocasesService],
    }).compile();

    service = module.get<ExpertCryptocasesService>(ExpertCryptocasesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
