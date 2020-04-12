const Core = require('../libs/core');


const {
    walker,
    getPath
} = require('../libs/helpers');

const folders = [
    getPath('resources'),
    getPath('public', 'images')
]

let assets = [];

folders.forEach((folder) => {
    let links = walker(folder, [], true, ['png', 'jpg', 'gif', 'css', 'js'], '_')
    // console.log('links', links)
    assets = assets.concat(links);
})

const extendOptionsConfigurationFile = {
    entry: assets
}



//Core.options();

module.exports = extendOptionsConfigurationFile