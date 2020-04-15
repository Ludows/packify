const path = require('path');
// console.log('path', path)

const BasePackifyConfig = {
    entry: '', // or []
    output: {
        pathsFragmentSkipping: [ path.sep+'resources'+ path.sep +'assets' ],
        folder: 'public',
        hash: true
    },
    plugins: [
        ['js-extractor-plugin', {
            presets: ['env']
        }],
        ['sass-plugin', {}],
        ['exporter-plugin', {}]
    ],
    alias: {
        '~': 'node_modules'
    },
    resolvers: {
        plugins: []
    }
}

module.exports = BasePackifyConfig;