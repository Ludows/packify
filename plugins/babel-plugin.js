const PluginBase = require('../libs/plugin');
const {
    getEventManager
} = require('../libs/helpers')

const parser = require("@babel/parser"); // parses and returns AST
const traverse = require("@babel/traverse").default; // walks through AST
const babel = require("@babel/core"); // main babel functionality

class BabelPlugin extends PluginBase {
    constructor(name, opts) {
        super(name, opts)
        this.ID = 0;
    }
    extensions() {
        return ['js']
    }
    run(compiler) {
        let eventManager = getEventManager();

        eventManager.on('packify:readContent', (content) => {
            console.log('content', content)
            // this.createModuleInfo(content);
            let graph = this.createGraph(entry);
            let bundle = this.bundle(graph);
        })
    }
    createAsset(filename) {
        let content = fs.readFileSync(filename, 'utf-8');

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
            filePath,
            dependencies,
            code
        };
    }
    createGraph(entry) {
        const mainAsset = createAsset(entry);
        const queue = [mainAsset];

        for (const asset of queue) {
            asset.mapping = {};
            const dirname = path.dirname(asset.filename);
            asset.dependencies.forEach(relativePath => {

                const absolutePath = path.join(dirname, relativePath);

                const child = createAsset(absolutePath);

                asset.mapping[relativePath] = child.id;
                queue.push(child);
            });
        }
        return queue;
    }
    bundle() {
        let modules = '';
        graph.forEach(mod => {
            modules += `${mod.id}: [
                function (require, module, exports) {
                  ${mod.code}
                },
                ${JSON.stringify(mod.mapping)},
            ],`;

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
        })
    }
}

module.exports = BabelPlugin;