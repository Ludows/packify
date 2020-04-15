const PluginBase = require('../libs/plugin');
const {
    getEventManager,
    formatPath,
    getBasePath,
    getDirectory,
    getFileName,
    getFileType
} = require('../libs/helpers')

const crypto = require('crypto');
var Stream = require('stream');

const translator = require('../libs/translator');

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
                    let urlDest = this.getUrlDest(element, compiler.options.output);
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

        });

        stream.emit('data', file.content);
    }
    getUrlDest(file, optionsOutput) {
        let skippingPartsUrl = optionsOutput.pathsFragmentSkipping
        let returnStatement = null;

        let fileType = getFileType(file.src);
        let File = getFileName(file.src);
        let baseDir = getDirectory(file.src);
        
        for (let index = 0; index < skippingPartsUrl.length; index++) {
            const element = skippingPartsUrl[index];

            if(baseDir.includes(element)) {
                baseDir = baseDir.replace(element, optionsOutput.folder);
                break;
            } 
        }

        if(translator.needChange[fileType]) {
            // si l'extension doit être changée..

            let extension_for_folder = translator.extensions[fileType];

            let predictedFolders = translator.predictedFolders[extension_for_folder];

            for (let k = 0; k < predictedFolders.length; k++) {
                const predictedFolder = predictedFolders[k];
                if(baseDir.indexOf(predictedFolder) > -1) {
                    baseDir = baseDir.replace(predictedFolder, extension_for_folder);
                    break;
                }
                
            }

            const reg = new RegExp(fileType, 'g');
            // console.log('reg', reg)

            File = File.replace(reg, extension_for_folder);
            
        }

        returnStatement = formatPath(baseDir, File);

        return returnStatement;
    }
}

module.exports = ExporterPlugin;