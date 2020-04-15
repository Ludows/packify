const { formatPath } = require('@ludoows/packify/libs/helpers');

const BasePackifyConfig = {
    entry: '', // or []
    output: {
        pathsFragmentSkipping: [ formatPath('resources', 'assets') ],
        folder: 'public',
        hash: true
    },
    plugins: [
        ['js-extractor-plugin', {
            presets: ['env']
        }],
        ['exporter-plugin', {}]
    ],
    alias: {
        '~': 'node_modules'
    },
    resolvers: {
        configs: [],
        plugins: []
    }
}

module.exports = BasePackifyConfig;