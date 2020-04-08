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
    getListingDependenciesProject
} = require('../libs/helpers')

const parser = require("babylon"); // parses and returns AST
const traverse = require("@babel/traverse").default; // walks through AST
const babel = require("@babel/core"); // main babel functionality

class JsExtractorPlugin extends PluginBase {
    constructor(name, opts) {
        super(name, opts)
        this.ID = 0;
    }
    extensions() {
        return ['js']
    }
    formatDestPath(srcUrl, destUrl) {

        let dirs = getListingDir(process.cwd());

        console.log('dirs');
    }
    run(compiler) {
        let eventManager = getEventManager();

        eventManager.on('packify:eachEntry', (entry) => {
            console.log('entry', entry)
            // this.createModuleInfo(content);
            let graph = this.createGraph(entry);
            let bundle = this.bundle(graph);

            console.log('bundle', bundle)

            let file = {
                src: entry,
                destPath: this.formatDestPath(entry, compiler.options.output.path),
                name: getFileName(entry),
                extension: getFileType(entry),
                content: bundle
            }

            compiler.queue(file);
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
        
        let depJson = getListingDependenciesProject();
        console.log('depJson', depJson)

        for (const asset of queue) {
            asset.mapping = {};
            const dirname = getDirectory(asset.filename);
            asset.dependencies.forEach(relativePath => {

                const absolutePath = formatPath(dirname, relativePath);

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