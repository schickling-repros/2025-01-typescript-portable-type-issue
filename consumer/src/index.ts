import { createClass } from '@repro/factory'

// This export will trigger the portable type error
// because TypeScript needs to infer the return type of createClass()
export const MyClass = createClass()