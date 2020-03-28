const {
  mergeConfig,
  getEventManager,
  typeOf,
  requireFile,
  getListingDir,
  getPath
} = require('./helpers');

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
  manageLoaders() {
    let allLoadersPath = [];
    let resolvers = this.get('resolvers');
    
    let Baseloaders = getPath('node_modules', '@ludoows', 'packify', 'loaders');

    let loaders = this.get('loaders');

    allLoadersPath = [
      Baseloaders,
      ...resolvers.loaders
    ]

    this.set('registeredPathLoaders', allLoadersPath);

    console.log('allLoadersPath', allLoadersPath);

    loaders.forEach((loader) => {
      let urlLoader = this.dependencyResolver(loader[1], allLoadersPath);
    })
  }
  dependencyResolver(nameFile, arrayOfSources) {
    let ret = null;
    for (let index = 0; index < arrayOfSources.length; index++) {
      const source = arrayOfSources[index];
      let files = getListingDir(source, false)
      console.log('files dependencyResolver', files)

      if(files.indexOf(nameFile) > -1) {
        ret = getPath(source, nameFile+'.js');
        break;
      }

    }

    return ret;

  }
  $init() {
    this.eventManager.emit('packify:init');

    let entry = this.get('entry');
    let entryType = typeOf(entry);
    console.log('entryType', entryType)

    if (entryType === 'string') {
      let formater = [];
      formater.push(entry);
      formater.forEach((entryString) => {

      })
    } else if (entryType === 'array') {
      entry.forEach((entryPoint) => {

      })
    } else {
      let keysEntry = Object.keys(entry);

      keysEntry.forEach((entryObject) => {

      })
    }

  }
  start() {
    this.manageLoaders();
    this.$init();
  }
}

module.exports = Core;