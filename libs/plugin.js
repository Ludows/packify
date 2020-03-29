class BasePlugin {
    constructor(name, opts) {
        this.name = name;
        this.options = opts;
    }
    extensions() {
        return [];
    }
    run(compilerInstance) {

    }
}
module.exports = BasePlugin;