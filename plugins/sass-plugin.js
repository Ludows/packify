const PluginBase = require('../libs/plugin');
const {
    getEventManager,
    makeError,
    getFileName,
    getFileType
} = require('../libs/helpers')

const sass = require('node-sass');
const aliasImporter = require("node-sass-alias-importer");

class SassPlugin extends PluginBase {
    constructor(...args) {
        super(args[0], args[1], args[2])
    }
    extensions() {
        return ['scss', 'sass']
    }
    async run(file) {

        console.log('started sass', file)

        // let result = await sass.render({
        //     file: file.src,
        //     outputStyle: process.env.NODE_ENV === 'development' ? 'nested' : 'compact',
        //     sourceMapEmbed: process.env.NODE_ENV === 'development' ? true : false,
        //     sourceMap: process.env.NODE_ENV === 'development' ? true : false,
        //     importer: [
        //         aliasImporter(this.compiler.options.alias)
        //     ]
        // })

        // return {
        //     src: file.src,
        //     name: getFileName(file.src),
        //     extension: getFileType(file.src),
        //     content: result.css,
        // }
    }
}

module.exports = SassPlugin;