const PluginBase = require('@ludoows/packify/libs/plugin');
const {
    makeError,
    getFileName,
    getFileType,
    mergeObjects
} = require('@ludoows/packify/libs/helpers')

class TerserPlugin extends PluginBase {
    constructor(...args) {
        super(args[0], args[1], args[2])
    }
    getDefaults() {
        return {}
    }
    extensions() {
        return ['js']
    }
    async run(file) {

    }
}

module.exports = TerserPlugin;