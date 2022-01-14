import { Test, TestingModule } from '@nestjs/testing';
import { HomeAssistantController } from './home-assistant.controller';
import { HomeAssistantService } from './home-assistant.service';

describe('HomeAssistantController', () => {
  let homeAssistantController: HomeAssistantController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [HomeAssistantController],
      providers: [HomeAssistantService],
    }).compile();

    homeAssistantController = app.get<HomeAssistantController>(HomeAssistantController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(homeAssistantController.getHello()).toBe('Hello World!');
    });
  });
});
