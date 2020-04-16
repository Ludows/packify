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
    constructor(name, opts) {
        super(name, opts)
        
        // this.deps = getListingDependenciesProject()
    }
    extensions() {
        return ['scss', 'sass']
    }
    run(compiler) {
        let eventManager = getEventManager();

        let exts = this.extensions();

        exts.forEach((ext) => {
            eventManager.on('packify:entry:'+ext, (entry, entryCounter) => {
                this.$initSassRuntime(entry, compiler.options, (res) => {
                    
                    let file = {
                        src: entry,
                        destPath: '',
                        name: getFileName(entry),
                        extension: getFileType(entry),
                        content: res.css,
                    }
        
                    compiler.queue(file);
                    compiler.$updateProgress(entryCounter);
                });
            })
        })

    }
    $initSassRuntime(...args) {
        // console.log('args options alias', args[1].alias)
        let ret = sass.renderSync({
            file: args[0],
            outputStyle: process.env.NODE_ENV === 'development' ? 'nested' : 'compact',
            sourceMapEmbed: process.env.NODE_ENV === 'development' ? true : false,
            sourceMap: process.env.NODE_ENV === 'development' ? true : false,
            importer: [
                aliasImporter(args[1].alias)
            ]
        })

        args[2](ret)
    }
}

module.exports = SassPlugin;