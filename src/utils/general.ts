export function generateId(): string {
  return (Date.now().toString(36) + Math.random().toString(36).substr(2, 11)).toUpperCase();
}

export function isString(data: unknown): data is string {
  return typeof data === 'string';
}

export function isUndefined<T>(data: T | undefined): data is undefined {
  return typeof data === 'undefined';
}

export function isBool<T>(data: T | boolean): data is boolean {
  return typeof data === 'boolean';
}

export function isNull(data: unknown): data is null {
  return data === null;
}

export function isDef<T>(data: T | null | undefined | ''): data is T {
  return !isUndefined(data) && !isNull(data) && data !== '';
}

export function isOdd(num: number): boolean {
  return !!(num % 2);
}

export const throttle = (fn: any, delay: number) => {
  let timeout: null | number = null;
  let needEndCall = false;

  return () => {
    if (timeout === null) {
      fn();
      timeout = window.setTimeout(() => {
        if (needEndCall) {
          fn();
        }
        timeout = null;
        needEndCall = false;
      }, delay);
    } else {
      needEndCall = true;
    }
  };
};

// https://gist.github.com/jlevy/c246006675becc446360a798e2b2d781
export function hashString(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash &= hash; // Convert to 32bit integer
  }
  return new Uint32Array([hash])[0].toString(36);
}
