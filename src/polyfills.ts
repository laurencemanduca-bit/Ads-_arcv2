// This file ensures window.fetch is writable to prevent errors from libraries trying to polyfill it.
// The error "Cannot set property fetch of #<Window> which has only a getter" occurs when a library
// tries to assign to window.fetch = ... but the environment has defined it as a getter-only property.

try {
  // Store the original fetch
  const originalFetch = window.fetch;

  // Check if fetch is already defined
  if (originalFetch) {
    const descriptor = Object.getOwnPropertyDescriptor(window, 'fetch');

    // If it's not writable or has only a getter, we try to redefine it as a value property
    if (descriptor && (!descriptor.writable || !descriptor.set)) {
      console.log('[Polyfills] Patching window.fetch to be writable...');

      Object.defineProperty(window, 'fetch', {
        value: function (...args: any[]) {
          return originalFetch.apply(window, args);
        },
        writable: true,
        configurable: true
      });
    }
  }
} catch (e) {
  console.warn('[Polyfills] Failed to patch window.fetch:', e);
}

export { };
