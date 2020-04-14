const cliProgress = require('cli-progress');

const { mergeObjects } = require('./helpers')

const baseConfProgress = {
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true,
    clearOnComplete: true
}

class ProgressUi {
    constructor(opts, mode) {
        this.options = mergeObjects(baseConfProgress, opts)
        this.mode = mode;
    }
    make() {
        let preset = null;
        let instance = null;
        switch (this.mode) {
            case 'legacy':
                preset = cliProgress.Presets.legacy
                break;
            case 'shades_classic':
                preset = cliProgress.Presets.shades_classic
                break;
            case 'shades_grey':
                preset = cliProgress.Presets.shades_grey
                break;

            case 'rect':
                preset = cliProgress.Presets.rect
                break;
        
        }

        if(preset != null) {
            instance = new cliProgress.SingleBar(this.options, preset)
        }
        else {
            instance = new cliProgress.SingleBar(this.options)
        }
        return instance;
    }
}

module.exports = ProgressUi;