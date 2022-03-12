import { Injectable, Logger, Module, OnModuleInit, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { App, Chart } from 'cdk8s';
import { HomeAssistant } from './charts/home-assistant.chart';
import { HomeAPI } from './charts/homeapi.chart';
import { Traefik } from './charts/traefik.chart';
import { IngressService } from './services/ingress.service';
import { CDK8SApp } from './app.service'

const services = [
  IngressService
]

const activatedCharts: Type<Chart>[] = [
  Traefik,
  HomeAPI,
  HomeAssistant
];

@Module({
  imports: [],
  controllers: [],
  providers: [
    CDK8SApp,
    ...services,
    ...activatedCharts,
  ],
})
export class AppModule implements OnModuleInit {

  private readonly logger = new Logger(AppModule.name);

  constructor(
    protected readonly app: CDK8SApp,
    protected readonly moduleRef: ModuleRef,
  ) {}

  public onModuleInit() {
    for (const Chart of activatedCharts) {
      // Getting them only to instanciate them
      const chart = this.moduleRef.get(Chart);
      this.logger.debug(`Activated chart ${Chart.name}`)
    }

    this.logger.log('Synthing.')
    this.app.synth();
  }
}
