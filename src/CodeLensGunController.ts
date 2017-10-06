import ConfigurationProvider from './ConfigurationProvider';
import ConfigurationDependentGunController from './ConfigurationDependentGunController';

export default class CodeLensGunController extends ConfigurationDependentGunController {
    constructor(configurationProvider: ConfigurationProvider) {
        super(configurationProvider,
            { 
                "editor.codeLens" : false
            });
    }
}