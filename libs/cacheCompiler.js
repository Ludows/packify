class CacheCompiler {
    constructor() {
        this.cache = {};
    }
    get(key) {
        return this.cache[key];
    }
    set(key, value) {
        this.cache[key] = value;
        return this;
    }
    isCached(key) {
        let ret = false;
        if(this.cache[key] != undefined) {
            ret = true;
        }
        return ret;
    }
}

module.exports = CacheCompiler;