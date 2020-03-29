const BasePackifyConfig = {
    entry: '', // or [] or {},
    output: {
        path: '',
        filename: '[name].[hash].[extension]'
    },
    plugins: [
        ['babel-loader', {}]
    ],
    excludes: {
        prefix: '_'
    },
    alias: {
        '~': 'node_modules'
    },
    resolvers: {
        configs: [],
        loaders: []
    }
}

module.exports = BasePackifyConfig;