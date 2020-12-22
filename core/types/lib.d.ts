declare class ThreadLocal {
    public store: any;
    constructor(store: any);
    run(callback: (...args: any[]) => unknown): void;
    public static getStore(): unknown;
}
