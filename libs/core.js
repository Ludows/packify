
const { mergeConfig, getEventManager } = require('./helpers');

class Core {
 constructor(opts) {
    this.options = mergeConfig(opts);
    this.eventManager = getEventManager();
 }
}

module.exports = Core;