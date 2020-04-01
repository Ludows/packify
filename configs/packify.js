const { getPath, getEntries } = require('../libs/helpers')

const BasePackifyConfig = {
    entry: '', // or []
    output: {
        path: getPath('public'),
        hash: true
    },
    plugins: [
        ['js-extractor-plugin', {
            presets: ['env']
        }]
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