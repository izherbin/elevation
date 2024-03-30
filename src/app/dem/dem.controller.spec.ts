import { Test, TestingModule } from '@nestjs/testing';
import { DemController } from './dem.controller';
import { DemService } from './dem.service';

describe('DemController', () => {
  let controller: DemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DemController],
      providers: [DemService],
    }).compile();

    controller = module.get<DemController>(DemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
