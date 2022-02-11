declare module 'webext-bridge' {
  export interface ProtocolMap {
    // To define ReturnTypes : ProtocolWithReturn<M, R>
    'update-favicon': { favicon: string };
  }
}
