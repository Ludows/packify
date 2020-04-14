const BasePackifyConfig = {
    entry: '', // or []
    output: {
        path: '',
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