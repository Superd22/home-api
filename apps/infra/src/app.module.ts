import { Module, OnModuleInit } from '@nestjs/common'
import { App } from 'cdk8s'
import { HomeAPI } from './charts/homeapi.chart'
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
        app.synth();
    }

}
