import { Test, TestingModule } from '@nestjs/testing';
import { ResidentProfileService } from '../resident-profile.service';

describe('ResidentProfileService', () => {
  let service: ResidentProfileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResidentProfileService],
    }).compile();

    service = module.get<ResidentProfileService>(ResidentProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
