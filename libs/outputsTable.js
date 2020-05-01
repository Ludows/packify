const Table = require('tty-table')

class OutputTable {
    constructor(...args) {
        this.Compiler = args[0];
        this.tableRendering = this.make(args[1]);
    }
    make(results) {
        let header = [];
        let headers_table = [
          "Source File",
          "Output file",
          "Hash"
        ]
  
        for (let index = 0; index < headers_table.length; index++) {
          const type = headers_table[index];
  
          if(type.toLowerCase() === "hash" && !this.Compiler.options.output.hash) {
            break;
          }
          header.push({
            value: type,
            headerColor: "green",
            width: this.Compiler.options.output.hash ? "33%" : "50%"
          })
  
        }
  
        const options = {
          headerAlign: "left",
          align: "left",
          color: "green",
          truncate: false,
          width: "100%",
          compact: false,
          borderColor: 'green'
        }
  
        let rows = []
        
        results.forEach((result) => {
          let line_row = [];
          let keysResult = Object.keys(result);
          
          keysResult.forEach((key) => {
            line_row.push(result[key]);
          })
          
          rows.push(line_row);
        })

        return {
            header,
            rows,
            options
        }
      
    }
    async render() {
        var end = Date.now();
        const out = Table(
            this.tableRendering.header,
            this.tableRendering.rows,
            this.tableRendering.options
        ).render();
        
        console.log('Process executed in '+ ( end - this.Compiler.Start ) +' ms')
        console.log(out)
    }
}
module.exports = OutputTable;