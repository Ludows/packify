const merge = require('deepmerge');
const path = require('path');
const fs = require('fs');
const events = require('events');
const eventEmitter = new events.EventEmitter();


const basePackifyConfig = require('../configs/packify');

function mergeConfig(opts) {
    return merge(basePackifyConfig, opts);
}

function getPath(...args) {
    return path.join(getBasePath(), ...args);
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
    console.log('...args', ...args)
}

module.exports = {
    mergeConfig,
    getPath,
    getBasePath,
    formatPath,
    getEventManager,
    parseFile, 
    requireFile,
    makeError
}