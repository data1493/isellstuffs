import { AsyncLocalStorage } from "node:async_hooks";

// Next's bundled fake throws "AsyncLocalStorage accessed in runtime where it
// is not available" unless the real class is already on globalThis. Node does
// not put it there. The middleware test loads Next, and a leftover task hits
// that fake after the assertions pass.
if (typeof globalThis.AsyncLocalStorage !== "function") {
  globalThis.AsyncLocalStorage = AsyncLocalStorage;
}
