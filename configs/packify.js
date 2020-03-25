const BasePackifyConfig = {
    entry: '', // or [] or {},
    output: {
        path: '',
        filename: '[name].[hash].[extension]'
    },
    loaders: [
        ['babel-loader', {}]
    ]
}

module.exports = BasePackifyConfig;