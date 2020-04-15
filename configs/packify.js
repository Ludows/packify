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