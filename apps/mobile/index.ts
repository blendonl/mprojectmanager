import 'reflect-metadata';
import { registerRootComponent } from 'expo';
import { Buffer } from 'buffer';

(global as any).Buffer = Buffer;

if (typeof (global as any).requestIdleCallback === 'undefined') {
  (global as any).requestIdleCallback = (cb: IdleRequestCallback, options?: IdleRequestOptions) => {
    const start = Date.now();
    return setTimeout(() => {
      cb({
        didTimeout: false,
        timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
      });
    }, 1);
  };

  (global as any).cancelIdleCallback = (id: number) => {
    clearTimeout(id);
  };
}

import 'expo-router/entry';
