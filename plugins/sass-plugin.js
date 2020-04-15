const PluginBase = require('../libs/plugin');
const {
    getEventManager,
    formatPath,
    getBasePath,
    getDirectory,
    getFileName,
    getFileType
} = require('../libs/helpers')

const sast = require('sast')

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
                this.createGraph(entry)
                
            })
        })

    }
    createGraph(entry) {
        const mainAsset = this.createAsset(entry);
        const queue = [mainAsset];
        
        
        // console.log('depJson', this.deps)

        for (const asset of queue) {
            // asset.mapping = {};
            // const dirname = getDirectory(asset.filename);
            // // console.log('have dependencies ?', asset.dependencies);
            // asset.dependencies.forEach(relativePath => {

            //     let typedModule = typeOfModule(relativePath)

            //     let pathResolver = moduleResolver(typedModule, {
            //         dirname: dirname,
            //         relativePath: relativePath
            //     })

            //     const absolutePath = pathResolver;

            //     const child = this.createAsset(absolutePath);

            //     asset.mapping[relativePath] = child.id;
            //     queue.push(child);
            // });
        }
        return queue;
    }
    createAsset(filename) {
        let content = readFileSync(filename);
        let typeFile = getFileType(filename);

        const ast = sast.parse(content, {syntax: typeFile})
        console.log('ast', ast)
    }
    
}

module.exports = SassPlugin;