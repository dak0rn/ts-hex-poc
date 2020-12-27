import SystemConfiguration from '@core/configuration/SystemConfiguration';
import CoreObject from '@core/shared/CoreObject';
import glob from 'glob';

/**
 * Scanner that loads project files in order to enable usage of decorates
 * throughout the project. Will scan those folders that are listed in the
 * `system.scan` configuration array. Scanning is recursive.
 *
 * It is important to not implement files with side-effects upon importing.
 */
export class ProjectScanner extends CoreObject {
    protected conf: SystemConfiguration;

    /**
     * The load/require function for files.
     * Defaults to `global.require`
     */
    protected loader: (path: string) => any;

    /**
     * Globbing function to get a list of files
     * Defeaults to `glob.sync`
     */
    protected glob: (pattern: string, options: object) => string[];

    /**
     * Creates a new {@link ProjectScanner}
     *
     * @param conf SystemConfiguration
     */
    constructor(conf: SystemConfiguration) {
        super();

        this.conf = conf;
        this.loader = require;
        this.glob = glob.sync;
    }

    /**
     * Scans the folders configured in `system.scan` for TypeScript files and
     * requires them
     */
    scanAndLoad(): void {
        const folders = this.conf.projectFolders();

        // Glob through each of the folders
        let filesToload: string[] = [];

        for (const folder of folders) {
            filesToload = filesToload.concat(this.glob(`**/*.ts`, { cwd: folder, absolute: true }));
        }

        // Require each file
        for (const file of filesToload) {
            this.loader(file);
        }
    }

    /**
     * Creates a new {@link ProjectScanner} with the given configuration.
     *
     * At the moment, this is a wrapper used to make the {@link ApplicationServer} better
     * testable, however, in the future this might be extended with different types of
     * loaders and more configuration.
     *
     * @param config System configuration
     */
    public static create(config: SystemConfiguration): ProjectScanner {
        return new ProjectScanner(config);
    }

    /**
     * Returns the {@link SystemConfiguration} used by this {@link ProjectScanner}
     *
     * @return {@link SystemConfiguration}
     */
    public get configuration(): SystemConfiguration {
        return this.conf;
    }
}
