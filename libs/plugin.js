class BasePlugin {
    constructor(name, opts) {
        this.name = name;
        this.options = opts;
    }
    extensions() {
        return [];
    }
    getAst() {
        let parser = this.getParser();
        let ast = parser.parse()
    }
    transform() {

    }
    run(compilerInstance) {

    }
}
module.exports = BasePlugin;