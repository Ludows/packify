const {
  mergeConfig,
  getEventManager,
  typeOf,
  requireFile,
  getListingDir,
  makeError,
  getPath,
  formatPath,
  unique,
  readFileSync,
  getFileType
} = require('./helpers');

class Core {
  constructor(opts) {
    this.options = mergeConfig(opts);
    this.eventManager = getEventManager();
    this.Queue = [];
    this.start();
  }
  queue(file) {

    if (!file) {
      makeError('need file to process to queue management')
      process.exit();
    }

    if (this.isInQueue(file)) {

    } else {
      // Todo cas de l'update
    }

  }
  isInQueue(fileObject) {
    let ret = false;
    for (let index = 0; index < this.Queue.length; index++) {
      const file = this.Queue[index];
      if (file.src === fileObject.src) {
        ret = true
        break;
      }
    }
    return ret;
  }
  canBeProcessed(extension) {
    let ret = false;
    let extensions = this.get('extensionsTriggered');
    if (extensions.indexOf(getFileType(extension)) > -1) {
      ret = true;
    }
    return ret;
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
      // console.log('plugin', plugin)
      let urlPlugin = this.dependencyResolver(plugin[0] + '.js', allPluginsPath);
      // console.log('urlPlugin', urlPlugin);



      if (urlPlugin != null) {
        let requiredPlugin = new(requireFile(urlPlugin))(plugin[0], plugin[1]);

        let extensions = this.get('extensionsTriggered');

        let ExtensionBindedByPlugin = requiredPlugin.extensions()

        if (ExtensionBindedByPlugin.length === 0) {
          makeError('Avez vous défini une liste des extensions que votre plugin ' + plugin[0] + ' peut transformer ?');
          process.exit();
        }

        this.set('extensionsTriggered', unique(requiredPlugin.extensions()))

        requiredPlugin.run(this);

        pluginsInitialized.push(requiredPlugin);

      } else {
        makeError('the specified plugin ' + plugin[0] + ' was not found');
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

      if (files.indexOf(nameFile) > -1) {
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
    // console.log('entryType', entryType)

    if (entryType === 'string') {

      let formater = [];
      formater.push(entry);
      formater.forEach((entryString) => {
        let canBeProcessed = this.canBeProcessed(entryString);
        let fileTypeError = getFileType(entryString);
        if (!canBeProcessed) {
          makeError('le type ' + fileTypeError + ' ne peut pas être transformé. Aucuns plugins ne supportent ce type de fichier.')
          process.exit();
        }
        this.eventManager.emit('packify:eachEntry', entryString);

        this.eventManager.emit('packify:readContent', readFileSync(entryString));

      })

    } else {

      entry.forEach((entryPoint) => {

        let canBeProcessed = this.canBeProcessed(entryPoint);
        let fileTypeError = getFileType(entryPoint);
        if (!canBeProcessed) {
          makeError('le type ' + fileTypeError + ' ne peut pas être transformé. Aucuns plugins ne supportent ce type de fichier.')
          process.exit();
        }

        this.eventManager.emit('packify:eachEntry', entryPoint);

        this.eventManager.emit('packify:readContent', readFileSync(entryPoint));

      })

    }

  }
  checkDeps() {
    console.log('check deps.json is existing... ');
    console.log('depsPath', depsPath)

    let depsPath = getPath('node_modules', '@ludoows', 'packify', 'deps.json');

    console.log('depsPath', depsPath)

    if(!fs.existsSync(depsPath)) {
        console.log('check deps.json is not existing... we build this.');
        let listing = getListingDependenciesProject();
        // console.log('listing', listing)
        fs.writeFileSync(listing);
    }  
  }
  start() {
    this.checkDeps();
    this.set('extensionsTriggered', []);
    this.managePlugins();
    this.$init();
  }
}

module.exports = Core;