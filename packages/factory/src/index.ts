import { CF } from '@repro/common'

export interface Env {
  DB: any
}

// ❌ This causes the portable type error when exported and inferred
export const createClass = () => {
  return class {
    constructor(public state: CF.DurableObjectState, public env: Env) {}
    
    async fetch(): Promise<any> {
      return { status: 200, body: 'Hello' }
    }
  }
}

// ✅ This works - type aliases fix the issue
export type State = CF.DurableObjectState
export type DurableObject = CF.DurableObject

export type CreateClassFixed = () => {
  new (state: State, env: Env): DurableObject
}

export const createClassFixed: CreateClassFixed = () => {
  return class {
    constructor(public state: State, public env: Env) {}
    
    async fetch(): Promise<any> {
      return { status: 200, body: 'Hello' }
    }
  }
}