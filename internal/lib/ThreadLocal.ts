import { AsyncLocalStorage } from 'async_hooks';

export const defaultStorage = new AsyncLocalStorage();

/**
 * Executes a callback in a thread-local fashion.
 *
 * The ThreadLocal class is provided with a store that is made available
 * to the callback upon execution. It can access the store by using the
 * static {@link getStore} method.
 *
 * The value of the store is bound to the current call chain, also including
 * async operations and timers.
 *
 * Consider this example:
 *
 *     const tl1 = new ThreadLocal(42);
 *     const tl2 = new Threadlocal('value');
 *
 *     function print() {
 *         console.log(ThreadLocal.getStore());
 *     }
 *
 *     tl1.run(print);  // Will print '42'
 *     tl2.run(print);  // Will print 'value'
 *
 * Even though the print function uses the same global variable in both execution
 * cases, the underlying value (store) is different.
 */
export default class ThreadLocal {
    /**
     * Store value
     */
    public store: any;

    /**
     * Creates a new ThreadLocal executioner with the given store
     *
     * @param {any} store Store
     */
    constructor(store: any) {
        this.store = store;
    }

    /**
     * Runs callback in thread-local mode using the store
     *
     * @param callback Executed callback
     */
    run(callback: (...args: any[]) => unknown) {
        defaultStorage.run(this.store, callback);
    }

    /**
     * Returns the value of the thread-local store
     *
     * This function is to be invoked from a call chain started with
     * {@link ThreadLocal.run}
     */
    public static getStore(): unknown {
        return defaultStorage.getStore();
    }
}
