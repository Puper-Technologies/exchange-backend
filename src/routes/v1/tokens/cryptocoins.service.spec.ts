import { Test, TestingModule } from '@nestjs/testing';
import { CryptocoinsService } from './cryptocoins.service';

describe('CryptocoinsService', () => {
  let service: CryptocoinsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CryptocoinsService],
    }).compile();

    service = module.get<CryptocoinsService>(CryptocoinsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
