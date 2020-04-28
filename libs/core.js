const {
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
  existFileSync,
  getFileType,
  mergeObjects,
} = require('./helpers');

const Exporter = require('@ludoows/packify/libs/export');

const MyHookable = require('@ludoows/packify/libs/hookable');

const Spinnies = require('spinnies');

const default_spinner = { 
  color: 'blue', 
  succeedColor: 'green', 
  spinner: { "interval": 80,
  frames: [
    "[    ]",
    "[=   ]",
    "[==  ]",
    "[=== ]",
    "[ ===]",
    "[  ==]",
    "[   =]",
    "[    ]",
    "[   =]",
    "[  ==]",
    "[ ===]",
    "[====]",
    "[=== ]",
    "[==  ]",
    "[=   ]"
  ] }
};



class Core {
  constructor(opts) {
    this.options = opts;
    this.Queue = {};
    this.Hookable = new MyHookable();
    this.spinnies = new Spinnies(default_spinner);
    this.Start = Date.now();
  }
  queue(file) {

    if (!file) {
      makeError('need file to process to queue management')
    }

    if(file.content) {
      file.content = Buffer.from(file.content,'utf-8');
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
      // process.exit();
    }

    const roadmapTasks = {};
    formater.forEach((entryString) => {

      let canBeProcessed = this.canBeProcessed(entryString);
      let fileType = getFileType(entryString);

      if (!canBeProcessed) {
        // console.log('entryString can not be processed', entryString)
        makeError('le type ' + fileType + ' ne peut pas être transformé. Aucuns plugins ne supportent ce type de fichier.')
        // process.exit();
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

    let self = this;

    let plugins_promises = plugins.map( async ( plugin ) => { return await setPlugin(plugin) })
    
    function setPlugin(plugin) {
      let urlPlugin = self.dependencyResolver(plugin[0] + '.js');

      if (urlPlugin != null) {

        if (plugin[1] === undefined) {
          plugin[1] = {};
        }

        let requiredPlugin = new(require(urlPlugin))(plugin[0], plugin[1], self);

        let extensions = self.get('extensionsTriggered');

        let ExtensionBindedByPlugin = requiredPlugin.extensions()

        if (ExtensionBindedByPlugin.length === 0) {
          makeError('Avez vous défini une liste des extensions que votre plugin ' + plugin[0] + ' peut transformer ?');
          // process.exit();
        }

        let all = [...unique(extensions), ...unique(requiredPlugin.extensions())]
        // console.log('all ?', all)
        self.set('extensionsTriggered', all)

        if(pluginsInitialized.hasOwnProperty(requiredPlugin.name) == false) {
          pluginsInitialized[requiredPlugin.name] = requiredPlugin;
        }

      } else {
        makeError('Unable to resolve plugin : ' + plugin[0] + '');
        // process.exit();
      }

      return plugin[0];
    }

    try {
      let resultPromises = await Promise.all( plugins_promises )
      // console.log('resultPromises', resultPromises)
    } catch (error) {
      console.log('error error error error', error);
      makeError(error)
    }

    // console.log('pluginsInitialized', pluginsInitialized)
    var pluginsInitializedKeys = Object.keys(pluginsInitialized);
    if (pluginsInitializedKeys.length > 0) {
      this.set('registeredPlugins', pluginsInitialized);
    } else if(pluginsInitializedKeys.length === 0) {
      console.warn('No plugins provided')
    }
  }

  async managePlugins() {

    try {
      // console.log('generation hooks enter')
      this.spinnies.add('genHooks', { text: 'We Generate hooks..' });
      
      await this.Hookable.$registrationHooks(this.options.hooks);
      
      this.spinnies.succeed('genHooks', { text: 'hooks Generated!' });
      this.spinnies.remove('genHooks')
    } catch (error) {
      // console.log('generation hooks', error)
      makeError('Unable to generate Hooks');
      // process.exit();
    }

    try {
      // console.log('generateAliases enter')
      this.spinnies.add('genAliases', { text: 'We Generate Aliases..' });
      await this.$generateAliases();
      this.spinnies.succeed('genAliases', { text: 'Aliases Generated!' });
      this.spinnies.remove('genAliases')
    } catch (error) {
      // console.log('generateAliases error', error)
      makeError('Unable to generate Aliases');
      // process.exit();
    }

    try {
      // console.log('enter registerPlugins')
      this.spinnies.add('genPlugins', { text: 'Plugins Initialization..' });
      await this.registerPlugins();
      this.spinnies.succeed('genPlugins', { text: 'Plugins Initialized!' });
      this.spinnies.remove('genPlugins')
    } catch (error) {
      // console.log('error registerPlugins', error)
      makeError('Error, for Registrations Plugins.')
      // process.exit()
    }

    try {
      // console.log('enter generateExecutionOrder')
      this.spinnies.add('generateExecutionOrder', { text: 'generateExecutionOrder Initialization..' });
      await this.generateExecutionOrder();
      this.spinnies.succeed('generateExecutionOrder', { text: 'generateExecutionOrder Ready!' });
      this.spinnies.remove('generateExecutionOrder')
    } catch (error) {
      // console.log('error generateExecutionOrder', error)
      makeError('Error, generateExecutionOrder fails.', error)
    }

  }
  dependencyResolver(nameFile) {

    let sources = this.get('registeredPathLoaders');
    // console.log('sources', sources)

    let ret = null;
    for (let index = 0; index < sources.length; index++) {
      const source = formatPath(sources[index], nameFile);

      if (existFileSync(source) == true) {
        ret = source;
        break;
      }

    }
    // console.log('ret', ret)
    return ret;
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
      }      
  }
  
  async $getDatasPlugin(fileList) {
    let tableau_promesses = fileList.map(async (file) => { return await this.$getResponsePlugin(file) });

    // console.log('tableau_promesses ?', tableau_promesses)

    // console.log('before promises return')

    try {
      let resultPromise = await Promise.all( tableau_promesses );
      return resultPromise
    } catch (error) {
      // console.log('error error error error error', error)
      makeError('Unable to get plugin response', error)
    }
  }

  async $fireTasks() {
    this.spinnies.add('fireTasks', { text: 'Tasks has just started..' });

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
      // console.log('before await', )
      
      try {
        let responses = await self.$getDatasPlugin(fileList)
        // console.log('responses', responses)
      } catch (error) {
        // console.log('error', error)
        makeError(error);
      }
      
      if(indexStart < roadmapKeys.length - 1) {
        // console.log('continue other tasks');
        indexStart++;
        await loadAllTransformations(indexStart);
      }
    }
    await loadAllTransformations(indexStart);
    // console.log('after one')

    this.spinnies.succeed('fireTasks', { text: 'All tasks executed !' });
    this.spinnies.remove('fireTasks')


    // console.log('all tasks executed')
  
  }
  async $runtimeExport() {    
    // console.log('export started');
    this.spinnies.add('export', { text: 'Export has just started..' });

    let Export = new Exporter(this);
    // console.log('after instance export');
    try {
      let stats = await Export.run();
    } catch (error) {
      // console.log('exporter error', error)
      makeError('Export can not work.');
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
    await this.Hookable.callHook('init');

    try {
      // console.log('fireTasks enter')
      await this.$fireTasks();
    } catch (error) {
      // console.log('fireTasks error', error)
      makeError('Unable to fire tasks execution :(');
      // process.exit();
    }
  }
  async start() {
    this.set('extensionsTriggered', []);
    await this.managePlugins();
    await this.$init();
    let Stats = await this.$runtimeExport();
    return Stats;
  }
}

module.exports = Core;