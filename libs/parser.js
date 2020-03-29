const { requireFile } = require('./helpers');

class ParserAbstract {
     constructor(name, opts) {
         this._parser = requireFile(name);
         this.options = opts;
         this.dependencies = []
     }
     getParser() {
         return this._parser;
     }
     getOptions() {
         return this.options;
     }
     getAst() {
        let parser = this.getParser();
        let ast = parser.parse(content, this.getOptions())

        return ast;
    }
}

module.exports = ParserAbstract;