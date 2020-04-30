const PluginBase = require('@ludoows/packify/libs/plugin');
const {
    makeError,
    getFileName,
    getFileType,
    mergeObjects
} = require('@ludoows/packify/libs/helpers')

const sass = require('node-sass');
const aliasImporter = require("node-sass-alias-importer");

class SassPlugin extends PluginBase {
    constructor(...args) {
        super(args[0], args[1], args[2])
    }
    getDefaults() {
        return {
            outputStyle: process.env.NODE_ENV === 'development' ? 'nested' : 'compact',
            sourceMapEmbed: false,
            sourceMap: process.env.NODE_ENV === 'development' ? true : false,
            importer: [
                aliasImporter(this.compiler.options.alias)
            ]
        }
    }
    extensions() {
        return ['scss', 'sass']
    }
    async run(file) {

        return new Promise((resolve,reject) => {
            // console.log('started sass', file)
            let the_file = { 'file' : file.src, 'outFile':  getFileName(file.src) }
            let options = mergeObjects(this.options, the_file);
            // console.log('options', options)
                sass.render(options, function(err, result) {
                    if(err)
                    return reject(err)

                    resolve({
                        src: file.src,
                        name: getFileName(file.src),
                        extension: getFileType(file.src),
                        content: result.css,
                        map: process.env.NODE_ENV === 'development' ? result.map : null
                    })
                })
        })
    }
}

module.exports = SassPlugin;