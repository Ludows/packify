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
    console.log(renderedError);
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
    typeOf
}