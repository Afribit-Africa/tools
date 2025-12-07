'use client';

import { useEffect, useRef } from 'react';

interface SecureStorageOptions {
  timeout?: number; // in milliseconds
  onExpire?: () => void;
}

export class SecureStorage {
  private static instance: SecureStorage;
  private storage: Map<string, { value: string; expiry: number }> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {
    // Clear all on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.clearAll();
      });
    }
  }

  static getInstance(): SecureStorage {
    if (!SecureStorage.instance) {
      SecureStorage.instance = new SecureStorage();
    }
    return SecureStorage.instance;
  }

  set(key: string, value: string, options?: SecureStorageOptions): void {
    const timeout = options?.timeout || 30 * 60 * 1000; // Default 30 minutes
    const expiry = Date.now() + timeout;

    // Clear existing timer if any
    const existingTimer = this.timers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Store value
    this.storage.set(key, { value, expiry });

    // Set expiration timer
    const timer = setTimeout(() => {
      this.remove(key);
      if (options?.onExpire) {
        options.onExpire();
      }
    }, timeout);

    this.timers.set(key, timer);
  }

  get(key: string): string | null {
    const item = this.storage.get(key);
    if (!item) return null;

    // Check if expired
    if (Date.now() > item.expiry) {
      this.remove(key);
      return null;
    }

    return item.value;
  }

  remove(key: string): void {
    this.storage.delete(key);
    const timer = this.timers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(key);
    }
  }

  clearAll(): void {
    this.storage.clear();
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
  }

  getRemainingTime(key: string): number {
    const item = this.storage.get(key);
    if (!item) return 0;
    return Math.max(0, item.expiry - Date.now());
  }

  extend(key: string, additionalTime: number): boolean {
    const item = this.storage.get(key);
    if (!item) return false;

    const newExpiry = Date.now() + additionalTime;
    this.storage.set(key, { value: item.value, expiry: newExpiry });

    // Clear and reset timer
    const existingTimer = this.timers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(() => {
      this.remove(key);
    }, additionalTime);

    this.timers.set(key, timer);
    return true;
  }
}

// Hook for secure storage
export function useSecureStorage() {
  const storageRef = useRef(SecureStorage.getInstance());

  useEffect(() => {
    return () => {
      // Cleanup on component unmount
      storageRef.current.clearAll();
    };
  }, []);

  return storageRef.current;
}

// Utility to mask sensitive data for display
export function maskApiKey(key: string): string {
  if (!key || key.length < 8) return '****';
  return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`;
}
