const fs = require('fs');

async function MdAssetFunction(...args) {
    // console.log('MdAssetFunction')
    // console.log('MdAssetFunction ...args', ...args[0])

    const {
        getPath,
        existFileSync,
        parseFile,
        getFileType,
        getFileName
    } = require('@ludoows/packify/libs/helpers');

    // let results = args[0];
    let compiler = args[1];

    // console.log('prout')
    let packifyManifest = getPath('public', 'packify-manifest.json');

    let packifyJson = await parseFile(packifyManifest);
    // console.log('mixJson', mixJson)

    let MDAssetsJson = {};

    let packifyJsonKeys = Object.keys(packifyJson);

    packifyJsonKeys.forEach((key) => {
        // console.log(path.dirname(key))

        let fileType = getFileType(key);
        let fileName = getFileName(key);

        fileName = fileName.replace('.'+fileType, '');

        if(fileName.indexOf('.min') > - 1) {
            // ca existe et on s'en bat la bite des .min
            fileName = fileName.replace('.min', '');
        }

        // console.log('fileType', fileType)

        // C'est complètement débile de faire le process pour des fichiers maps. Ces fichiers sont appelés a la fin de la feuille de style générée.
        if(fileType != 'map') {
            let getTypeFolderConfiguration = getTypeFolderConfigurationFunction(key);
            // console.log('getTypeFolderConfiguration', getTypeFolderConfiguration)
            let bindingKey = undefined;

            if(getTypeFolderConfiguration != null) {
                bindingKey = getTypeFolderConfiguration+'.'+fileType+'.'+fileName
            }
            else {
                bindingKey = fileType+'.'+fileName
            }
            
            MDAssetsJson[bindingKey] = {
                "file" : key,
                "hash": getHash(packifyJson[key])
            }
        }
    })

    let destPathMDAsset = getPath(compiler.options.output.folder , 'mdassets-autoload.json');

    if(existFileSync(destPathMDAsset)) {
        // on retire le fichier
        fs.unlinkSync(destPathMDAsset);
        //on recrée le fichier
        fs.writeFileSync(destPathMDAsset, JSON.stringify(MDAssetsJson, null, 2));
    }
    else {
        fs.writeFileSync(destPathMDAsset, JSON.stringify(MDAssetsJson, null, 2));
    }

}

function getHash(str) {
    let strSpl = str.split('?id=');
    return strSpl[strSpl.length - 1];
}
function getTypeFolderConfigurationFunction(file) {
    let ret = null;
    if(file.indexOf('/common/') > -1) {
        ret = 'common';
    }

    if(file.indexOf('/front/') > -1) {
        ret = 'front';
    }

    if(file.indexOf('/back/') > -1) {
        ret = 'back';
    }

    return ret;
}


module.exports = MdAssetFunction;