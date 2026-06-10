import { describe, expect, it } from 'vitest'
import { brand, isBrand, unbrand } from '../src/index.js'
import type { Brand } from '../src/index.js'

type UserId = Brand<string, 'UserId'>
type AccountId = Brand<string, 'AccountId'>
type OrderCount = Brand<number, 'OrderCount'>

describe('brand()', () => {
  it('returns the exact same reference', () => {
    const raw = 'user-123'
    const id = brand<UserId>(raw)
    expect(id).toBe(raw)
  })

  it('works with number-based brands', () => {
    const raw = 42
    const count = brand<OrderCount>(raw)
    expect(count).toBe(raw)
  })
})

describe('unbrand()', () => {
  it('returns the underlying value unchanged', () => {
    const id = brand<UserId>('user-456')
    const raw = unbrand(id)
    expect(raw).toBe('user-456')
  })

  it('returns the same reference as the branded value', () => {
    const id = brand<UserId>('user-789')
    expect(unbrand(id)).toBe(id)
  })

  it('works with number-based brands', () => {
    const count = brand<OrderCount>(99)
    expect(unbrand(count)).toBe(99)
  })
})

describe('isBrand()', () => {
  const isString = (v: unknown): v is string => typeof v === 'string'
  const isNumber = (v: unknown): v is number => typeof v === 'number'

  it('returns true when the guard passes', () => {
    const id = brand<UserId>('user-001')
    expect(isBrand<UserId>(id, isString)).toBe(true)
  })

  it('returns false when the guard fails', () => {
    expect(isBrand<UserId>(42, isString)).toBe(false)
  })

  it('returns false for null', () => {
    expect(isBrand<UserId>(null, isString)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isBrand<UserId>(undefined, isString)).toBe(false)
  })

  it('works with number-based brands', () => {
    const count = brand<OrderCount>(7)
    expect(isBrand<OrderCount>(count, isNumber)).toBe(true)
    expect(isBrand<OrderCount>('seven', isNumber)).toBe(false)
  })

  it('narrowing: value is the branded type after guard', () => {
    const value: unknown = 'acc-999'
    if (isBrand<AccountId>(value, isString)) {
      // TypeScript should accept this as AccountId inside the if block
      const copy: AccountId = value
      expect(copy).toBe('acc-999')
    }
  })
})

describe('cross-brand isolation (runtime behaviour)', () => {
  it('brand and unbrand round-trip preserves the value', () => {
    const raw = 'some-id'
    const userId = brand<UserId>(raw)
    const recovered = unbrand(userId)
    expect(recovered).toBe(raw)
  })
})
