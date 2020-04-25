const PluginBase = require('@ludoows/packify/libs/plugin');
const {
    makeError,
    getFileName,
    getFileType,
} = require('@ludoows/packify/libs/helpers')

var postcss  = require('postcss')

class PostCssPlugin extends PluginBase {
    constructor(...args) {
        super(args[0], args[1], args[2])
    }
    getDefaults() {
        return {
            nano: false,
            autoprefixer: false
        }
    }
    extensions() {
        return ['css']
    }
    async run(file) {
        var res = undefined;
        if(this.options.nano != false) {
            res = await postcss([ require('nano')(this.options.nano) ]).process(file.content.toString());
            file.content = res.css;
        }

        if(this.options.autoprefixer != false) {
            res = await postcss([ require('autoprefixer')(this.options.autoprefixer) ]).process(file.content.toString());
            file.content = res.css;
        }

        return {
            src: file.src,
            name: getFileName(file.src),
            extension: getFileType(file.src),
            content: file.content        
        }

    }
}

module.exports = PostCssPlugin;