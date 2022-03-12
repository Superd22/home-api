import { Injectable } from '@nestjs/common';
import { App } from 'cdk8s';

@Injectable()
export class CDK8SApp extends App {}
