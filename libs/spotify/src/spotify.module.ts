import { Module, OnModuleInit, HttpModule } from '@nestjs/common';
import { SpotifyService } from './spotify.service';
import { SpotifyDevice } from './device/spotify-device.service';
import { LgtvModule } from '@homeapi/lgtv';

@Module({
  imports: [HttpModule, LgtvModule],
  providers: [SpotifyService, SpotifyDevice],
  exports: [SpotifyService],
})
export class SpotifyModule implements OnModuleInit {

  constructor(
    protected readonly device: SpotifyDevice
  ) { }

  async onModuleInit(): Promise<void> {
    await this.device.init()
  }

}
