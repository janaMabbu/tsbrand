/**
 * Type-only tests. These run at compile-time via vitest's `expectTypeOf`.
 * No runtime assertions — the test file will fail to compile if types regress.
 */
import { assertType, describe, expectTypeOf, it } from 'vitest'
import { brand, isBrand, unbrand } from '../src/index.js'
import type { Brand } from '../src/index.js'

type UserId = Brand<string, 'UserId'>
type AccountId = Brand<string, 'AccountId'>
type OrderCount = Brand<number, 'OrderCount'>

describe('Brand type', () => {
  it('is assignable to its base type', () => {
    const id = brand<UserId>('user-1')
    expectTypeOf(id).toExtend<string>()
  })

  it('UserId is NOT assignable to AccountId', () => {
    const userId = brand<UserId>('u-1')
    // @ts-expect-error — UserId must not be accepted where AccountId is expected
    assertType<AccountId>(userId)
  })

  it('AccountId is NOT assignable to UserId', () => {
    const accountId = brand<AccountId>('a-1')
    // @ts-expect-error — AccountId must not be accepted where UserId is expected
    assertType<UserId>(accountId)
  })
})

describe('brand() return type', () => {
  it('returns exactly UserId when called with brand<UserId>', () => {
    const id = brand<UserId>('user-1')
    expectTypeOf(id).toEqualTypeOf<UserId>()
  })

  it('returns exactly OrderCount when called with brand<OrderCount>', () => {
    const count = brand<OrderCount>(5)
    expectTypeOf(count).toEqualTypeOf<OrderCount>()
  })

  it('rejects wrong base type: brand<UserId>(123) is a type error', () => {
    // @ts-expect-error — UserId wraps string, passing number must be rejected
    brand<UserId>(123)
  })

  it('rejects wrong base type: brand<OrderCount>("str") is a type error', () => {
    // @ts-expect-error — OrderCount wraps number, passing string must be rejected
    brand<OrderCount>('five')
  })
})

describe('unbrand() return type', () => {
  it('returns string when unbranding a string-based brand', () => {
    const id = brand<UserId>('user-2')
    expectTypeOf(unbrand(id)).toEqualTypeOf<string>()
  })

  it('returns number when unbranding a number-based brand', () => {
    const count = brand<OrderCount>(10)
    expectTypeOf(unbrand(count)).toEqualTypeOf<number>()
  })
})

describe('isBrand() narrowing', () => {
  it('narrows unknown to the branded type inside the if-block', () => {
    const value: unknown = 'some-value'
    const isString = (v: unknown): v is string => typeof v === 'string'
    if (isBrand<UserId>(value, isString)) {
      expectTypeOf(value).toEqualTypeOf<UserId>()
    }
  })
})

describe('function signatures enforce brand boundaries', () => {
  it('a function expecting AccountId rejects UserId', () => {
    function getAccount(id: AccountId): void { void id }

    const userId = brand<UserId>('u-99')
    // @ts-expect-error — UserId is not AccountId
    getAccount(userId)
  })

  it('a function expecting AccountId accepts AccountId', () => {
    function getAccount(id: AccountId): void { void id }

    const accountId = brand<AccountId>('a-99')
    // No error expected
    getAccount(accountId)
  })
})
