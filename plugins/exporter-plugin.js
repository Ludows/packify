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
        this.streamer = new Stream();
        // this.deps = getListingDependenciesProject()
    }
    extensions() {
        return ['js', 'css', 'png', 'gif', 'jpg']
    }
    run(compiler) {
        let eventManager = getEventManager();

        eventManager.on('packify:processEnded', (Queue, entryCounter) => {
            // console.log('Queue packify:processEnded', Queue)  
            for (const file in Queue) {
                if (Queue.hasOwnProperty(file)) {
                    const element = Queue[file];
                    // console.log('element', element)
                    this.createStreamableProcess(element, compiler, entryCounter)
                }
            }
        })

    }
    createHash(name) {
        var hash = crypto.createHash('md5').update(name).digest('hex');
        return hash;
    }
    createStreamableProcess(file, compiler, count) {
        var stream = this.streamer;

        stream.on('data', function(data) {
            // process.stdout.write(data); // change process.stdout to ya-csv
            // compiler.$updateProgress(count);
            console.log('file', file)

        });

        stream.emit('data', file.content);
    }
}

module.exports = ExporterPlugin;