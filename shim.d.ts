import { ProtocolWithReturn } from 'webext-bridge';
import { AppDataRule } from '~/types/app';

declare module 'webext-bridge' {
  export interface ProtocolMap {
    // To define ReturnTypes : ProtocolWithReturn<M, R>
    'update-favicon': { favicon: string };
    'get-favicon': ProtocolWithReturn<AppDataRule, { favicon: string }>;
  }
}
