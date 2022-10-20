import { Test, TestingModule } from '@nestjs/testing';
import { AmenityItemService } from '../amenity-item.service';

describe('AmenityItemService', () => {
  let service: AmenityItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AmenityItemService],
    }).compile();

    service = module.get<AmenityItemService>(AmenityItemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
