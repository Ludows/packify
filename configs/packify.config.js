const Core = require('../libs/core');


const { walker, getPath } = require('../libs/helpers');

const folders = [
    getPath('resources'),
    getPath('public', 'images')
]

let assets = [];

folders.forEach((folder) => {
    assets.concat(walker(folder, [], true, ['png', 'jpg', 'gif', 'css', 'js']));
})

const extendOptionsConfigurationFile = {
    entry : Core.entry(assets)
}



//Core.options();

module.exports = extendOptionsConfigurationFile
