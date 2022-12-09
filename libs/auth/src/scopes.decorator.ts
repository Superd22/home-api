import { SetMetadata } from '@nestjs/common';
import { Scope } from './jwks.strategy';

export const SCOPES_KEY = 'scopes';
export const Scopes = (...roles: Scope[]) => SetMetadata(SCOPES_KEY, roles);