const merge = require('deepmerge');
const path = require('path');
const fs = require('fs');
const events = require('events');
const eventEmitter = new events.EventEmitter();
const PrettyError = require('pretty-error');
const pe = new PrettyError();

const basePackifyConfig = require('../configs/packify');

function mergeConfig(opts) {
    return merge(basePackifyConfig, opts);
}

function getPath(...args) {
    return path.join(getBasePath(), ...args);
}

function typeOf(...args) {
    return ({}).toString.call(...args).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
}

function getBasePath() {
    return process.cwd();
}

function formatPath(...args) {
    return path.join(...args);
}

function getEventManager() {
    return eventEmitter;
}

function parseFile(...args) {
    return JSON.parse(fs.readFileSync(...args));
}

function requireFile(...args) {
    return require(...args);
}

function makeError(...args) {
    var renderedError = pe.render(new Error(...args));
    // console.log(renderedError);
}

function walker(dir, filelist, recursive, extensions = []) {
    var fs = fs || require('fs'),
        files = fs.existsSync(dir) ? fs.readdirSync(dir) : [],
        filelist = filelist || [];
    files.forEach(function (file) {
        if (recursive != undefined && recursive) {
            if (fs.statSync(path.join(dir, file)).isDirectory()) {
                filelist = walker(path.join(dir, file), filelist, recursive, extensions);
            } else {
                let extname = path.extname(file).substr(1);
                if (extensions.indexOf(extname) > -1 && extensions.length > 0) {
                    filelist.push(path.join(dir, file));
                }
            }
        } else {
            var full_path = path.join(dir, file);
            let extname = path.extname(file).substr(1);
            if (extensions.indexOf(extname) > -1 && extensions.length > 0) {
                filelist.push(path.join(dir, file));
            }
        }

    });
    return filelist;
}

function unique(array) {
    return array.filter((x, i, a) => a.indexOf(x) == i)
}

function readFileSync(url) {
    return fs.readFileSync(url);
}

function getFileType(...args) {
    return path.extname(...args).substr(1);
}

function getFileName(...args) {
    return path.basename(...args)
}

function getDirectory(...args) {
    return path.dirname(...args)
}

function getListingDir(pathFile, FileTypesOpt = false) {
    return fs.readdirSync(pathFile, {withFileTypes: FileTypesOpt});
}

function getExtendOption() {
    let filePackifyExist = fs.existsSync(getPath('packify.config.js'))
    // console.log('getPath', getPath('packify.config.js'))
    // console.log('filePackifyExist', filePackifyExist)
    // console.log('filePackifyExist Compare', fs.existsSync(getPath('node_modules', '@ludoows', 'packify', 'configs', 'packify.config.js')))
    let file = undefined;
    // si le user veut custom la config. Son fichier sera pris en compte.
    // sinon c'est ma configuration qui prendra le relais
    if(filePackifyExist) {
        file = getPath('packify.config.js');
    }
    else {
        file = getPath('node_modules', '@ludoows', 'packify', 'configs', 'packify.config.js');
    }

    let result = require(file)
    console.log('result', result);

    return result;
}

module.exports = {
    mergeConfig,
    getPath,
    getBasePath,
    formatPath,
    getEventManager,
    parseFile, 
    requireFile,
    makeError,
    typeOf,
    walker,
    getFileType,
    getFileName,
    getDirectory,
    unique,
    getListingDir,
    readFileSync,
    getExtendOption
}