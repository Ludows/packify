const PluginBase = require('@ludoows/packify/libs/plugin');
const {
    readFileSync,
    getFileName,
    getDirectory,
    getFileType,
    getListingDir,
    typeOfModule,
    moduleResolver,
    mergeObjects
} = require('@ludoows/packify/libs/helpers')

const parser = require("@babel/parser"); // parses and returns AST
const traverse = require("@babel/traverse").default; // walks through AST
const babel = require("@babel/core");
const types = require("@babel/types"); // types for traversing ast

var requireDetective = require('detective');
var importDetective = require('detective-module');



const crypto = require("crypto");

const CacheCompiler = require('@ludoows/packify/libs/cacheCompiler');

const cache = new CacheCompiler();


// console.log('types', types)


class JsExtractorPlugin extends PluginBase {
    constructor(...args) {
        super(args[0], args[1], args[2])
        this.sourceToFile = null;
        this.Cache = cache;
        // this.CallStackPlaceholders = {};
        // this.deps = getListingDependenciesProject()
    }
    getDefaults() {
        return {
            presets: ['env'],
            compact: false,
            retainLines: true,
            filename: '',
            ignore: [
                /node_modules/,
                /bower_components/
            ],
            sourceMaps: process.env.NODE_ENV === 'development' ? true : false
        }
    }
    extensions() {
        return ['js']
    }
    async run(file) {
            
            let graph = await this.createGraph(file.src);
            // console.log('after graph')
            let bundle = await this.bundle(graph);
            // console.log('after bundle')

            // console.log('this.Cache', this.Cache)

            return {
                src: file.src,
                name: getFileName(file.src),
                extension: getFileType(file.src),
                content: bundle,
                graph: graph,
                map: this.sourceToFile
            }
    }
    generateUniqId() {
        const id = crypto.randomBytes(3).toString("hex");
        return id;
    }
    createAsset(filename) {
        let content = readFileSync(filename);

        const id = this.generateUniqId();

        if(this.Cache.isCached(filename)) {
            // console.log('loaded from cache', filename)
            let CacheFileObject = this.Cache.get(filename);
            return CacheFileObject;
        }
        else {
            let dependencies = [];
            
            if(content.toString().length > 0) {
                var requires = requireDetective(content, {
                    parse: {sourceType: 'module'}
                });
                var imports = importDetective(content.toString())

                if(requires.length > 0) {
                    // console.log('requires')
                    requires.forEach(req => {
                        // console.log('imp mebers', imp.members)
                        dependencies.push(req);
                    })
                }
                if(imports.length > 0) {
                    imports.forEach(imp => {
                        // console.log('imp mebers', imp.members)
                        if(imp.name) {
                            dependencies.push(imp.name);
                        }
                    })
                }
    
                // console.log('requires', requires)
                // console.log('imports', imports)
            }

            let source =  content.toString();

        
            if(this.options.sourceMaps == true) {
                this.options.sourceFileName = getFileName(filename);
            }

            const {
                code,
                map
            } = babel.transformSync(source, this.options);


            this.sourceToFile = JSON.stringify(map);

            // console.log('code ?', code)
            // console.log('map ?', map)
            
            this.Cache.set(filename, {
                id,
                filename,
                dependencies,
                source: content,
                code
            })

            return {
                id,
                filename,
                dependencies,
                source: content,
                code
            };
        }    
    }
    async createGraph(entry) {
        const mainAsset = this.createAsset(entry);
        const queue = [mainAsset];
        
        
        // console.log('depJson', this.deps)

        for (const asset of queue) {
            asset.mapping = {};
            const dirname = getDirectory(asset.filename);
            // console.log('have dependencies ?', asset.dependencies);
            asset.dependencies.forEach(( relativePath ) => {
                let typedModule = typeOfModule(relativePath)
                // console.log('typedModule', typedModule)
    
                let pathResolver =  moduleResolver(typedModule, {
                    dirname: dirname,
                    relativePath: relativePath
                })
    
                // console.log('pathResolver ?', pathResolver)
    
    
                const child = this.createAsset(pathResolver);
    
                asset.mapping[relativePath] = child.id;
                queue.push(child);
            })
        }

        return queue;
    }
    async bundle(graph) {
        let modules = '';
        let moduleIds = [];
        let moduleDeps = {};
        let bootedModules = {};
        graph.forEach(mod => {
            moduleIds.push(mod.id);
            // console.log(mod.mapping)

            bootedModules[mod.id] = false;

            moduleDeps = mergeObjects(moduleDeps, mod.mapping),
            modules += `${JSON.stringify(mod.id)}: [
                function (require, module, exports) {
                     ${mod.code}; 
                },
                ${JSON.stringify(mod.mapping)},
            ],`;
        })

        moduleIds = moduleIds.join(',');

        const result = `
                (function(modules) {
                    console.log('modules', modules);
                    var moduleIds = ${JSON.stringify(moduleIds)};
                    
                    var bootedModules = ${JSON.stringify(bootedModules)};
                    var CacheModules = {};
                    function require(id) {
                        const [fn, mapping] = modules[id];
                        /* we use dependencies, if local mapping fails */
                        var dependencies = ${JSON.stringify(moduleDeps)};
                        function localRequire(name) {
                            return require(dependencies[name]);
                        }
                        const module = { exports : {} };
                        if (bootedModules[id] == false) {
                            bootedModules[id] = true;
                            fn(localRequire, module , module.exports);
                            
                            // Setting to the cache module
                            CacheModules[id] = module.exports;
                            
                        }
                        return CacheModules[id];
                    }
                
                
                var formaterId = [];

                if(moduleIds.indexOf(',') > -1) {
                    formaterId = moduleIds.split(',');
                }
                else {
                    formaterId.push(moduleIds);
                }
                
                require(formaterId[0]);
                })({${modules}})
            `;



            // We simply return the result, hurray! :)
            // console.log('result', result)
            return result;
            
    }
}

module.exports = JsExtractorPlugin;