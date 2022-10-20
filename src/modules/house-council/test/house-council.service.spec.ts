import { Test, TestingModule } from '@nestjs/testing';
import { HouseCouncilService } from '../house-council.service';

describe('HouseCouncilService', () => {
  let service: HouseCouncilService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HouseCouncilService],
    }).compile();

    service = module.get<HouseCouncilService>(HouseCouncilService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
