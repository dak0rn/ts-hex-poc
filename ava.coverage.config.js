export default {
    files: ['**/test/**/*.ts', '!**/dist/**', '!**/node_modules/**'],
    failFast: true,
    verbose: false,
    require: ['ts-node/register', 'tsconfig-paths/register', 'source-map-support/register', 'reflect-metadata'],
    extensions: ['ts']
};
