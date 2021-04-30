import { Module, OnModuleInit } from '@nestjs/common'
import { App, Chart, ChartProps } from 'cdk8s'
import { WhoAmI } from './charts/test.chart'
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
        new WhoAmI(app)
        app.synth();
    }

}
