import ApplicationContext from '@internal/ioc/ApplicationContext';
import RootApplicationContext from '@internal/ioc/RootApplicationContext';
import SystemLogger from '@internal/log/SystemLogger';
import SystemLoggerFactory from '@internal/log/SystemLoggerFactory';
import path from 'path';
import ConfigurationFactory from '../configuration/ConfigurationFactory';

// TODO: Replace with CLI options
/* istanbul ignore next */
export const APPLICATION_DIR: string = path.resolve(__dirname, '..', '..');
/* istanbul ignore next */
export const CONFIG_FILE: string = path.resolve(APPLICATION_DIR, 'conf', 'app.ini');

/**
 * The application server
 *
 * This class is a singleton.
 */
export default class ApplicationServer {
    /* istanbul ignore next */
    protected constructor() {}

    protected static instance: ApplicationServer | null = null;

    /**
     * Returns an instance of {@link ApplicationServer}. Creates a new
     * instance if it does not exist already and returns that instance
     * on subsequent calls.
     *
     * @return {ApplicationServer} {@link ApplicationServer} instance
     */
    public static getInstance(): ApplicationServer {
        if (null === ApplicationServer.instance) {
            ApplicationServer.instance = new ApplicationServer();
        }

        return ApplicationServer.instance;
    }

    /**
     * Assembles the {@link ApplicationContext} for the server
     * based on the configuration file given.
     *
     * @param configFile Path to the configuration file
     */
    protected assembleContext(configFile: string): ApplicationContext {
        const configAdapter = ConfigurationFactory.getInstance(configFile);
        const sc = configAdapter.system();
        const ac = configAdapter.application();
        sc.applicationPath = APPLICATION_DIR;

        const log = SystemLoggerFactory.createInstance(sc);

        log.info('Configuration successfully parsed.');
        log.info('Setting up the IoC environment...');

        // Create the application context that is housing the
        // IoC container
        const ctx = RootApplicationContext.getInstance();

        ctx.registerValue('SystemConfiguration', sc);
        ctx.registerValue('ApplicationConfiguration', ac);
        ctx.registerValue('ApplicationContext', ctx);
        ctx.registerValue('SystemLogger', log);

        return ctx;
    }

    /**
     * Starts the application server and eventually also the application using it
     */
    public startup(): void {
        console.log('Application server starting up');
        console.log('Using configuration file: ', CONFIG_FILE);

        const ctx = this.assembleContext(CONFIG_FILE);
        const log = ctx.resolve('SystemLogger') as SystemLogger;

        log.info('Resolving modules...');
    }
}
