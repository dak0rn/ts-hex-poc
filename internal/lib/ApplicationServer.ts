import SystemConfiguration from '@internal/configuration/SystemConfiguration';
import ApplicationContext from '@internal/ioc/ApplicationContext';
import RootApplicationContext from '@internal/ioc/RootApplicationContext';
import SystemLogger from '@internal/log/SystemLogger';
import SystemLoggerFactory from '@internal/log/SystemLoggerFactory';
import ModuleLoader from '@internal/module/ModuleLoader';
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
    protected static instance: ApplicationServer | null = null;

    protected ctx: ApplicationContext | null;

    /* istanbul ignore next */
    protected constructor() {
        this.ctx = null;
    }

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
    protected assembleContext(configFile: string): void {
        const configAdapter = ConfigurationFactory.getInstance(configFile);
        const sc = configAdapter.system();
        const ac = configAdapter.application();
        sc.applicationPath = APPLICATION_DIR;

        const log = SystemLoggerFactory.createInstance(sc);

        log.info('Configuration successfully parsed.');
        log.info('Setting up the IoC environment...');

        // Create the application context that is housing the
        // IoC container
        this.ctx = RootApplicationContext.getInstance();

        this.ctx.registerValue('SystemConfiguration', sc);
        this.ctx.registerValue('ApplicationConfiguration', ac);
        this.ctx.registerValue('ApplicationContext', this.ctx);
        this.ctx.registerValue('SystemLogger', log);
    }

    /**
     * Loads and launches the configured modules
     */
    protected launchModules(loader: ModuleLoader | null = null): void {
        if (null === loader) {
            const config = this.ctx!.resolve('SystemConfiguration') as SystemConfiguration;
            loader = new ModuleLoader(config);
        }

        const modules = loader.load();

        for (const mod of modules) {
            mod.launch(this.ctx!);
        }
    }

    /**
     * Starts the application server and eventually also the application using it
     */
    public startup(): void {
        console.log('Application server starting up');
        console.log('Using configuration file: ', CONFIG_FILE);

        this.assembleContext(CONFIG_FILE);
        const log = this.ctx!.resolve('SystemLogger') as SystemLogger;

        log.debug('Resolving modules...');
        this.launchModules();
    }
}
