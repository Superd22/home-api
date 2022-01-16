import { Module, OnModuleInit } from '@nestjs/common'
import { App } from 'cdk8s'
import { HomeAssistant } from './charts/home-assistant.chart';
import { HomeAPI } from './charts/homeapi.chart'
import { Minecraft } from './charts/minecraft.charts';
import { Satisfactory } from './charts/satisfactory.chart';
import { Traefik } from './charts/traefik.chart'

@Module({
  imports: [],
  controllers: [],
  providers: [],
})
export class AppModule implements OnModuleInit {

    onModuleInit() {
        const app = new App();
        new Traefik(app);
        new HomeAPI(app);
        new HomeAssistant(app);
        new Minecraft(app);
        // new Satisfactory(app);
        app.synth();
    }

}
