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
        ['postcss-plugin', {
            flexbox: "no-2009"
        }],
        ['js-terser-plugin', {}]
    ],
    hooks: {},
    alias: {
        '~': 'node_modules'
    },
    resolvers: {
        plugins: []
    }
}

module.exports = BasePackifyConfig;