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
            sourceMapEmbed: process.env.NODE_ENV === 'development' ? true : false,
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

        console.log('started sass', file)

        let options = mergeObjects(this.options, file);

        console.log('options', options)

        let result = null;
        try {
            result = await sass.render(options)
            console.log('result', result)
        } catch (error) {
            console.log('error sass', error)
        }
        

        

        return {
            src: file.src,
            name: getFileName(file.src),
            extension: getFileType(file.src),
            content: result.css,
            map: process.env.NODE_ENV === 'development' ? result.map : null
        }
    }
}

module.exports = SassPlugin;