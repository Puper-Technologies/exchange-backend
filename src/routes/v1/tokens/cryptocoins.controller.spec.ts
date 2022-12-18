import { Test, TestingModule } from '@nestjs/testing';
import { CryptocoinsController } from './token.controller';
import { CryptocoinsService } from './cryptocoins.service';

describe('CryptocoinsController', () => {
  let controller: CryptocoinsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CryptocoinsController],
      providers: [CryptocoinsService],
    }).compile();

    controller = module.get<CryptocoinsController>(CryptocoinsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
