import { Module, OnModuleInit } from '@nestjs/common';
import { App, Chart, ChartProps } from 'cdk8s';
import { MyChart } from './charts/test.chart';

@Module({
  imports: [],
  controllers: [],
  providers: [],
})
export class AppModule implements OnModuleInit {

    onModuleInit() {
        const app = new App();
        new MyChart(app, 'hello');
        app.synth();
    }

}
