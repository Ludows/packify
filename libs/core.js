
const { mergeConfig, getEventManager, typeOf } = require('./helpers');

class Core {
 constructor(opts) {
    this.options = mergeConfig(opts);
    this.eventManager = getEventManager();
    this.start();
 }
 get(key) {
   return this.options[key]
 }
 set(key, value) {
   this.options[key] = value;
    return this;
 }
 $init() {
   this.eventManager.emit('packify:init');

   let entryType = typeOf(this.get('entry'));
   console.log('entryType', entryType)

 }
 start() {
   this.$init();
 }
}

module.exports = Core;