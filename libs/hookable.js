const Hookable = require('hookable/dist/hookable');

console.log('Hookable', Hookable)

const { makeError, typeOf } = require('@ludoows/packify/libs/helpers')

class PackifyHooks extends Hookable {
    constructor() {
        // Call to parent to initialize
        super()
        // Initialize Hookable with custom logger
        // super(consola)
      }
      async $registrationHooks(hooksToRegister) {
        let Keys = Object.keys(hooksToRegister);

        if(Keys.length > 0) {
          this.addHooks(hooksToRegister);
          return hooksToRegister;
        }
        else {
          return {};
        }
      }

}

module.exports = PackifyHooks;

