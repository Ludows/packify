const PluginBase = require('../libs/plugin');
const {
    getEventManager,
    formatPath,
    getBasePath,
    getFileName,
} = require('../libs/helpers')

const crypto = require('crypto');

class ExporterPlugin extends PluginBase {
    constructor(name, opts) {
        super(name, opts)
        // this.deps = getListingDependenciesProject()
    }
    extensions() {
        return ['js', 'css', 'png', 'gif', 'jpg']
    }
    run(compiler) {
        let eventManager = getEventManager();

        eventManager.on('packify:processEnded', (Queue) => {
            // console.log('Queue packify:processEnded', Queue)  
            for (const file of Queue) {
                console.log('file', file)
            }

        })
    }
    createHash(name) {
        var hash = crypto.createHash('md5').update(name).digest('hex');
        return hash;
    }
    createStreamableProcess() {

    }
}

module.exports = ExporterPlugin;