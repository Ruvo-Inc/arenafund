import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from './mocks/server'

// Fix URL construction for test environment
// Override the ApplicationService API_BASE for tests
Object.defineProperty(global, 'window', {
  value: undefined,
  writable: true
});

// Establish API mocking before all tests
beforeAll(() => {
  server.listen({ 
    onUnhandledRequest: 'warn' // Changed from 'error' to 'warn' for better debugging
  })
})

// Reset any request handlers that we may add during the tests
afterEach(() => server.resetHandlers())

// Clean up after the tests are finished
afterAll(() => server.close())

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

// Mock environment variables for integration tests
process.env.FIREBASE_PROJECT_ID = 'test-project'
process.env.FIREBASE_CLIENT_EMAIL = 'test@test-project.iam.gserviceaccount.com'
process.env.FIREBASE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKB\nxjRRxwKv7C2N4PQFQP0+2sDbf2h6via2DGTXQhiRuetsXMQ4/o:9EQavph6LFTnAwLoVwLHHHXLdyAmCUqkaMVhz5eErk5ssah5aAoTSGDiQiGjQmTXkSBjHK3sUBUSjcYao5QjKzqM+OyQdyN5aPKK1E+JZbxtbqBYraNfOd7d9xo6hKGRp2PQ8eMBnzrGrHzuLuM0YndcxowHPgrhRLSdHdrfn1jn/4FjFLJw8d246yLDdw7MuAG5lCcAuoqWcg5+0i2NYbt2ZfxtHPFHqbrnbcqo+RIqUyDzHw6hzky7ZzYcMjLiMrAu2Qg4Vf6+sgHhHXSiN1DKDMD8GASIdMFUwmDjUvYlx5KKXm+PC7AQrDVwGGwwqQAAAAMBAAECggEBALdwxaBH4Vy9gfs0FA8HkdNiN8ia7wJAiSdoiHB+AjdTWqI0Z4a4r7HxvDuzHBwutdz8vI+5uJWxCx+Lo2AL1eYHXunbHxNBAmUZjGJRPFDtUbkqz5P5w9lSdNIgG3RTnOieInYngtSFkkjb3eB3RiGT46z4hy7rA9nVRBQZOQSEeVYs8UofGl/OvxLTAoGBAOjIwIXGwLR+qQdtOZhgSgsOjcnXkQbPBarfSx+RJv+eai+BzUGBjHiLiPtMUVufKlG+vQ5g7ATtEeqyRVa7DSTG+QqPD5Boyf0s2lFhd7uJUJ5lMEKmEi9pXP+nBG5WD01pKpXnZBrSBUkrb9YzI/dXAoGBANWwQBAHw6jQmlWh+uuT1K2WApqGqeN3ckVzBQGKykuN3K4+P2nJxoXvHSCyqHy1KX5VhGD0Au2zDkYRoABBo/1BuFqwPaFMa5avxhRXAVvar7lLKrJF0trfkYVqBVKkxwlXGjgHBXP+RhpuPWC5xKVpEtFSxVmMFbaGGgVd6'
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'test-project.appspot.com'
process.env.OPS_EMAILS = 'test@thearenafund.com'
process.env.NEXT_PUBLIC_ENV = 'test'
process.env.OPS_WEBHOOK_URL = 'https://hooks.test.com/webhook'