const { getPath, getListingDependenciesProject } = require('../libs/helpers');
const fs = require('fs');
const path = require('path');

let depsPath = getPath('deps.json');
let depsCliPath = getPath('cli', 'deps.json');

console.log('depsPath', depsPath)

if(!fs.existsSync(depsPath)) {
    let listing = getListingDependenciesProject();
    console.log('listing', listing)

    fs.writeFileSync(listing);
}

if(fs.existsSync(depsPath)) {
    fs.chmodSync(depsPath, '755');
    fs.chmodSync(depsCliPath, '755');
}