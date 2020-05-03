const PluginBase = require('@ludoows/packify/libs/plugin');
const {
    readFile,
    getFileName,
    getDirectory,
    getFileType,
    getListingDir,
    typeOfModule,
    moduleResolverAsync
} = require('@ludoows/packify/libs/helpers')

const parser = require("@babel/parser"); // parses and returns AST
const traverse = require("@babel/traverse").default; // walks through AST
const babel = require("@babel/core");
const types = require("@babel/types"); // types for traversing ast

const crypto = require("crypto");

const CacheCompiler = require('@ludoows/packify/libs/cacheCompiler');

const cache = new CacheCompiler();


// console.log('types', types)


class JsExtractorPlugin extends PluginBase {
    constructor(...args) {
        super(args[0], args[1], args[2])
        this.sourceToFile = null;
        this.Cache = cache;
        this.CallStackPlaceholders = {};
        // this.deps = getListingDependenciesProject()
    }
    getDefaults() {
        return {
            presets: ['env'],
            sourceMaps: process.env.NODE_ENV === 'development' ? true : false
        }
    }
    extensions() {
        return ['js']
    }
    async run(file) {
            
            // this.createModuleInfo(content);
            // if(this.ID != 0) {
                this.ID = 0;
            // }
            // console.log('id start', this.ID)
            // console.log('id start file', file.src)
            
            // console.log('started', file)
            // console.log('before graph')
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

            // compiler.$updateProgress(entryCounter);
    }
    async generateUniqId() {
        const id = crypto.randomBytes(3).toString("hex");
        // console.log('id', id)
        return id;
    }
    async createAsset(filename) {
        let content = await readFile(filename);

        // console.log('content', content);

        const ast = parser.parse(content.toString(), {
            sourceType: "module"
        });

        const id = await this.generateUniqId();
        // if(filename.includes('default')) {
        //     console.log(ast)
        // }

        const self = this;

        
        console.log('file passed', filename)

        if(this.Cache.isCached(filename)) {
            // console.log('loaded from cache', filename)
            let CacheFileObject = this.Cache.get(filename);
            return CacheFileObject;
        }
        else {
            let dependencies = [];
            let placeholder;
            // console.log('compilation', filename)
            self.CallStackPlaceholders[filename] = [];
            traverse(ast, {
                ExpressionStatement: (path) => {
    
                    // test pour ce cas de figure => let a = require('tata');
    
    
                    // if(filename.includes('default')) {
    
                        // test pour ce cas de figure => let a = require('tata');
                        if(types.isAssignmentExpression(path.node.expression, { operator: "=" })) {
                            
                            if( path.node.expression.hasOwnProperty('right') && 
                            types.isCallExpression(path.node.expression.right) &&
                            !types.isFunctionExpression(path.node.expression) ) {
                                // console.log('from isCallExpression', path.node.expression.right)
    
                                if(path.node.expression.right.callee.hasOwnProperty('name') &&
                                  path.node.expression.right.callee.name === "require"
                                ) {
                                    dependencies.push(path.node.expression.right.arguments[0].value);
                                    // path.node.expression.right.arguments[0].value = "grosse-tata";
                                    // console.log('testurlSlug', testurlSlug)
                                    self.CallStackPlaceholders[filename].push({
                                        expression: path.node.expression.right.arguments[0].value,
                                        file: filename,
                                        start: path.node.expression.right.arguments[0].start,
                                        end: path.node.expression.right.arguments[0].end,
                                        require: true,
                                        import: false
                                    })

                                }
    
                            }
    
                            // test pour ce cas de figure => window.a =  window.b = require('tata');
                            if(types.isAssignmentExpression(path.node.expression.right, { operator: "=" })) {
                                // console.log('log', path.node.expression.right.right)
                                if( path.node.expression.right.right.hasOwnProperty('callee') &&
                                    path.node.expression.right.right.callee.name === "require") {
    
                                    // console.log('arguments ?', path.node.expression.right.right.arguments[0])
                                    dependencies.push(path.node.expression.right.right.arguments[0].value);
                                    // console.log('testurlSlug', testurlSlug)
                                    self.CallStackPlaceholders[filename].push({
                                        expression: path.node.expression.right.right.arguments[0].value,
                                        file: filename,
                                        start: path.node.expression.right.right.arguments[0].start,
                                        end: path.node.expression.right.right.arguments[0].end,
                                        require: true,
                                        import: false
                                    })
                                }
                                
                            }
                        }
    
                        // Le cas le plus classique => require('tata')
                        if(types.isCallExpression(path.node.expression) && 
                        path.node.expression.callee.hasOwnProperty('name') &&
                        path.node.expression.callee.name === "require") {
                            // console.log('isCallExpression basic', path.node.expression.arguments[0].value)
                            dependencies.push(path.node.expression.arguments[0].value);
                            // path.node.expression.arguments[0].value = "grosse-tata-3"
                            // console.log('testurlSlug', testurlSlug)
                            self.CallStackPlaceholders[filename].push({
                                expression: path.node.expression.arguments[0].value,
                                file: filename,
                                start: path.node.expression.arguments[0].start,
                                end: path.node.expression.arguments[0].end,
                                require: true,
                                import: false
                            })
                        }
    
                    //     throw 'throw pour debug babel'
                    //  }
                    
                },
                VariableDeclaration: (path) => {
                    if(types.isCallExpression(path.node.declarations[0].init)) {
                        // Correspond au cas du => let a = require('dt')
                        if(path.node.declarations[0].init.callee.name === "require") {
                            // console.log('log ???', path.node.declarations[0].init.arguments[0])
                            dependencies.push(path.node.declarations[0].init.arguments[0].value);
                            // path.node.declarations[0].init.arguments[0].value = "grosse-tata-4"
                            // let testurlSlug = self.generateSlugPlaceholder(path.node.declarations[0].init.arguments[0].value);
                            self.CallStackPlaceholders[filename].push({
                                expression: path.node.declarations[0].init.arguments[0].value,
                                file: filename,
                                start: path.node.declarations[0].init.arguments[0].start,
                                end: path.node.declarations[0].init.arguments[0].end,
                                require: true,
                                import: false
                            })
                            // console.log('testurlSlug', testurlSlug)
                        }
                        
                    }
                },
                ImportDeclaration: ({
                    node
                }) => {
                    dependencies.push(node.source.value);
                }
            });
            
            dependencies = dependencies.filter((dep) => {
                return dep != null && dep != "";
            })
            
            
            
            

            // console.log('after up', this.ID)
            // console.log('after file', filename)
            
            // if(this.options.sourceMaps == true) {
            //     this.options.sourceFileName = filename;
            // }
    
            // const {
            //     code,
            //     map
            // } = await babel.transformFromAstAsync(ast, null, this.options);
    
            // // console.log('map', map)
    
            // this.sourceToFile = JSON.stringify(map); 

            this.Cache.set(filename, {
                id,
                filename,
                dependencies,
                source: content,
                // code
            })

            return {
                id,
                filename,
                dependencies,
                source: content,
                // code
            };
        }    
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

            let Results = await Promise.all( dependencies_promesses )

        }

        await this.sourceStringReplacer(queue)
       
        return queue;
    }
    async CompileCodeSnippets(assetObject) {

        // console.log('this call stack', this.CallStackPlaceholders[assetObject.filename])
        let havePlaceholders = this.CallStackPlaceholders[assetObject.filename];

        let source =  assetObject.source.toString();

        if(havePlaceholders.length > 0) {
            
            havePlaceholders.forEach((placeholder) => {
                // let cacheIdModule = this.Cache.get(placeholder.file);
                source = source.replace('require(\''+placeholder.expression+'\')', 'require(\''+assetObject.mapping[placeholder.expression]+'\')')
                if(assetObject.filename.includes('default')) {
                    console.log(placeholder.expression, assetObject.mapping[placeholder.expression])

                }
            })
            // if(assetObject.filename.includes('default')) {
            //     console.log('source', source)

            //     // console.log('mapping ?', assetObject)

            //     throw 'stop'
            // }
            // source = source.replace(source)
            
            // throw 'stop'
        }
        
        if(this.options.sourceMaps == true) {
            this.options.sourceFileName = getFileName(assetObject.filename);
        }

        const {
            code,
            map
        } = await babel.transformAsync(source, this.options);


        this.sourceToFile = JSON.stringify(map);

        assetObject.code = code;
        
        return 'ok';
    }
    async sourceStringReplacer(queueArray) {

        // for (const asset of queueArray) {
        //     // console.log('string replacer ?', asset)
        //     // console.log('source before transforms ?', asset.source.toString())
            
        //     // console.log('source after transforms ?', asset.source)
        // }

        let queue_promises = queueArray.map( async (assetObject) => { return await this.CompileCodeSnippets(assetObject) })

        let resultsCompilationCode = await Promise.all( queue_promises );
        
    }
    async mergingDeps(relativePath, queue, asset, dirname) {
        let typedModule = typeOfModule(relativePath)
        // console.log('typedModule', typedModule)

        let pathResolver =  await moduleResolverAsync(typedModule, {
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
        let moduleIds = [];
        graph.forEach(mod => {
            moduleIds.push(mod.id);
            modules += `${JSON.stringify(mod.id)}: [
                function (require, module, exports) {
                  ${mod.code}
                },
                ${JSON.stringify(mod.mapping)},
            ],`;
        })

        moduleIds = moduleIds.join(',');

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
                
                var moduleIds = ${JSON.stringify(moduleIds)}
                
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