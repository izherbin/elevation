import { Test, TestingModule } from '@nestjs/testing';
import { DemService } from './dem.service';

describe('DemService', () => {
  let service: DemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DemService],
    }).compile();

    service = module.get<DemService>(DemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
