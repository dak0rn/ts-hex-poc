/* istanbul ignore file */
module.exports = {
    extends: '@istanbuljs/nyc-config-typescript',
    all: true,
    'check-coverage': true,
    reporter: 'html',
    exclude: ['**/test/**', './*.*', 'coverage/**']
};
