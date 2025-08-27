import { beforeAll, afterEach, afterAll, beforeEach } from 'vitest'
import { server } from './mocks/server'
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'

// Mock environment variables BEFORE importing any modules
(process.env as any).NODE_ENV = 'test'
process.env.FIREBASE_PROJECT_ID = 'test-project'
process.env.FIREBASE_CLIENT_EMAIL = 'test@test-project.iam.gserviceaccount.com'
process.env.FIREBASE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKB\n-----END PRIVATE KEY-----'
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'test-project.appspot.com'
process.env.OPS_EMAILS = 'test@thearenafund.com'
process.env.NEXT_PUBLIC_ENV = 'test'
process.env.OPS_WEBHOOK_URL = 'https://hooks.test.com/webhook'

// Mock File constructor for Node.js environment
global.File = class File {
  name: string
  type: string
  size: number
  lastModified: number
  
  constructor(bits: BlobPart[], name: string, options?: FilePropertyBag) {
    this.name = name
    this.type = options?.type || ''
    this.lastModified = options?.lastModified || Date.now()
    this.size = bits.reduce((size, bit) => {
      if (typeof bit === 'string') return size + bit.length
      if (bit instanceof ArrayBuffer) return size + bit.byteLength
      if (bit instanceof Uint8Array) return size + bit.length
      if (typeof bit === 'object' && 'size' in bit) return size + (bit as any).size
      return size
    }, 0)
  }
  
  slice(start?: number, end?: number, contentType?: string): Blob {
    return new Blob([], { type: contentType || this.type })
  }
  
  stream(): ReadableStream {
    return new ReadableStream()
  }
  
  text(): Promise<string> {
    return Promise.resolve('')
  }
  
  arrayBuffer(): Promise<ArrayBuffer> {
    return Promise.resolve(new ArrayBuffer(0))
  }
} as any

// Mock Blob for completeness
global.Blob = class Blob {
  size: number
  type: string
  
  constructor(blobParts?: BlobPart[], options?: BlobPropertyBag) {
    this.type = options?.type || ''
    this.size = (blobParts || []).reduce((size, bit) => {
      if (typeof bit === 'string') return size + bit.length
      if (bit instanceof ArrayBuffer) return size + bit.byteLength
      if (bit instanceof Uint8Array) return size + bit.length
      return size
    }, 0)
  }
  
  slice(start?: number, end?: number, contentType?: string): Blob {
    return new Blob([], { type: contentType || this.type })
  }
  
  stream(): ReadableStream {
    return new ReadableStream()
  }
  
  text(): Promise<string> {
    return Promise.resolve('')
  }
  
  arrayBuffer(): Promise<ArrayBuffer> {
    return Promise.resolve(new ArrayBuffer(0))
  }
} as any

// Mock ResizeObserver for jsdom
(global as any).ResizeObserver = function(callback: any) {
  return {
    observe: () => {},
    unobserve: () => {},
    disconnect: () => {}
  };
} as any

// Mock IntersectionObserver for jsdom
(global as any).IntersectionObserver = function(callback: any, options?: any) {
  return {
    observe: () => {},
    unobserve: () => {},
    disconnect: () => {}
  };
} as any

// Mock matchMedia for jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
})

// Mock scrollTo for jsdom
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: () => {},
})

// Establish API mocking before all tests
beforeAll(() => {
  server.listen({ 
    onUnhandledRequest: 'warn' // Use warn instead of error for better debugging
  })
})

// Clean up after each test
afterEach(() => {
  server.resetHandlers()
  cleanup() // Clean up React Testing Library
})

// Clean up after the tests are finished
afterAll(() => server.close())