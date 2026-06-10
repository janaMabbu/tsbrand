import type { BaseOf, Brand } from './types.js'

/**
 * Casts `value` to the branded type `B` at compile time.
 * At runtime this is a pure identity function — zero overhead.
 *
 * @example
 * type UserId = Brand<string, 'UserId'>
 * const id = brand<UserId>('user-123')
 */
export function brand<B extends Brand<any, any>>(value: BaseOf<B>): B {
  return value as any as B
}

/**
 * Strips the brand from a branded value, returning the underlying type.
 * At runtime this is a pure identity function — zero overhead.
 *
 * @example
 * const raw: string = unbrand(userId)
 */
export function unbrand<B extends Brand<any, any>>(value: B): BaseOf<B> {
  return value as any as BaseOf<B>
}

/**
 * Type guard that narrows `value` to branded type `B` when the provided
 * base-type guard passes.
 *
 * @param value  - The unknown value to test.
 * @param guard  - A type guard for the underlying base type (e.g. `(v): v is string => typeof v === 'string'`).
 *
 * @example
 * const isUserId = (v: unknown): v is UserId =>
 *   isBrand<UserId>(v, (x): x is string => typeof x === 'string')
 */
export function isBrand<B extends Brand<any, any>>(
  value: unknown,
  guard: (v: unknown) => v is BaseOf<B>,
): value is B {
  return guard(value)
}
