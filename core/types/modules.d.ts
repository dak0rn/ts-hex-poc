declare interface ApplicationModule {
    getClass(): { new (...args: any[]): any };
}

declare interface ApplicationModuleLauncher {
    launch(): Promise<unknown>;
}
