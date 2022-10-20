import { Test, TestingModule } from '@nestjs/testing';
import { HouseCouncilController } from '../house-council.controller';

describe('HouseCouncilController', () => {
  let controller: HouseCouncilController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HouseCouncilController],
    }).compile();

    controller = module.get<HouseCouncilController>(HouseCouncilController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
