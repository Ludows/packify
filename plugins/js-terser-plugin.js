const PluginBase = require('@ludoows/packify/libs/plugin');
const {
    makeError,
    getFileName,
    getFileType,
    mergeObjects
} = require('@ludoows/packify/libs/helpers')

var Terser = require("terser");

class TerserPlugin extends PluginBase {
    constructor(...args) {
        super(args[0], args[1], args[2])
    }
    getDefaults() {
        return {
            parse: process.env.NODE_ENV === 'development' ? false : {},
            compress: process.env.NODE_ENV === 'development' ? false : {},
            mangle: process.env.NODE_ENV === 'development' ? false : {},
            output: {
                beautify: process.env.NODE_ENV === 'development' ? true : false,
                preamble: process.env.NODE_ENV === 'development' ? "/* minified */" : "",
                ast: false,
                code: true  // optional - faster if false
            }
        }
    }
    extensions() {
        return ['js']
    }
    async run(file) {
        
        let source_maps_opts = { 
            sourceMap: {
                content: JSON.parse(file.map.toString()),
                filename: getFileName(file.src),
                url: getFileName(file.src)+".map"
            }
        }
        let options = mergeObjects(this.options, source_maps_opts);

        // console.log('options terser', options)
        
        var result = Terser.minify(file.content.toString(), options);
        if (result.error) makeError('Terser error says', result.error);

        return {
            src: file.src,
            name: getFileName(file.src),
            extension: getFileType(file.src),
            content: result.code,
            map: result.map
        }
    }
}

module.exports = TerserPlugin;