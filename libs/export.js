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
const util = require('util');
const { stream, Readable , Writable, pipeline } = require('stream')

// console.log(pipeline)


const Table = require('tty-table')

class Exporter {
  constructor(...args) {
    this.Compiler = args[0];
    this.Stats = {};
  }
  async run() {


    let QueueKeys = Object.keys(this.Compiler.Queue);

    // console.log('Queue ? ', this.Compiler.Queue)

    let all_promesses = QueueKeys.map(async (file) => {
      return await this.$runFileProcess(this.Compiler.Queue[file]);
    });

    let results = undefined;

    try {
      
      results = await Promise.all( all_promesses );

    } catch (error) {
      console.log('error', error)
      makeError('Unable to create files', error)
    }

    return results;
    
  }
  async $runFileProcess(element) {

    // console.log('element ?', element)

    let urlDest = await this.getUrlDest(element, this.Compiler.options.output);
    let objectReturn = { source : element.src , compiled : urlDest }
    await this.createStreamableProcess(element, urlDest)

    if(this.Compiler.options.output.hash) {
      let theHash = await this.createHash(element.name);
      objectReturn = { source : element.src , compiled : urlDest, hash : theHash }
    }

    return objectReturn
  }
  async createHash(name) {
    var hash = crypto.createHash('md5').update(name).digest('hex');
    return hash;
  }
  async createStreamableProcess(file, urlDest) {

    let pipelineFiles = util.promisify(pipeline)

      if (fs.existsSync(path.dirname(urlDest)) == false) {
        await fs.promises.mkdir(path.dirname(urlDest), {
          recursive: true
        })
      }

      if (fs.existsSync(urlDest)) {
        await fs.promises.unlink(urlDest);
      }

      const readableFile = Readable.from(file.content.toString());
      const writeFileStreamExport = fs.createWriteStream(urlDest);
      await pipelineFiles(readableFile, writeFileStreamExport)

      let urlDestMap = urlDest+".map";
      if (fs.existsSync(urlDestMap)) {
        await fs.promises.unlink(urlDestMap);
      }

      if(file.map) {
        const readableFileMap = Readable.from(file.map.toString());
        const writeFileStreamExportMap = fs.createWriteStream(urlDestMap);
        await pipelineFiles(readableFileMap, writeFileStreamExportMap);
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