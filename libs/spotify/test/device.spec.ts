import { Test, TestingModule } from '@nestjs/testing';
import { SpotifyModule } from '../src/spotify.module';
import { INestApplication } from '@nestjs/common';

describe('SpotifyService', () => {
  let app: INestApplication

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [SpotifyModule],
    }).compile();

    await module.init()
    // app = module.createNestApplication()
    // await app.init()

  });


  afterAll(async () => {
    // await app.close()
  })

  it('should be defined', (cb) => {
    console.log("jtm")
    jest.setTimeout(50000);
  });

});
