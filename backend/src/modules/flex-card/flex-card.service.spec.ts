import { Test, TestingModule } from '@nestjs/testing';
import { FlexCardService } from './flex-card.service';

describe('FlexCardService', () => {
  let service: FlexCardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FlexCardService],
    }).compile();

    service = module.get<FlexCardService>(FlexCardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
