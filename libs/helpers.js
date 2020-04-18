const merge = require('deepmerge');
const path = require('path');
const fs = require('fs');
const events = require('events');
const eventEmitter = new events.EventEmitter();
const PrettyError = require('pretty-error');
const pe = new PrettyError();
const resolve = require('resolve');

const basePackifyConfig = require('../configs/packify');

function mergeConfig(opts) {
    return merge(basePackifyConfig, opts);
}

function mergeObjects(obj1, obj2) {
    return merge(obj1, obj2);
}

function getPath(...args) {
    return path.join(getBasePath(), ...args);
}

function typeOf(...args) {
    return ({}).toString.call(...args).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
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
    let bufferFile = null;
    
    try {
        bufferFile = await fs.readFile(args[0])
    } catch (error) {
        makeError(' Le fichier suivant ne peut pas être parsé. '+ args[0] +' ');
        process.exit();
    }
    
    return JSON.parse(bufferFile);
}

function parseFileSync(...args) {
    return JSON.parse(fs.readFileSync(args[0]));
}

function requireFile(...args) {
    return require(args[0]);
}

function makeError(...args) {
    var renderedError = pe.render(new Error(...args));
    pe.start();
    // console.log(renderedError);
}

async function moduleResolver(...args) {
    // console.log('...args name', args[0])
    // console.log('...args obj', args[1])
    let res;
    switch (args[0]) {
        case 'moduleName':
        case 'moduleAbsoluteResolution':
            res = await resolve(args[1].relativePath, { basedir: getPath('node_modules') })
            // console.log('res', res)
            break;
        case 'dependencyAbsoluteResolution':
        case 'dependencyRelativeResolution':
            res = await resolve(args[1].relativePath, { basedir: args[1].dirname })
            // console.log('res', res)
            break;
    
        default:
            break;
    }
    return res;
}

function typeOfModule(string) {
    // checker si on a un alias de caché dans la chaine de caractère
    // on checke d'abord si c'est une dependency
    // on checke si on a un lien relatif ou pas
    let typedModule = null;
    let wasDeterminated = false;

    if(string.indexOf(path.sep) === -1 && !wasDeterminated) {
        typedModule = "moduleName";
        wasDeterminated = true;
    }

    let pathCheck = path.isAbsolute(string);

    // console.log('pathCheck', pathCheck)

    if(pathCheck == true && !wasDeterminated) {
        // console.log('pathCheck', pathCheck)

        let checkingPresenceOfPackagename = string.split(path.sep);

        // console.log('checkingPresenceOfPackagename', checkingPresenceOfPackagename)

        let canBePathModule = getPath('node_modules', checkingPresenceOfPackagename[0]);
        // console.log('canBePathModule', canBePathModule)

        let thePathCheck = existFileSync(canBePathModule);

        // console.log('thePathCheck', thePathCheck)

        // si ca existe c'est une resolution a un module a faire..
        if(thePathCheck && !wasDeterminated) {
            typedModule = "moduleAbsoluteResolution";
            wasDeterminated = true;
        }
        else {
            if(!wasDeterminated) {
                typedModule = "dependencyAbsoluteResolution";
                wasDeterminated = true;
            }
        }

    }
    else {
        if(!wasDeterminated) {
            typedModule = "dependencyRelativeResolution";
            wasDeterminated = true;
        }
    }

    // console.log('typedModule', typedModule)

    return typedModule;
    

}

function walker(dir, filelist, recursive = true, extensions = [], excludePattern = '') {
    var fs = fs || require('fs'),
        files = fs.existsSync(dir) ? fs.readdirSync(dir) : [],
        filelist = filelist || [];
    files.forEach(function (file) {
        if (recursive != undefined && recursive) {
            if (fs.statSync(path.join(dir, file)).isDirectory()) {
                filelist = walker(path.join(dir, file), filelist, recursive, extensions, excludePattern);
            } else {
                let extname = path.extname(file).substr(1);
                // console.log('file ?', file)
                // console.log('file.charAt(0)', file.charAt(0))
                if (extensions.indexOf(extname) > -1 && extensions.length > 0) {
                    if(excludePattern.length > 0 && file.charAt(0) != excludePattern) {
                        filelist.push(path.join(dir, file));
                    }
                    else if(excludePattern.length === 0) {
                        filelist.push(path.join(dir, file));
                    }
                }
            }
        } else {
            var full_path = path.join(dir, file);
            let extname = path.extname(file).substr(1);
            if (extensions.indexOf(extname) > -1 && extensions.length > 0) {
                if(excludePattern.length > 0 && file.charAt(0) != excludePattern) {
                    filelist.push(path.join(dir, file));
                }
                else if(excludePattern.length === 0) {
                    filelist.push(path.join(dir, file));
                }
            }
        }

    });
    return filelist;
}

function unique(array) {
    return array.filter((x, i, a) => a.indexOf(x) == i)
}

function readFileSync(url) {
    return fs.readFileSync(url, 'utf-8');
}

async function readFile(url) {
    try {
      return await fs.readFile(url, 'utf-8'); 
    } catch (error) {
        makeError('Could not resolve your file');
        process.exit();
    }
    
}

function getFileType(...args) {
    return path.extname(...args).substr(1);
}

function existFileSync(...args) {
    return fs.existsSync(...args);
}

function writeFileSync(...args) {
    return fs.writeFileSync(...args)
}

function getFileName(...args) {
    return path.basename(...args)
}

function getDirectory(...args) {
    return path.dirname(...args)
}

async function getListingDir(pathFile, FileTypesOpt = false) {
    try {
        return fs.readdir(pathFile, {withFileTypes: FileTypesOpt});
    } catch (error) {
        makeError(error.message);
        process.exit();
    }
    
}

function haveSeparator(...args) {
    return args.indexOf(path.sep);
}

function isRelativePath(...args) {
    return path.isAbsolute(...args);
}

function createReadStream(...args) {
    return fs.createReadStream(...args);
}

function createWriteStream(...args) {
    return fs.createWriteStream(...args);
}

function getExtendOption() {
    let filePackifyExist = fs.existsSync(getPath('packify.config.js'))
    // console.log('getPath', getPath('packify.config.js'))
    // console.log('filePackifyExist', filePackifyExist)
    // console.log('filePackifyExist Compare', fs.existsSync(getPath('node_modules', '@ludoows', 'packify', 'configs', 'packify.config.js')))
    let file = undefined;
    // si le user veut custom la config. Son fichier sera pris en compte.
    // sinon c'est ma configuration qui prendra le relais
    if(filePackifyExist) {
        file = getPath('packify.config.js');
    }
    else {
        file = getPath('node_modules', '@ludoows', 'packify', 'configs', 'packify.config.js');
    }

    let result = require(file)
    // console.log('result', result);

    return result;
}

module.exports = {
    parseFileSync,
    moduleResolver,
    haveSeparator,
    createReadStream,
    createWriteStream,
    writeFileSync,
    existFileSync,
    mergeConfig,
    mergeObjects,
    getPath,
    getBasePath,
    formatPath,
    getEventManager,
    parseFile, 
    requireFile,
    makeError,
    typeOf,
    walker,
    getFileType,
    getFileName,
    getDirectory,
    unique,
    getListingDir,
    readFile,
    readFileSync,
    getExtendOption,
    isRelativePath,
    typeOfModule
}