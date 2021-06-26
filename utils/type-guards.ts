export function isNull(value: unknown): value is null {
  return value === null;
}

export function isUndefined(value: unknown): value is undefined {
  return value === undefined;
}

export function isDefined<T>(value: T | null | undefined): value is Exclude<T, null | undefined> {
  return !isNull(value) && !isUndefined(value)
}

export function isString (value: unknown): value is string {
  return typeof value === 'string';
}

export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

export function isNumber(value: unknown): value is number {
  return typeof value == 'number';
}

export function inNaN(value: unknown) {
  return Number.isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value == 'boolean';
}