import * as vscode from 'vscode';
import ConfigurationProvider from './ConfigurationProvider';
import GunController from './GunController';
import ConfigurationDependentGunController from './ConfigurationDependentGunController';

export default class IntelliSenseGunController extends ConfigurationDependentGunController {
    private initialSettings = (new class {
        private quickSuggestions : any;
        private wordBasedSuggestions : boolean;
        private parameterHints : boolean;
        private suggestOnTriggerCharacters : boolean;

        store(configuration : vscode.WorkspaceConfiguration) {
            this.quickSuggestions = configuration.get("editor.quickSuggestions");
            this.wordBasedSuggestions = configuration.get("editor.wordBasedSuggestions");
            this.parameterHints = configuration.get("editor.parameterHints");
            this.suggestOnTriggerCharacters = configuration.get("editor.suggestOnTriggerCharacters");    
        }

        restore(configuration : vscode.WorkspaceConfiguration) {
            configuration.update("editor.quickSuggestions", this.quickSuggestions);
            configuration.update("editor.wordBasedSuggestions", this.wordBasedSuggestions);
            configuration.update("editor.parameterHints", this.parameterHints);
            configuration.update("editor.suggestOnTriggerCharacters", this.suggestOnTriggerCharacters);   
        }
    })

    constructor(configurationProvider: ConfigurationProvider) {
        super(configurationProvider);
    }

    takeTheGunWithConfigurationCore(configuration : vscode.WorkspaceConfiguration) {
        this.initialSettings.store(configuration);

        configuration.update("editor.quickSuggestions", {other: false, comments: false, strings: false});
        configuration.update("editor.wordBasedSuggestions", false);
        configuration.update("editor.parameterHints", false);
        configuration.update("editor.suggestOnTriggerCharacters", false);
    }

    giveTheGunBackWithConfigurationCore(configuration : vscode.WorkspaceConfiguration) {
        this.initialSettings.restore(configuration);
    }
}