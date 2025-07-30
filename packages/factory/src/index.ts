import { CF } from '@repro/common'

export interface Env {
  DB: any
}

interface ComplexOptions {
  onMessage?: (state: CF.DurableObjectState) => Promise<void>
  onCreate?: (obj: CF.DurableObject) => void
}

// ❌ This causes the portable type error - complex return type with nested CF namespace references
export const createDurableObjectClass = (options?: ComplexOptions) => {
  return class MyDurableObject implements CF.DurableObject {
    constructor(public state: CF.DurableObjectState, public env: Env) {}
    
    async fetch(): Promise<any> {
      if (options?.onMessage) {
        await options.onMessage(this.state)
      }
      return { status: 200, body: 'Hello' }
    }
    
    getState(): CF.DurableObjectState {
      return this.state
    }
    
    getEnv(): Env {
      return this.env
    }
  }
}

// ✅ This works - type aliases fix the issue
export type DoState = CF.DurableObjectState
export type DoObject = CF.DurableObject

export const createDurableObjectClassFixed = (options?: ComplexOptions) => {
  return class MyDurableObjectFixed implements DoObject {
    constructor(public state: DoState, public env: Env) {}
    
    async fetch(): Promise<any> {
      return { status: 200, body: 'Hello' }
    }
    
    getState(): DoState {
      return this.state
    }
    
    getEnv(): Env {
      return this.env
    }
  }
}