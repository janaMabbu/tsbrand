# tsbrand

Ergonomic branded types for TypeScript.

## The bug it prevents

```ts
function getAccount(id: AccountId) { /* ... */ }

getAccount(userId)    // ✘ TypeScript error — caught at compile time
getAccount(accountId) // ✔ ok
```

Without branded types both `userId` and `accountId` are plain `string`s. TypeScript
accepts them interchangeably and the mix-up silently reaches production.

## Install

```sh
npm install tsbrand
```

## API

### `Brand<T, B>`

```ts
import type { Brand } from 'tsbrand'

type UserId    = Brand<string, 'UserId'>
type AccountId = Brand<string, 'AccountId'>
type OrderCount = Brand<number, 'OrderCount'>
```

Creates a nominal type from any base type `T` and a string tag `B`. Two branded
types that share the same base type are still incompatible with each other.

---

### `brand<B>(value)`

```ts
import { brand } from 'tsbrand'

const userId    = brand<UserId>('user-123')
const accountId = brand<AccountId>('acc-456')
```

Casts `value` to branded type `B`. **Runtime no-op** — compiles to a plain
identity cast. TypeScript enforces that `value` matches the base type of `B`.

---

### `unbrand(value)`

```ts
import { unbrand } from 'tsbrand'

const raw: string = unbrand(userId) // 'user-123'
```

Strips the brand and returns the underlying type. Also a runtime no-op.

---

### `isBrand<B>(value, guard)`

```ts
import { isBrand } from 'tsbrand'

const isUserId = (v: unknown): v is UserId =>
  isBrand<UserId>(v, (x): x is string => typeof x === 'string')

if (isUserId(maybeId)) {
  // maybeId is narrowed to UserId here
}
```

A type guard that narrows `unknown` to branded type `B`. You supply the
base-type guard; `tsbrand` layers the brand on top of it.

## Recipe: runtime validation with Zod

Pair `tsbrand` with Zod (or any validator) at I/O boundaries. The validator
owns *"is this value valid?"* — `tsbrand` owns *"which flavour of valid is it?"*

```ts
import { z } from 'zod'
import { brand } from 'tsbrand'
import type { Brand } from 'tsbrand'

type UserId = Brand<string, 'UserId'>

const UserIdSchema = z
  .string()
  .uuid()
  .transform((v) => brand<UserId>(v))

// At your API boundary:
const userId = UserIdSchema.parse(req.params.id) // UserId | throws
```

Inside your domain code you never call `brand()` again — the schema is the
single source of truth for both shape and nominal type.

## Why a library at all?

You can absolutely write the three lines yourself:

```ts
declare const __brand: unique symbol
type Brand<T, B extends string> = T & { readonly [__brand]: B }
const brand = <B extends Brand<any, any>>(v: any): B => v
```

The library gives you:

- The correct encoding (unique symbol, readonly, no string pollution).
- `unbrand` and `isBrand` with proper signatures.
- A single import path so the pattern is consistent across the codebase.
- A published type that shows up in auto-complete across packages in a monorepo.

## License

MIT © 2024
