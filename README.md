# TypeScript Portable Type Issue Reproduction

**Related Issue**: https://github.com/microsoft/TypeScript/issues/55021

Minimal reproduction of TypeScript error TS2742 with namespaced types across package boundaries in monorepo.

## Problem

When using types from deep namespace imports across package boundaries, TypeScript sometimes cannot create portable .d.ts files and throws:

```
error TS2742: The inferred type cannot be named without a reference to deep node_modules path. This is likely not portable. A type annotation is necessary.
```

## Reproduction Setup

```bash
pnpm install
pnpm build
```

*Note: This specific configuration may not trigger the error in all TypeScript versions, but demonstrates the problematic pattern.*

## The Pattern

**Problematic** - Direct namespace usage in constructor types:
```typescript
export const createClass = () => {
  return class {
    constructor(public state: CF.DurableObjectState, public env: Env) {}
  }
}
```

**Solution** - Type aliases at module level:
```typescript
export type State = CF.DurableObjectState
export type DurableObject = CF.DurableObject

export const createClass = () => {
  return class {
    constructor(public state: State, public env: Env) {}
  }
}
```

## Structure

- `packages/common` - Re-exports external types under namespace
- `packages/factory` - Factory function with the problematic pattern
- `consumer` - Imports and exports the factory result

The error occurs when TypeScript tries to generate portable declaration files but cannot resolve deep import paths across package boundaries in certain scenarios.