import { Test, TestingModule } from '@nestjs/testing';
import { ServerManagerController } from './server-manager.controller';
import { ServerManagerService } from './server-manager.service';

describe('ServerManagerController', () => {
  let serverManagerController: ServerManagerController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ServerManagerController],
      providers: [ServerManagerService],
    }).compile();

    serverManagerController = app.get<ServerManagerController>(ServerManagerController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(serverManagerController.getHello()).toBe('Hello World!');
    });
  });
});
