import { Test, TestingModule } from '@nestjs/testing';
import { WindowsModule } from './windows.module';
import { WindowsService } from './windows.service';

describe('WindowsService', () => {
  let service: WindowsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [WindowsModule],
    }).compile();

    service = module.get<WindowsService>(WindowsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('Should work', async () => {
      await service.turnOffMonitors()
      console.log("called")
  })
});
