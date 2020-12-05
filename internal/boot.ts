/**
 * @file Entry point for the application server framework
 */

import ApplicationServer from './lib/ApplicationServer';

/**
 * Boots up the application server. Will create all necessary
 * internal components, parse the configuration and start declared
 * modules.
 */
export function boot() {
    ApplicationServer.getInstance().startup();
}

// If the file is being executed from the CLI, start the boot up
if (require.main === module) {
    // TODO CLI and CLI options
    boot();
}
