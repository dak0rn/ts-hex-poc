export interface ApplicationModule {
    getClass(): { new (...args: any[]): any };
}

export interface ApplicationModuleLauncher {
    launch(): Promise<unknown>;
}
