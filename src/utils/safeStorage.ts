// Safe Storage abstraction for iframes, partitioned storage, and private browsing

class MemoryStore {
  private store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

class SafeStorageWrapper {
  private fallback = new MemoryStore();
  private hasNativeStorage = false;

  constructor() {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        const testKey = '__revive_test_storage__';
        window.localStorage.setItem(testKey, testKey);
        window.localStorage.removeItem(testKey);
        this.hasNativeStorage = true;
      }
    } catch {
      // Storage access blocked by iframe sandboxing or security policies
      this.hasNativeStorage = false;
    }
  }

  getItem(key: string, fallbackValue: string = ''): string {
    try {
      if (this.hasNativeStorage && typeof window !== 'undefined') {
        const val = window.localStorage.getItem(key);
        return val !== null ? val : fallbackValue;
      }
    } catch {
      // Access denied
    }
    return this.fallback.getItem(key) ?? fallbackValue;
  }

  setItem(key: string, value: string): void {
    try {
      if (this.hasNativeStorage && typeof window !== 'undefined') {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch {
      // Access denied
    }
    this.fallback.setItem(key, value);
  }

  removeItem(key: string): void {
    try {
      if (this.hasNativeStorage && typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
        return;
      }
    } catch {
      // Access denied
    }
    this.fallback.removeItem(key);
  }
}

export const safeStorage = new SafeStorageWrapper();
