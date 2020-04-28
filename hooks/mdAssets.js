

async function MdAssetFunction(...args) {
    console.log('MdAssetFunction')
    console.log('MdAssetFunction ...args', ...args[0])
}
module.exports = MdAssetFunction;