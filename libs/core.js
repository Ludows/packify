const {
  mergeConfig,
  getEventManager,
  typeOf,
  requireFile,
  getListingDir,
  makeError,
  getPath,
  formatPath
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
  managePlugins() {
    let allPluginsPath = [];
    let resolvers = this.get('resolvers');
    
    let BasePlugins = getPath('node_modules', '@ludoows', 'packify', 'plugins');

    let plugins = this.get('plugins');

    allPluginsPath = [
      BasePlugins,
      ...resolvers.plugins
    ]

    this.set('registeredPathLoaders', allPluginsPath);

    // console.log('allLoadersPath', allLoadersPath);
    let pluginsInitialized = [];

    plugins.forEach((plugin) => {
      console.log('plugin', plugin)
      let urlPlugin = this.dependencyResolver(plugin[0]+'.js', allPluginsPath);
      // console.log('urlPlugin', urlPlugin);

      

      if(urlPlugin != null) {
        let requiredPlugin = new ( requireFile(urlPlugin) )(plugin[0], plugin[1]);

        requiredPlugin.run(this);

        pluginsInitialized.push(requiredPlugin);

      }
      else {
        makeError('the specified plugin '+ plugin[0] +' was not found');
        process.exit();
      }
    })
    this.set('pluginsInitialized', pluginsInitialized);
  }
  dependencyResolver(nameFile, arrayOfSources) {
    let ret = null;
    for (let index = 0; index < arrayOfSources.length; index++) {
      const source = arrayOfSources[index];
      let files = getListingDir(source, false)
      // console.log('files dependencyResolver', files)

      if(files.indexOf(nameFile) > -1) {
        ret = formatPath(source, nameFile);
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
    this.managePlugins();
    this.$init();
  }
}

module.exports = Core;