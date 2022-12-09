import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JWKSStrategy } from './jwks.strategy';
import { JwtksAuthGuard } from './jwtks.guard';
import { ScopesGuard } from './scopes.guard';

@Module({
  providers: [
    JWKSStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtksAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ScopesGuard,
    },
  ],
  exports: [JWKSStrategy],
})
export class AuthModule { }
