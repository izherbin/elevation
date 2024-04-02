import { Test, TestingModule } from '@nestjs/testing';
import { ElevationService } from './elevation.service';

describe('ElevationService', () => {
  let service: ElevationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ElevationService],
    }).compile();

    service = module.get<ElevationService>(ElevationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
