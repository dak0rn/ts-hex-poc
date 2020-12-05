export default {
    files: ['**/test/**/*.ts', '!**/dist/**', '!**/node_modules/**'],
    failFast: true,
    verbose: false,
    require: ['ts-node/register', 'tsconfig-paths/register'],
    extensions: ['ts']
};
