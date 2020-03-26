#!/usr/bin/env node

const { getPath } = require('../libs/helpers');

const fs = require('fs');

let scriptsCommands = {
    'packify:dev': 'cross-env NODE_ENV=development node_modules/@ludoows/packify/cli/init.js --config=node_modules/@ludoows/packify/configs/packify.js',
    'packify:prod': 'cross-env NODE_ENV=production node_modules/@ludoows/packify/cli/init.js --config=node_modules/@ludoows/packify/configs/packify.js',
    'packify:watch': 'cross-env NODE_ENV=development node_modules/@ludoows/packify/cli/init.js --config=node_modules/@ludoows/packify/configs/packify.js --watch'
}

let thePackageJson = fs.readFileSync(getPath('package.json'), 'utf-8');

let parsedJson = JSON.parse(thePackageJson);

let keysScript = Object.keys(scriptsCommands);

keysScript.forEach((key) => {
    parsedJson.scripts[key] = scriptsCommands[key];
})

fs.writeFileSync(getPath('package.json'), '');
fs.writeFileSync(getPath('package.json'), JSON.stringify(parsedJson))



