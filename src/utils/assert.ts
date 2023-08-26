export type NonNullable<T> = T extends null | undefined ? never : T;

export function assertDefined<TValue>(value: TValue, message: string): asserts value is NonNullable<TValue> {
  if (value === null || value === undefined) {
    throw Error(message);
  }
}
