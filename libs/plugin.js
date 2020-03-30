class BasePlugin {
    constructor(name, opts) {
        this.name = name;
        this.options = opts;
        this.done = false;
    }
    extensions() {
        return [];
    }
    run(compilerInstance) {

    }
    done() {
        this.done = true;
    }
}
module.exports = BasePlugin;