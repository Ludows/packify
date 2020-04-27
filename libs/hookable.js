import Hookable from 'hookable'

import { typeOf, makeError } from '@ludoows/packify/helpers';
export default class PackifyHooks extends Hookable {
    constructor() {
        // Call to parent to initialize
        super()
        // Initialize Hookable with custom logger
        // super(consola)
      }
      async $registrationHooks(hooksToRegister) {
        let Keys = Object.keys(hooksToRegister);

        if(Keys.length > 0) {
          let allPromises = Keys.map(async (key) => { return await registrationHooksHandler(key, hooksToRegister[key]); })

          let res = await Promise.all( allPromises );
          return res;
        }
        else {
          return [];
        }
      }
      async $registrationHooksHandler(hookName, handler) {
        if(typeOf(handler) != 'function') {
            makeError('handler must be a function. Handler received : '+typeOf(handler))
            process.exit();
        }
        this.hook(hookName, async () => {
            await handler()
        })
        this.hook(hookName, handler);

        return hookName+' registered';
      }
}

