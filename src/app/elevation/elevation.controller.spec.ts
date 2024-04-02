import { Test, TestingModule } from '@nestjs/testing';
import { ElevationController } from './elevation.controller';
import { ElevationService } from './elevation.service';

describe('ElevationController', () => {
  let controller: ElevationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ElevationController],
      providers: [ElevationService],
    }).compile();

    controller = module.get<ElevationController>(ElevationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
