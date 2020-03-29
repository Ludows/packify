const PluginBase = require('../libs/plugin');

class BabelPlugin extends PluginBase {
    constructor(name, opts) {
        super(name, opts)
    }
    extensions() {
        return ['js']
    }
    run(compiler) {
        console.log('compiler', compiler)
    }
}

module.exports = BabelPlugin;