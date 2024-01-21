import type { ProtocolWithReturn } from 'webext-bridge';
import { AppDataRule } from '~/types/app';

declare module 'webext-bridge' {
  export interface ProtocolMap {
    // To define ReturnTypes : ProtocolWithReturn<M, R>
    'get-favicon': ProtocolWithReturn<AppDataRule, { favicon: string }>;
    'get-match': ProtocolWithReturn<
      {
        url: string;
        title: string;
      },
      AppDataRule['id'] | null
    >;
    'get-favicon-from-links': ProtocolWithReturn<
      { matchId: AppDataRule['id']; links: string[] },
      { favicon: string } | null
    >;
  }
}
