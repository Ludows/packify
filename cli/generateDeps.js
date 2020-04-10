#!/usr/bin/env node

const {
    getPath,
    getListingDependenciesProject
} = require('../libs/helpers');

const fs = require('fs');

let listing = getListingDependenciesProject();

let pathCheck = getPath('deps.json');

console.log('pathCheck', pathCheck)

if(fs.existSync(pathCheck)) {
    fs.unlinkSync(pathCheck);
    // fs.
    fs.writeFileSync(pathCheck);
}
else {
    fs.writeFileSync(pathCheck);
}

