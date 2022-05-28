import { Compose, Network } from "@homeapi/ctsdk";
import { Injectable } from "@nestjs/common";

export class PlexNetwork extends Network {
  constructor(scope: Compose) {
    super(scope, 'plex-network')
  }
}