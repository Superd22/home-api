import { Test, TestingModule } from '@nestjs/testing';
import { LgtvService } from './lgtv.service';

describe('LgtvService', () => {
  let service: LgtvService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LgtvService],
    }).compile();

    service = module.get<LgtvService>(LgtvService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
