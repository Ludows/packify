class CacheCompiler {
    constructor() {
        this.stack = {};
    }
    get(key) {
        return this.stack[key];
    }
    set(key, value) {
        this.stack[key] = value;
        return this;
    }
    isCached(key) {
        let ret = false;
        if(this.stack[key] != undefined) {
            ret = true;
        }
        return ret;
    }
}

module.exports = CacheCompiler;