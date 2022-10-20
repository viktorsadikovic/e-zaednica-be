import { Test, TestingModule } from '@nestjs/testing';
import { ResidentProfileController } from '../resident-profile.controller';

describe('ResidentProfileController', () => {
  let controller: ResidentProfileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResidentProfileController],
    }).compile();

    controller = module.get<ResidentProfileController>(ResidentProfileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
