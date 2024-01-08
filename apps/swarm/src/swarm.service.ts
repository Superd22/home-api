import { App } from '@homeapi/ctsdk';
import { Injectable, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class SwarmApp extends App {


  constructor(
    protected readonly moduleRef: ModuleRef
  ) {
    super()
  }

  /**
   * Get a construct in this app
   */
  public get<T>(type: Type<T>): T {
    return this.moduleRef.get(type)
  }
  
}
