import { isBool, isNull, isUndefined } from '~/utils/general';

type DataRef<D> = {
  data: D;
  ttlTs: number;
};

export interface CacheOptions {
  ttl: number;
  cleanup?: boolean | number;
}

export class TtlCache<K, D> {
  private refs = new Map<K, DataRef<D>>();

  private readonly ttl: number;
  private readonly cleanupInterval: number;
  private cleanupIntervalId: number | null = null;

  constructor(options: CacheOptions) {
    this.ttl = options.ttl;

    this.cleanupInterval =
      isUndefined(options.cleanup) || (isBool(options.cleanup) && options.cleanup)
        ? 1_000 * 60 * 5 // 5 minutes
        : isBool(options.cleanup) && !options.cleanup
          ? 0
          : options.cleanup;

    if (this.cleanupInterval > 0) {
      this.startAutoCleanup();
    }
  }

  public set(key: K, data: D) {
    const ref = {
      data,
      ttlTs: +new Date() + this.ttl,
    };
    this.refs.set(key, ref);
  }

  public get(key: K) {
    const ref = this.refs.get(key);
    if (isUndefined(ref)) {
      return undefined;
    }

    return this.isTtlValid(ref) ? ref.data : undefined;
  }

  public stopAutoCleanup() {
    if (!isNull(this.cleanupIntervalId)) {
      clearInterval(this.cleanupIntervalId);
    }
  }

  public clear() {
    this.refs.clear();
  }

  private isTtlValid<T>(ref: DataRef<T>): boolean {
    return ref.ttlTs > +new Date();
  }

  private startAutoCleanup() {
    // @ts-ignore
    this.cleanupIntervalId = setInterval(() => {
      this.doAutoCleanup();
    }, this.cleanupInterval);
  }

  private doAutoCleanup() {
    for (const [key, ref] of this.refs) {
      if (!this.isTtlValid(ref)) {
        this.refs.delete(key);
      }
    }
  }
}
