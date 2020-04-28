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
            autoprefixer: false,
            initial: false
        }
    }
    extensions() {
        return ['sass', 'scss', 'css']
    }
    async run(file) {
        var res = undefined;
        var depsPostCss = [];
        
        var processor = postcss()

        console.log('file content ?', file.content)

        if(this.options.nano != false) {
            depsPostCss.push(
                require('nano')(this.options.nano)
            );
        }

        if(this.options.autoprefixer != false) {
            depsPostCss.push(
                require('autoprefixer')(this.options.autoprefixer)
            );
        }

        if(this.options.initial != false) {
            depsPostCss.push(
                require('postcss-initial')(this.options.initial)
            );           
        }

        console.log(depsPostCss)

        try {
            depsPostCss.forEach((pluginPostCss) => { processor.use.bind(pluginPostCss) })
            res = await processor.process(file.content.toString());

            console.log('response postcss?', res.css)

            return {
                src: file.src,
                name: getFileName(file.src),
                extension: getFileType(file.src),
                content: res.css      
            }
        } catch (error) {
            makeError(error);
            console.log('error', error);
            process.exit();
        }
        

        

    }
}

module.exports = PostCssPlugin;