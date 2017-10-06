import ConfigurationProvider from './ConfigurationProvider';
import ConfigurationDependentGunController from './ConfigurationDependentGunController';

export default class IntelliSenseGunController extends ConfigurationDependentGunController {
    constructor(configurationProvider: ConfigurationProvider) {
        super(configurationProvider,
            {
                "editor.quickSuggestions": {other: false, comments: false, strings: false},
                "editor.wordBasedSuggestions": false,
                "editor.parameterHints": false,
                "editor.suggestOnTriggerCharacters": false
            });
    }
}