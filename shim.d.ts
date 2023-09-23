import type { ProtocolWithReturn } from 'webext-bridge';
import { AppDataRule } from '~/types/app';

declare module 'webext-bridge' {
  export interface ProtocolMap {
    // To define ReturnTypes : ProtocolWithReturn<M, R>
    'get-favicon': ProtocolWithReturn<AppDataRule, { favicon: string }>;
    'get-favicon-from-links': ProtocolWithReturn<string[], { favicon: string } | null>;
  }
}
