const PluginBase = require('../libs/plugin');
const {
    getEventManager,
    formatPath,
    getBasePath,
    getFileName,
} = require('../libs/helpers')

const crypto = require('crypto');
var Stream = require('stream');

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
            for (const file in Queue) {
                if (Queue.hasOwnProperty(file)) {
                    const element = Queue[file];
                    // console.log('element', element)
                    this.createStreamableProcess(element)
                }
            }
        })

    }
    createHash(name) {
        var hash = crypto.createHash('md5').update(name).digest('hex');
        return hash;
    }
    createStreamableProcess(file) {
        var stream = new Stream();

        stream.on('data', function(data) {
            // process.stdout.write(data); // change process.stdout to ya-csv
            // console.log('data chunk ?', data)

        });

        stream.emit('data', file.content);
    }
}

module.exports = ExporterPlugin;