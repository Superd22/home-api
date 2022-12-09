import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport'
import { Strategy, ExtractJwt } from 'passport-jwt'
import { passportJwtSecret } from 'jwks-rsa'

@Injectable()
export class JWKSStrategy extends PassportStrategy(Strategy) {

  constructor() {
    super(
      {
        secretOrKeyProvider: passportJwtSecret({
          jwksUri: 'https://sso.davidfain.com/application/o/gameservers/jwks/',
        }),
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
      } as ConstructorParameters<typeof Strategy>[0]
    )
  }

  public validate(payload: JWT) {
    return { 
      id: payload.sub,
      scopes: payload.scopes
    };
  }

}


interface JWT {
    iss: string
    sub: string
    aud: string
    exp: number,
    iat: number,
    auth_time: number,
    acr: string,
    scopes: Scope[],
    cid: string,
    uid: string
}

export enum Scope {
  InfraManager = 'infra-manager'
}