const BasePackifyConfig = {
    entry: '', // or [] or {},
    output: {
        path: '',
        filename: '[name].[hash].[extension]'
    },
    plugins: [
        ['babel-plugin', {
            presets: ['env']
        }]
    ],
    excludes: {
        prefix: '_',
    },
    alias: {
        '~': 'node_modules'
    },
    resolvers: {
        configs: [],
        plugins: []
    }
}

module.exports = BasePackifyConfig;