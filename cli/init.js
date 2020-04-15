#!/usr/bin/env node

const {
    getPath,
    requireFile,
    makeError,
    getExtendOption,
    mergeObjects
} = require('../libs/helpers');

const Core = require('../libs/core');

const argv = require('minimist')(process.argv.slice(2));
// console.log(argv);

if (argv.config == undefined || argv.config.length === 0) {
    makeError('Une Configuration est nécessaire pour packify');
}

let entries = getExtendOption();

let options = requireFile(getPath(argv.config));

let packify = new Core(mergeObjects(options, entries));

console.log('packify instance', packify.options)

