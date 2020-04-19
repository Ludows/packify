const { mergeObjects } = require('@ludoows/packify/libs/helpers')
class BasePlugin {
    constructor(...args) {
        this.name = args[0];
        this.compiler = args[2]
        this.options = mergeObjects(this.getDefaults(), args[1]);
    }
    getDefaults() {
        return {

        }
    }
    extensions() {
        return [];
    }
    async run(file) {

    }
}
module.exports = BasePlugin;