const PluginBase = require('../libs/plugin');

class BabelPlugin extends PluginBase {
    constructor(name, opts) {
        super(name, opts)
    }
    extensions() {
        return ['js']
    }
    run(compiler) {
        
    }
}

module.exports = BabelPlugin;