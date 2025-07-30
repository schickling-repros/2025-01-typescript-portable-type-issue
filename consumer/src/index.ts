import { createDurableObjectClass } from '@repro/factory'

// This export will trigger the portable type error
// because TypeScript needs to infer the complex return type with nested CF namespace references
export const MyDurableObjectClass = createDurableObjectClass({
  onMessage: async (state) => {
    console.log('Message received', state)
  }
})