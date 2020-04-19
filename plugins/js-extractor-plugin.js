const PluginBase = require('@ludoows/packify/libs/plugin');
const {
    readFile,
    getFileName,
    getDirectory,
    getFileType,
    getListingDir,
    typeOfModule,
    moduleResolver
} = require('@ludoows/packify/libs/helpers')

const parser = require("babylon"); // parses and returns AST
const traverse = require("@babel/traverse").default; // walks through AST
const babel = require("@babel/core"); // main babel functionality

class JsExtractorPlugin extends PluginBase {
    constructor(...args) {
        super(args[0], args[1], args[2])
        this.ID = 0;
        // this.deps = getListingDependenciesProject()
    }
    getDefaults() {
        return {
            presets: ['env'],
            sourceMaps: process.env.NODE_ENV === 'development' ? "both" : false
        }
    }
    extensions() {
        return ['js']
    }
    async run(file) {
            
            // this.createModuleInfo(content);
            if(this.ID != 0) {
                this.ID = 0;
            }
            // console.log('started', file)
            // console.log('before graph')
            let graph = await this.createGraph(file.src);
            // console.log('after graph')
            let bundle = await this.bundle(graph);
            // console.log('after bundle')

            // console.log('bundle', bundle)

            return {
                src: file.src,
                name: getFileName(file.src),
                extension: getFileType(file.src),
                content: bundle,
                graph: graph
            }

            // compiler.$updateProgress(entryCounter);
    }
    // async parse() {

    // }
    async createAsset(filename) {
        let content = await readFile(filename);

        // console.log('content', content);

        const ast = parser.parse(content.toString(), {
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
        } = await babel.transformFromAstAsync(ast, null, this.options);

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
    async createGraph(entry) {
        const mainAsset = await this.createAsset(entry);
        const queue = [mainAsset];
        
        
        // console.log('depJson', this.deps)

        for (const asset of queue) {
            asset.mapping = {};
            const dirname = getDirectory(asset.filename);
            // console.log('have dependencies ?', asset.dependencies);
            let dependencies_promesses = asset.dependencies.map(async (relativePath) => { return this.mergingDeps(relativePath, queue, asset, dirname) });

            // console.log('dependencies_promesses', dependencies_promesses)

            let Results = await Promise.all( dependencies_promesses )

            // console.log('Results', Results)
        }
        return queue;
    }
    async mergingDeps(relativePath, queue, asset, dirname) {
        let typedModule = typeOfModule(relativePath)
        // console.log('typedModule', typedModule)

        let pathResolver =  moduleResolver(typedModule, {
            dirname: dirname,
            relativePath: relativePath
        })

        // console.log('pathResolver ?', pathResolver)

        const absolutePath = pathResolver;

        const child = await this.createAsset(absolutePath);

        asset.mapping[relativePath] = child.id;
        queue.push(child);
    }
    async bundle(graph) {
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