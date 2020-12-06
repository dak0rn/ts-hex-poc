export interface ApplicationModule {
    getClass(): { new (...args: any[]): any };
}
