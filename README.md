# TypeScript Portable Type Issue Reproduction

**Related Issue**: https://github.com/microsoft/TypeScript/issues/55021

Minimal reproduction of TypeScript error TS2742 with Cloudflare Workers types across package boundaries in monorepo.

## The Error

This reproduction successfully triggers the exact TypeScript portable type error:

```bash
> pnpm build

consumer/src/index.ts(5,14): error TS2742: The inferred type of 'MyDurableObjectClass' cannot be named without a reference to '../../packages/common/node_modules/@cloudflare/workers-types'. This is likely not portable. A type annotation is necessary.
 ELIFECYCLE  Command failed with exit code 2.
```

## Reproduction

```bash
pnpm install
pnpm build
```

## Root Cause

The error occurs when TypeScript tries to generate `.d.ts` files for a factory function that returns a class with deep namespace type references (`CF.DurableObjectState`, `CF.DurableObject`) across package boundaries. TypeScript cannot create a portable reference to the deep `node_modules/@cloudflare/workers-types` path.

## The Problematic Pattern

**❌ Triggers TS2742 error** (`packages/factory/src/index.ts`):
```typescript
export const createDurableObjectClass = (options?: ComplexOptions) => {
  return class MyDurableObject implements CF.DurableObject {
    constructor(public state: CF.DurableObjectState, public env: Env) {}
    
    getState(): CF.DurableObjectState {
      return this.state
    }
  }
}
```

**✅ Fixed with type aliases** (same file):
```typescript
export type DoState = CF.DurableObjectState
export type DoObject = CF.DurableObject

export const createDurableObjectClassFixed = (options?: ComplexOptions) => {
  return class MyDurableObjectFixed implements DoObject {
    constructor(public state: DoState, public env: Env) {}
    
    getState(): DoState {
      return this.state
    }
  }
}
```

## Structure

- `packages/common` - Re-exports `@cloudflare/workers-types` under `CF` namespace
- `packages/factory` - Factory functions (broken & fixed versions)
- `consumer` - Exports factory result, triggering the error during `.d.ts` generation

## Configuration

Uses TypeScript configuration matching the original project's `tsconfig.base.json`:
- `target: "ESNext"`, `module: "ESNext"`, `moduleResolution: "node"`
- Strict TypeScript settings with composite project references
- `skipLibCheck: true` to avoid DOM type conflicts

## Solution

The fix is to create type aliases at the module level rather than using namespace types directly in complex return types. This gives TypeScript stable reference points that don't require deep node_modules paths in declaration files.