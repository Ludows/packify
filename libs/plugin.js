class BasePlugin {
    constructor(...args) {
        this.name = args[0];
        this.options = args[1];
        this.compiler = args[2]
    }
    extensions() {
        return [];
    }
    run(file) {

    }
}
module.exports = BasePlugin;