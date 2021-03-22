import { Test, TestingModule } from '@nestjs/testing';
import { WindowsResolver } from './windows.resolver';

describe('WindowsResolver', () => {
  let resolver: WindowsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WindowsResolver],
    }).compile();

    resolver = module.get<WindowsResolver>(WindowsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
