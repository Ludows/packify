const BasePackifyConfig = {
    entry: '', // or [] or {},
    output: {
        path: '',
        filename: '[name].[hash].[extension]'
    },
    loaders: [
        ['babel-loader', {}]
    ],
    resolvers: {
        configs: [],
        loaders: []
    }
}

module.exports = BasePackifyConfig;