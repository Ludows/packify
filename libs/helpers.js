const merge = require('deepmerge');
const path = require('path');
const fs = require('fs');
const events = require('events');
const eventEmitter = new events.EventEmitter();
const PrettyError = require('pretty-error');
const pe = new PrettyError();
const vm = require('vm');


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

function walker(...args) {

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

function getEntries() {
    let filePackifyExist = fs.existsSync(getPath('packify.config.js'))
    let contentFile = undefined;
    // si le user veut custom la config. Son fichier sera pris en compte.
    // sinon c'est ma configuration qui prendra le relais
    if(filePackifyExist) {
        contentFile = readFileSync(getPath('packify.config.js'));
    }
    else {
        contentFile = readFileSync(getPath('node_modules', '@ludoows', 'packify', 'packify.config.js'));
    }

    // const contextifiedObject = vm.createContext(contentFile);

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
    getEntries
}