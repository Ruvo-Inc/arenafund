// src/lib/firebase-admin-test.ts
/**
 * Test-specific Firebase Admin SDK implementation
 * Provides a complete mock implementation for integration testing
 */

interface MockFirestoreDoc {
  id: string;
  data: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

interface MockFirestoreCollection {
  docs: Map<string, MockFirestoreDoc>;
  name: string;
}

class MockFirestore {
  private collections = new Map<string, MockFirestoreCollection>();
  private transactionCallbacks: Array<(tx: MockTransaction) => Promise<void>> = [];

  collection(name: string) {
    if (!this.collections.has(name)) {
      this.collections.set(name, {
        docs: new Map(),
        name
      });
    }

    const collection = this.collections.get(name)!;

    return {
      doc: (id?: string) => {
        const docId = id || this.generateId();
        
        return {
          id: docId,
          set: async (data: any, options?: { merge?: boolean }) => {
            const now = new Date();
            const existingDoc = collection.docs.get(docId);
            
            const docData = {
              id: docId,
              data: options?.merge && existingDoc 
                ? { ...existingDoc.data, ...data }
                : data,
              createdAt: existingDoc?.createdAt || now,
              updatedAt: now
            };
            
            collection.docs.set(docId, docData);
            return { writeTime: now };
          },
          get: async () => {
            const doc = collection.docs.get(docId);
            return {
              exists: !!doc,
              id: docId,
              data: () => doc?.data || null,
              get: (field: string) => doc?.data?.[field],
              createTime: doc?.createdAt,
              updateTime: doc?.updatedAt
            };
          },
          update: async (data: any) => {
            const existingDoc = collection.docs.get(docId);
            if (!existingDoc) {
              throw new Error(`Document ${docId} does not exist`);
            }
            
            const now = new Date();
            const updatedDoc = {
              ...existingDoc,
              data: { ...existingDoc.data, ...data },
              updatedAt: now
            };
            
            collection.docs.set(docId, updatedDoc);
            return { writeTime: now };
          },
          delete: async () => {
            collection.docs.delete(docId);
            return { writeTime: new Date() };
          }
        };
      },
      add: async (data: any) => {
        const docId = this.generateId();
        const now = new Date();
        
        const docData = {
          id: docId,
          data,
          createdAt: now,
          updatedAt: now
        };
        
        collection.docs.set(docId, docData);
        
        return {
          id: docId,
          writeTime: now
        };
      },
      where: () => ({
        get: async () => ({
          docs: Array.from(collection.docs.values()).map(doc => ({
            id: doc.id,
            data: () => doc.data,
            exists: true
          }))
        })
      })
    };
  }

  async runTransaction<T>(callback: (transaction: MockTransaction) => Promise<T>): Promise<T> {
    const transaction = new MockTransaction(this);
    return await callback(transaction);
  }

  private generateId(): string {
    return 'test-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
  }

  // Test utilities
  clearCollection(name: string) {
    const collection = this.collections.get(name);
    if (collection) {
      collection.docs.clear();
    }
  }

  getCollectionData(name: string): MockFirestoreDoc[] {
    const collection = this.collections.get(name);
    return collection ? Array.from(collection.docs.values()) : [];
  }

  reset() {
    this.collections.clear();
  }
}

class MockTransaction {
  private operations: Array<() => Promise<any>> = [];

  constructor(private firestore: MockFirestore) {}

  async get(docRef: any) {
    // Mock transaction get - return the document
    return await docRef.get();
  }

  set(docRef: any, data: any, options?: { merge?: boolean }) {
    this.operations.push(() => docRef.set(data, options));
    return this;
  }

  update(docRef: any, data: any) {
    this.operations.push(() => docRef.update(data));
    return this;
  }

  delete(docRef: any) {
    this.operations.push(() => docRef.delete());
    return this;
  }

  async commit() {
    // Execute all operations
    for (const operation of this.operations) {
      await operation();
    }
    this.operations = [];
  }
}

class MockAuth {
  async verifyIdToken(token: string) {
    // Mock token verification
    if (token === 'invalid-token') {
      throw new Error('Invalid token');
    }
    
    return {
      uid: 'test-user-id',
      email: 'test@example.com',
      email_verified: true
    };
  }

  async createCustomToken(uid: string) {
    return `custom-token-${uid}`;
  }

  async getUser(uid: string) {
    return {
      uid,
      email: `${uid}@example.com`,
      emailVerified: true,
      disabled: false,
      metadata: {
        creationTime: new Date().toISOString(),
        lastSignInTime: new Date().toISOString()
      }
    };
  }
}

// Mock Firebase Admin SDK
const mockFirestore = new MockFirestore();
const mockAuth = new MockAuth();

// Mock admin object that matches the real Firebase admin structure
export const mockAdmin = {
  firestore: {
    FieldValue: {
      serverTimestamp: () => ({ _methodName: 'FieldValue.serverTimestamp' }),
      increment: (n: number) => ({ _methodName: 'FieldValue.increment', _value: n }),
      arrayUnion: (...elements: any[]) => ({ _methodName: 'FieldValue.arrayUnion', _elements: elements }),
      arrayRemove: (...elements: any[]) => ({ _methodName: 'FieldValue.arrayRemove', _elements: elements }),
      delete: () => ({ _methodName: 'FieldValue.delete' })
    },
    Timestamp: {
      now: () => ({
        seconds: Math.floor(Date.now() / 1000),
        nanoseconds: (Date.now() % 1000) * 1000000,
        toDate: function() { return new Date(this.seconds * 1000 + this.nanoseconds / 1000000); }
      }),
      fromDate: (date: Date) => ({
        seconds: Math.floor(date.getTime() / 1000),
        nanoseconds: (date.getTime() % 1000) * 1000000,
        toDate: () => date
      })
    }
  },
  apps: { length: 1 }, // Mock apps array
  initializeApp: () => ({}),
  auth: () => mockAuth
};

// Export mock functions that match the real Firebase admin API
export function ensureTestAdmin() {
  return { 
    db: mockFirestore, 
    auth: mockAuth 
  };
}

// Test utilities
export const testUtils = {
  clearAllData: () => mockFirestore.reset(),
  clearCollection: (name: string) => mockFirestore.clearCollection(name),
  getCollectionData: (name: string) => mockFirestore.getCollectionData(name),
  mockFirestore,
  mockAuth
};

// Replace the real admin in test environment
if (process.env.NODE_ENV === 'test' || process.env.VITEST === 'true') {
  // Mock the admin module
  const adminModule = require('firebase-admin');
  Object.assign(adminModule, mockAdmin);
}