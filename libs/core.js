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
  getFileType, 
  mergeObjects,
  existFileSync,
  writeFileSync,
  getListingDependenciesProject,
  createReadStreamFromString, 
  createWriteStream
} = require('./helpers');

const ProgressUi = require('./progress');
const colors = require('colors/safe');

class Core {
  constructor(opts) {
    this.options = opts;
    this.eventManager = getEventManager();
    this.Queue = {};
    this.start();
  }
  queue(file) {

    if (!file) {
      makeError('need file to process to queue management')
      process.exit();
    }

    if (this.isInQueue(file) === false) {
      this.Queue[file.src] = file
    } else {
      // Todo cas de l'update
      this.Queue[file.src].content = file.content;
    }

  }
  isInQueue(fileObject) {
    let ret = false;
    let QueueKeys = Object.keys(this.Queue)
    if(QueueKeys.length > 0) {
      for (let index = 0; index < QueueKeys.length; index++) {
        const file = this.Queue[QueueKeys[index]];
        if (file.src === fileObject.src) {
          ret = true
          break;
        }
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

        let all = [...unique(extensions), ...unique(requiredPlugin.extensions())]
        // console.log('all ?', all)
        this.set('extensionsTriggered', all)

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
  $startProgress(maxInt) {
    this.options.Progress.start(maxInt, 0, {
      speed: "N/A"
    });
    return this;
  }
  $updateProgress(integer) {
    this.options.Progress.update(integer);
    return this;
  }
  $stopProgress() {
    this.options.Progress.stop();
    return this;
  }
  $generateAliases() {

    let packageRoot = JSON.parse(readFileSync(getPath('package.json')));
    // getPath()
    let keysAlias = Object.keys(this.options.alias);

    let allDeps = mergeObjects(packageRoot.devDependencies, packageRoot.dependencies);

    let allDepsKeys = Object.keys(allDeps);

    keysAlias.forEach((folderAlias) => {
      // adding resolves to node_modules.
      allDepsKeys.forEach((dep) => {
        if(keysAlias.indexOf(dep) === -1) {
          this.options.alias[dep] = getPath('node_modules', dep);
        }
      })
      
      this.options.alias[folderAlias] = getPath(this.options.alias[folderAlias]);
    })
  }
  $init() {
    this.eventManager.emit('packify:init');

    let progressPck = new ProgressUi({
      format: 'CLI Progress |' + colors.green('{bar}') + '| {percentage}%'
    })

    let progress = progressPck.make();

    this.set('Progress', progress);

    // console.log('Progress', this.options.Progress)

    this.$generateAliases();

    let entry = this.get('entry');
    let entryType = typeOf(entry);

    let formaterCounter = 0;
    // console.log('entryType', entryType)

    

    if (entryType === 'string') {

      let formater = [];
      formater.push(entry);

      this.$startProgress(formater.length);

      formater.forEach((entryString) => {
        let canBeProcessed = this.canBeProcessed(entryString);
        let fileTypeError = getFileType(entryString);
        if (!canBeProcessed) {
          console.log('entryString can not be processed', entryString)
          makeError('le type ' + fileTypeError + ' ne peut pas être transformé. Aucuns plugins ne supportent ce type de fichier.')
          this.$stopProgress();
          process.exit();
        }
        this.eventManager.emit('packify:eachEntry', entryString, formaterCounter);

        // cet event est plus precis. Il est emis selon le type de l'entry.
        this.eventManager.emit('packify:entry:'+fileTypeError, entryPoint, formaterCounter);

        // this.$updateProgress(formaterCounter);

        if(formaterCounter === entry.length - 1) {
          this.eventManager.emit('packify:processEnded', this.Queue);
        }
        
        formaterCounter++;
      })

    } else {
      
      this.$startProgress(entry.length);
      entry.forEach((entryPoint) => {

        let canBeProcessed = this.canBeProcessed(entryPoint);
        let fileTypeError = getFileType(entryPoint);
        
        if (!canBeProcessed) {
          console.log('entryString can not be processed', entryPoint)
          makeError('le type ' + fileTypeError + ' ne peut pas être transformé. Aucuns plugins ne supportent ce type de fichier.')
          this.$stopProgress();
          process.exit();
        }

        this.eventManager.emit('packify:eachEntry', entryPoint, formaterCounter);

        // this event is more precive.
        this.eventManager.emit('packify:entry:'+fileTypeError, entryPoint, formaterCounter);

        
        if(formaterCounter === entry.length - 1) {
          this.eventManager.emit('packify:processEnded', this.Queue);
          this.$stopProgress();
        }
        
        formaterCounter++;
      })

    }

  }
  start() {
    this.set('extensionsTriggered', []);
    this.managePlugins();
    this.$init();
  }
}

module.exports = Core;