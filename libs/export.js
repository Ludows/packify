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

    try {
      
      var results = await Promise.all( all_promesses );

      let header = [];
      let headers_table = [
        "Source File",
        "Output file",
        "Hash"
      ]

      for (let index = 0; index < headers_table.length; index++) {
        const type = headers_table[index];

        if(type.toLowerCase() === "hash" && !this.Compiler.options.output.hash) {
          break;
        }
        header.push({
          value: type,
          headerColor: "green",
          width: this.Compiler.options.output.hash ? "33%" : "50%"
        })

      }

      const options = {
        headerAlign: "left",
        align: "left",
        color: "green",
        truncate: false,
        width: "100%",
        compact: false,
        borderColor: 'green'
      }

      let rows = []
      
      results.forEach((result) => {
        let line_row = [];
        let keysResult = Object.keys(result);
        
        keysResult.forEach((key) => {
          line_row.push(result[key]);
        })
        
        rows.push(line_row);
      })

      await this.Compiler.Hookable.callHook('end', results, this.Compiler);
      // console.log('after end hook')
      await this.Compiler.Hookable.callHook('mdasset', results, this.Compiler);
      // console.log('after mdasset hook')
      this.Compiler.spinnies.succeed('export', { text: 'Export success !' });

      this.Compiler.spinnies.remove('export')

      // console.log('header', header)
      // console.log('rows', rows)
      // console.log('options', options)
      var end = Date.now();
      const out = Table(header,rows,options).render();

      console.log('Process executed in '+ ( end - this.Compiler.Start ) +' ms')
      console.log(out)

    } catch (error) {
      console.log('error', error)
      makeError('Unable to create files', error)
    }
    
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

      let urlDestMap = urlDest+".map";
      if (fs.existsSync(urlDestMap) == false) {
        fs.writeFileSync(urlDestMap, file.map.toString())
      } else {
        fs.writeFileSync(urlDestMap, '')
        fs.writeFileSync(urlDestMap, file.map.toString())
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