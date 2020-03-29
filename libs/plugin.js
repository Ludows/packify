class BasePlugin {
    constructor(name, opts) {
        this.name = name;
        this.options = opts;
    }
    getExtensions() {
        return [];
    }
    transform(compilerInstance) {

    }
    run() {
        
    }
}
module.exports = BaseLoader;