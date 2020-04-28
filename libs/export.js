const crypto = require('crypto');

const translator = require('@ludoows/packify/libs/translator');

const {
  getFileType,
  getFileName,
  getDirectory,
  formatPath,
  makeError
} = require('@ludoows/packify/libs/helpers');

// a améliorer
const path = require('path');
const fs = require('fs');

const { Table } = require('console-table-printer');

class Exporter {
  constructor(...args) {
    this.Compiler = args[0];
    this.Stats = {};
  }
  async run() {

    let OutputTable = new Table();

    let QueueKeys = Object.keys(this.Compiler.Queue);

    // console.log('Queue ? ', this.Compiler.Queue)

    let all_promesses = QueueKeys.map(async (file) => {
      return await this.$runFileProcess(this.Compiler.Queue[file]);
    });

    try {
      
      var results = await Promise.all( all_promesses );
      
      results.forEach((result) => {
        OutputTable.addRow(
          result,
          { color: 'green' }
        );
      })

      await this.Compiler.Hookable.callHook('end', results);
      console.log('after end hook')
      await this.Compiler.Hookable.callHook('mdasset');
      console.log('after mdasset hook')

      OutputTable.printTable();

    } catch (error) {
      console.log('error', error)
      makeError('Unable to create files', error)
    }
    
  }
  async $runFileProcess(element) {

    // console.log('element ?', element)

    let urlDest = await this.getUrlDest(element, this.Compiler.options.output);
    let objectReturn = { source: element.src , dest: urlDest }
    await this.createStreamableProcess(element, urlDest)

    if(this.Compiler.options.output.hash) {
      let theHash = await this.createHash(element.name);
      objectReturn = { source: element.src , compiled: urlDest, hash:theHash }
    }

    return objectReturn
  }
  async createHash(name) {
    var hash = crypto.createHash('md5').update(name).digest('hex');
    return hash;
  }
  async createStreamableProcess(file, urlDest) {
      if (fs.existsSync(path.dirname(urlDest)) == false) {
        fs.mkdirSync(path.dirname(urlDest), {
          recursive: true
        })
      }

      if (fs.existsSync(urlDest) == false) {
        fs.writeFileSync(urlDest, file.content.toString())
      } else {
        fs.writeFileSync(urlDest, '')
        fs.writeFileSync(urlDest, file.content.toString())
      }
  }
  async getUrlDest(file, optionsOutput) {
    let skippingPartsUrl = optionsOutput.pathsFragmentSkipping
    let returnStatement = null;

    let fileType = getFileType(file.src);
    let File = getFileName(file.src);
    let baseDir = getDirectory(file.src);

    for (let index = 0; index < skippingPartsUrl.length; index++) {
      const element = skippingPartsUrl[index];

      if (baseDir.includes(element)) {
        baseDir = baseDir.replace(element, path.sep + optionsOutput.folder);
        break;
      }
    }

    if (translator.needChange[fileType]) {
      // si l'extension doit être changée..

      let extension_for_folder = translator.extensions[fileType];

      let predictedFolders = translator.predictedFolders[extension_for_folder];

      for (let k = 0; k < predictedFolders.length; k++) {
        const predictedFolder = predictedFolders[k];
        if (baseDir.indexOf(predictedFolder) > -1) {
          baseDir = baseDir.replace(predictedFolder, extension_for_folder);
          break;
        }

      }

      const reg = new RegExp(fileType, 'g');
      // console.log('reg', reg)

      File = File.replace(reg, extension_for_folder);

    }

    returnStatement = formatPath(baseDir, File);

    return returnStatement;
  }
}

module.exports = Exporter;