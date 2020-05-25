import { Test, TestingModule } from '@nestjs/testing';
import { OvpnService } from './ovpn.service';

describe('OvpnService', () => {
  let service: OvpnService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OvpnService],
    }).compile();

    service = module.get<OvpnService>(OvpnService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
