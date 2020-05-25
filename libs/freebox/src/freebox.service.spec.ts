import { Test, TestingModule } from '@nestjs/testing';
import { FreeboxService } from './freebox.service';

describe('FreeboxService', () => {
  let service: FreeboxService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FreeboxService],
    }).compile();

    service = module.get<FreeboxService>(FreeboxService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
