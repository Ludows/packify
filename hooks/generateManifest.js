const {
    getPath,
    formatPath,
    existFileSync
} = require('@ludoows/packify/libs/helpers');

const fs = require('fs');

async function generateManifestFunction(...args) {
    // console.log('generateManifestFunction')
    // console.log('generateManifestFunction ...args', ...args[0])
    let results = args[0];
    let compiler = args[1];

    let json = {};

    let outputPath = getPath(compiler.options.output.folder);

    results.forEach((result) => {

        let strKey = result.compiled.replace(outputPath, '');

        json[strKey] += strKey + '?id=' + result.hash;

    })

    let destPathManifest = formatPath(outputPath, 'packify-manifest.json');

    if (existFileSync(destPathManifest)) {
        // on retire le fichier
        fs.unlinkSync(destPathManifest);
        //on recrée le fichier
        fs.writeFileSync(destPathManifest, JSON.stringify(json, null, 2));
    } else {
        fs.writeFileSync(destPathManifest, JSON.stringify(json, null, 2));
    }

}
module.exports = generateManifestFunction;