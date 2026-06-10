declare const __brand: unique symbol
// Stores T at the type level so BaseOf can extract it via a direct index lookup
// rather than relying on conditional-type inference over intersections (which TypeScript
// cannot reliably decompose: `T & { [sym]: B }` → infer T).
declare const __base: unique symbol

/**
 * Brands a base type `T` with a string tag `B`, producing a nominal type.
 *
 * @example
 * type UserId = Brand<string, 'UserId'>
 * type AccountId = Brand<string, 'AccountId'>
 * // UserId and AccountId are now incompatible even though both wrap string.
 */
export type Brand<T, B extends string> = T & {
  readonly [__brand]: B
  readonly [__base]: T  // phantom — never present at runtime, enables BaseOf inference
}

/**
 * Extracts the underlying base type from a branded type.
 * Uses a direct index-access lookup so TypeScript resolves it unambiguously.
 *
 * @internal Not part of the public API — consumed by the function signatures.
 */
export type BaseOf<B extends Brand<any, any>> = B extends { readonly [__base]: infer T }
  ? T
  : never
