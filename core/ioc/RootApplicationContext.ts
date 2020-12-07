import ApplicationContext from './ApplicationContext';

/**
 * Singleton factory for the root {@link ApplicationContext}.
 */
export default class RootApplicationContext {
    /* istanbul ignore next */
    private constructor() {}

    private static ac: ApplicationContext | null = null;

    /**
     * Provides access to the root {@link ApplicationContext} instance.
     * Will be lazily created if not already existing.
     *
     * @return {ApplicationContext} Root {@link ApplicationContext}
     */
    public static getInstance(): ApplicationContext {
        if (null === RootApplicationContext.ac) {
            RootApplicationContext.ac = new ApplicationContext(null);
        }

        return RootApplicationContext.ac;
    }
}
