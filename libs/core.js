
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
 register(key, options) {

 }
 $init() {
   this.eventManager.emit('packify:init');

   let entry = this.get('entry');
   let entryType = typeOf(entry);
   console.log('entryType', entryType)

   if(entryType === 'string') {
     let formater = [];
     formater.push(entry);
     formater.forEach((entryString) => {

     })
   }
   else if(entryType === 'array') {
    entry.forEach((entryPoint) => {

    })
   }
   else {
    let keysEntry = Object.keys(entry);

    keysEntry.forEach((entryObject) => {

    })
   }

 }
 start() {
   this.$init();
 }
}

module.exports = Core;