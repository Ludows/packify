#!/usr/bin/env node

const { getPath } = require('../libs/helpers');
const fs = require('fs');
const path = require('path');

// console.log('getPath', getPath('package.json'))

// console.log('process.mainModule.path', process.mainModule.path)

// console.log('process.env.INIT_CWD', process.env.INIT_CWD)

let thePathPackageJson = path.join(process.env.INIT_CWD, 'package.json');


let scriptsCommands = {
    'packify:dev': 'cross-env NODE_ENV=development node_modules/@ludoows/packify/cli/init.js --config=node_modules/@ludoows/packify/configs/packify.js',
    'packify:prod': 'cross-env NODE_ENV=production node_modules/@ludoows/packify/cli/init.js --config=node_modules/@ludoows/packify/configs/packify.js',
    'packify:watch': 'cross-env NODE_ENV=development node_modules/@ludoows/packify/cli/init.js --config=node_modules/@ludoows/packify/configs/packify.js --watch'
}

let thePackageJson = fs.readFileSync(thePathPackageJson, 'utf-8');

let parsedJson = JSON.parse(thePackageJson);

let keysScript = Object.keys(scriptsCommands);

keysScript.forEach((key) => {
    if(parsedJson.scripts[key] === undefined) {
        parsedJson.scripts[key] = scriptsCommands[key];
    }
})

let cliPath = getPath('cli', 'init.js');

fs.chmodSync(cliPath, '755');

fs.writeFileSync(thePathPackageJson, '');
fs.writeFileSync(thePathPackageJson, JSON.stringify(parsedJson))



