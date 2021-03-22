import { Test, TestingModule } from '@nestjs/testing';
import { LgtvService } from './lgtv.service';
import { LgtvModule } from './lgtv.module';

describe('LgtvService', () => {
  let service: LgtvService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [LgtvModule],
    }).compile();

    service = module.get<LgtvService>(LgtvService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('testy', async (cb) => {
    jest.setTimeout(50000)

    await service.turnOn()

  })

});
