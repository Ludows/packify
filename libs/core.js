const {
  getEventManager,
  typeOf,
  requireFile,
  getListingDir,
  getListingDirSync,
  parseFile,
  makeError,
  getPath,
  formatPath,
  unique,
  readFileSync,
  getFileType,
  mergeObjects,
} = require('./helpers');

const ProgressUi = require('./progress');
const colors = require('colors/safe');

const Exporter = require('./export');



class Core {
  constructor(opts) {
    this.options = opts;
    this.eventManager = getEventManager();
    this.Queue = {};
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
    if (QueueKeys.length > 0) {
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
  getFileObjectFromQueue(file) {
    return this.Queue[file];
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

  async generateExecutionOrder() {

    let registeredPlugins = this.get('registeredPlugins');

    let entry = this.get('entry');
    let entryType = typeOf(entry);

    let formater = [];
    // let formaterCounter = 0;

    // console.log('entryType', entryType)
    if (entryType === 'string') {

      formater.push(entry);

    } else if (entryType === 'array') {

      formater = entry;

    } else {
      makeError('Packify not support at this moment, entries as objects. Please to use array of entries or string entry');
      process.exit();
    }

    const roadmapTasks = {};
    formater.forEach((entryString) => {

      let canBeProcessed = this.canBeProcessed(entryString);
      let fileType = getFileType(entryString);

      if (!canBeProcessed) {
        console.log('entryString can not be processed', entryString)
        makeError('le type ' + fileType + ' ne peut pas être transformé. Aucuns plugins ne supportent ce type de fichier.')
        process.exit();
      }

      let registeredPluginsKeys = Object.keys(registeredPlugins);

      for (let index = 0; index < registeredPluginsKeys.length; index++) {
        const plugin = registeredPlugins[registeredPluginsKeys[index]];
        let exts = plugin.extensions();

        if (exts.indexOf(fileType) > -1) {

          if (!roadmapTasks.hasOwnProperty(plugin.name)) {
            roadmapTasks[plugin.name] = [];
          }

          if (roadmapTasks[plugin.name].indexOf(entryString) === -1) {
            roadmapTasks[plugin.name].push(entryString);
          }
        }
      }
    })
    this.set('roadmapTasks', roadmapTasks)
  }

  async registerPlugins() {
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
    let pluginsInitialized = {};

    plugins.forEach(async (plugin) => {
      // console.log('plugin', plugin)

      let urlPlugin = this.dependencyResolver(plugin[0] + '.js');

      if (urlPlugin != null) {

        if (plugin[1] === undefined) {
          plugin[1] = {};
        }

        let requiredPlugin = new(requireFile(urlPlugin))(plugin[0], plugin[1], this);

        let extensions = this.get('extensionsTriggered');

        let ExtensionBindedByPlugin = requiredPlugin.extensions()

        if (ExtensionBindedByPlugin.length === 0) {
          makeError('Avez vous défini une liste des extensions que votre plugin ' + plugin[0] + ' peut transformer ?');
          process.exit();
        }

        let all = [...unique(extensions), ...unique(requiredPlugin.extensions())]
        // console.log('all ?', all)
        this.set('extensionsTriggered', all)

        if(pluginsInitialized.hasOwnProperty(requiredPlugin.name) == false) {
          pluginsInitialized[requiredPlugin.name] = requiredPlugin;
        }

      } else {
        makeError('Unable to resolve plugin : ' + plugin[0] + '');
        process.exit();
      }

    })

    console.log('pluginsInitialized', pluginsInitialized)
    var pluginsInitializedKeys = Object.keys(pluginsInitialized);
    if (pluginsInitializedKeys.length > 0) {
      this.set('registeredPlugins', pluginsInitialized);
    } else if(pluginsInitializedKeys.length === 0) {
      console.warn('No plugins provided')
    }
  }

  async managePlugins() {

    try {
      await this.registerPlugins();
    } catch (error) {
      makeError('Error, for Registrations Plugins.')
      process.exit()
    }

    try {
      await this.generateExecutionOrder();
    } catch (error) {
      makeError('Error, generateExecutionOrder fails.')
      process.exit()
    }

  }
  dependencyResolver(nameFile) {

    let sources = this.get('registeredPathLoaders');
    // console.log('sources', sources)

    let ret = null;
    for (let index = 0; index < sources.length; index++) {
      const source = sources[index];
      let files = getListingDirSync(source)
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

  async $getResponsePlugin(file) {
    // console.log('list')
    let plugins = this.get('registeredPlugins');
    let isInQueue = this.isInQueue({"src": file});
    let fileObject = {
      src: file
    }
    // console.log('isInQueue', isInQueue)

    if(isInQueue) {
      fileObject = this.getFileObjectFromQueue(file);
    }

    let pluginName = this.get('pluginName');

    // return new Promise((resolve, reject) => {
      // console.log('passed ?')
      try {
        let fetchResp = await plugins[pluginName].run(fileObject);
        this.queue(fetchResp);
        return fetchResp;
      } catch (error) {
        // console.log(error)
        makeError('Unable to run task', error)
        process.exit();
      }      
  }
  
  async $getDatasPlugin(fileList) {
    let tableau_promesses = fileList.map(async (file) => { return await this.$getResponsePlugin(file) });

    // console.log('tableau_promesses ?', tableau_promesses)

    // console.log('before promises return')

    let resultPromise = await Promise.all( tableau_promesses );
    return resultPromise
  }

  async $fireTasks() {
    let roadmap = this.get('roadmapTasks');
    let plugins = this.get('registeredPlugins');

    // console.log('roadmap', roadmap)

    var self = this;


    let roadmapKeys = Object.keys(roadmap);
    let indexStart = 0;

    // console.log('roadmapKeys l', roadmapKeys.length)

    async function loadAllTransformations(index) {
      let pluginName = roadmapKeys[index];
      const fileList = roadmap[pluginName];
      // console.log('fileList', fileList)
      self.set('pluginName', pluginName)
      console.log('before await', )
      
      try {
        let responses = await self.$getDatasPlugin(fileList)
        console.log('responses', responses)
      } catch (error) {
        console.log('error', error)
      }
      
      console.log('after await')
      
      
    }
    await loadAllTransformations(indexStart);
    console.log('after one')

    if(indexStart <= roadmapKeys.length - 1) {
      console.log('continue other tasks');
      indexStart++;
      await loadAllTransformations(indexStart);
    }

    console.log('all tasks executed')
  
  }
  async $runtimeExport() {    

    let Export = new Exporter(this.Queue);

    try {
      let stats = await Export.run();
    } catch (error) {
      makeError('Export can not work.');
      process.exit();
    }

    return stats;
  }
  async $generateAliases() {
    
    let packageRoot = null;
    try {
      packageRoot = await parseFile(getPath('package.json'));
    } catch (error) {
      makeError('le fichier package.json ne peut pas être parsé.');
    } 
    // getPath()
    let keysAlias = Object.keys(this.options.alias);

    let allDeps = mergeObjects(packageRoot.devDependencies, packageRoot.dependencies);

    let allDepsKeys = Object.keys(allDeps);

    keysAlias.forEach((folderAlias) => {
      // adding resolves to node_modules.
      allDepsKeys.forEach((dep) => {
        if (keysAlias.indexOf(dep) === -1) {
          this.options.alias[dep] = getPath('node_modules', dep);
          // support for sass :)
          this.options.alias['~' + dep] = getPath('node_modules', dep);
        }
      })

      this.options.alias[folderAlias] = getPath(this.options.alias[folderAlias]);
    })
  }
  async $init() {
    this.eventManager.emit('packify:init');

    // let progressPck = new ProgressUi({
    //   format: 'CLI Progress |' + colors.green('{bar}') + '| {percentage}%'
    // })

    // let progress = progressPck.make();

    // this.set('Progress', progress);

    // console.log('Progress', this.options.Progress)

    try {
      await this.$generateAliases();
    } catch (error) {
      makeError('Unable to generate Aliases');
      process.exit();
    }

    try {
      await this.$fireTasks();
    } catch (error) {
      makeError('Unable to fire tasks execution :(');
      process.exit();
    }
  }
  async start() {
    this.set('extensionsTriggered', []);
    await this.managePlugins();
    await this.$init();
    let Stats = await $runtimeExport();
    return Stats;
  }
}

module.exports = Core;