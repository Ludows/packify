const PluginBase = require('../libs/plugin');
const {
    getEventManager,
    formatPath,
    getBasePath,
    readFileSync,
    getFileName,
    getDirectory,
    getFileType,
    getListingDir,
    typeOfModule,
    moduleResolver
} = require('../libs/helpers')

const parser = require("babylon"); // parses and returns AST
const traverse = require("@babel/traverse").default; // walks through AST
const babel = require("@babel/core"); // main babel functionality

class JsExtractorPlugin extends PluginBase {
    constructor(name, opts) {
        super(name, opts)
        this.ID = 0;
        // this.deps = getListingDependenciesProject()
    }
    extensions() {
        return ['js']
    }
    run(compiler) {
        let eventManager = getEventManager();

        eventManager.on('packify:entry:js', (entry, entryCounter) => {
            // console.log('entry', entry)
            // this.createModuleInfo(content);
            if(this.ID != 0) {
                this.ID = 0;
            }

            let graph = this.createGraph(entry);
            let bundle = this.bundle(graph);

            // console.log('bundle', bundle)

            let file = {
                src: entry,
                destPath: '',
                name: getFileName(entry),
                extension: getFileType(entry),
                content: bundle,
                graph: graph
            }

            compiler.queue(file);
            compiler.$updateProgress(entryCounter);
        })
    }
    createAsset(filename) {
        let content = readFileSync(filename);

        // console.log('content', content);

        const ast = parser.parse(content, {
            sourceType: "module"
        });

        

        

        const dependencies = [];
        traverse(ast, {
            ImportDeclaration: ({
                node
            }) => {
                dependencies.push(node.source.value);
            }
        });
        const id = this.ID++;
        const {
            code
        } = babel.transformFromAstSync(ast, null, this.options);

        // if(filename.includes('default')) {
        //     console.log('code gen', code)
        //     // return;
        // }

        return {
            id,
            filename,
            dependencies,
            code
        };
    }
    createGraph(entry) {
        const mainAsset = this.createAsset(entry);
        const queue = [mainAsset];
        
        
        // console.log('depJson', this.deps)

        for (const asset of queue) {
            asset.mapping = {};
            const dirname = getDirectory(asset.filename);
            // console.log('have dependencies ?', asset.dependencies);
            asset.dependencies.forEach(relativePath => {

                let typedModule = typeOfModule(relativePath)

                let pathResolver = moduleResolver(typedModule, {
                    dirname: dirname,
                    relativePath: relativePath
                })

                const absolutePath = pathResolver;

                const child = this.createAsset(absolutePath);

                asset.mapping[relativePath] = child.id;
                queue.push(child);
            });
        }
        return queue;
    }
    bundle(graph) {
        let modules = '';
        graph.forEach(mod => {
            modules += `${mod.id}: [
                function (require, module, exports) {
                  ${mod.code}
                },
                ${JSON.stringify(mod.mapping)},
            ],`;
        })

        const result = `
                (function(modules) {
                function require(id) {
                    const [fn, mapping] = modules[id];
                    function localRequire(name) {
                    return require(mapping[name]);
                    }
                    const module = { exports : {} };
                    fn(localRequire, module, module.exports);
                    return module.exports;
                }
                require(0);
                })({${modules}})
            `;

            // We simply return the result, hurray! :)
            return result;
    }
}

module.exports = JsExtractorPlugin;