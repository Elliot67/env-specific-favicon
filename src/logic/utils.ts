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
