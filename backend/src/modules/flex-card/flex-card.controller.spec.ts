import { Test, TestingModule } from '@nestjs/testing';
import { FlexCardController } from './flex-card.controller';

describe('FlexCardController', () => {
  let controller: FlexCardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FlexCardController],
    }).compile();

    controller = module.get<FlexCardController>(FlexCardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
