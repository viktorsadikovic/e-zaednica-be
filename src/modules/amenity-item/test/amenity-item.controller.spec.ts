import { Test, TestingModule } from '@nestjs/testing';
import { AmenityItemController } from '../amenity-item.controller';

describe('AmenityItemController', () => {
  let controller: AmenityItemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AmenityItemController],
    }).compile();

    controller = module.get<AmenityItemController>(AmenityItemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
