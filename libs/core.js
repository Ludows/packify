
const { mergeConfig, getEventManager } = require('./helpers');

class Core {
 constructor(opts) {
    this.options = mergeConfig(opts);
    this.eventManager = getEventManager();
    this.start();
 }
 $init() {
   this.eventManager.emit('packify:init');
 }
 start() {
   this.$init();
 }
}

module.exports = Core;