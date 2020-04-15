const translator = {
    predictedFolders: {
        js: ['js', 'tsx', 'jsx', 'ts'],
        css: ['css', 'sass', 'less', 'stylus', 'scss']
    },
    extensions: {
        js: 'js',
        scss: 'css',
        sass : 'css',
        less: 'css',
        stylus: 'css',
        ts: 'js',
        jsx: 'js'
    },
    needChange: {
        js: false,
        scss: true,
        sass : true,
        less: true,
        stylus: true,
        ts: true,
        jsx: true
    }  
}

module.exports = translator;