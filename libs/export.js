const crypto = require('crypto');
var Stream = require('stream');

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

    let all_promesses = QueueKeys.map(async (file) => {
      return await this.$runFileProcess(file);
    });
    
    var all = Promise.all(
      all_promesses
    ).then(result => {
      result.forEach((res) => {
        OutputTable.addRow(
          res,
          { color: 'green' }
        );
      })
      OutputTable.printTable();
    })
    .catch((error) => {
      console.log('error', error)
      makeError('Unable to create files', error)
    })




    // for (const file in this.Queue) {
    //     if (this.Queue.hasOwnProperty(file)) {
    //       const element = this.Queue[file];
    //       // console.log('element', element)
    //       let urlDest = await this.getUrlDest(element, this.Compiler.options.output);
    //       await this.createStreamableProcess(element, urlDest)
    //     }
    //   }
  }
  async $runFileProcess(element) {
    let urlDest = await this.getUrlDest(element, this.Compiler.options.output);
    await this.createStreamableProcess(element, urlDest)

    return { source: file , dest: urlDest }
  }
  async createHash(name) {
    var hash = crypto.createHash('md5').update(name).digest('hex');
    return hash;
  }
  async createStreamableProcess(file, urlDest) {
    var stream = new Stream();
    stream.on('data', function (data) {
      // process.stdout.write(data); // change process.stdout to ya-csv
      // compiler.$updateProgress(count);
      if (fs.existsSync(path.dirname(urlDest)) == false) {
        fs.mkdirSync(path.dirname(urlDest), {
          recursive: true
        })
      }

      if (fs.existsSync(urlDest) == false) {
        fs.writeFileSync(urlDest, data)
      } else {
        fs.writeFileSync(urlDest, '')
        fs.writeFileSync(urlDest, data)
      }

    });

    stream.emit('data', file.content);
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