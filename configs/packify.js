const path = require('path');
// console.log('path', path)

const MDAsset = require('@ludoows/packify/hooks/mdAssets');
const Manifest = require('@ludoows/packify/hooks/generateManifest');

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
            autoprefixer: {
                flexbox: "no-2009"
            }
        }],
        ['js-terser-plugin', {}]
    ],
    hooks: {
        end: Manifest,
        mdasset: MDAsset  
    },
    alias: {
        '~': 'node_modules'
    },
    cache: false,
    resolvers: {
        plugins: []
    }
}

module.exports = BasePackifyConfig;