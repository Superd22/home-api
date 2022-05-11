import { Test, TestingModule } from '@nestjs/testing';
import { CtsdkService } from './ctsdk.service';

describe('CtsdkService', () => {
  let service: CtsdkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CtsdkService],
    }).compile();

    service = module.get<CtsdkService>(CtsdkService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
