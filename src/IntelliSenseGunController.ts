import * as vscode from 'vscode';
import GunController from './GunController';

export default class IntelliSenseGunController implements GunController {
    private readonly configuration: vscode.WorkspaceConfiguration;

    isGunTaken: boolean;

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

    constructor(configuration : vscode.WorkspaceConfiguration) {
        this.configuration = configuration;
        this.isGunTaken = false;
    }

    takeTheGun() {
        if (this.isGunTaken) return;

        this.initialSettings.store(this.configuration);

        this.configuration.update("editor.quickSuggestions", {other: false, comments: false, strings: false});
        this.configuration.update("editor.wordBasedSuggestions", false);
        this.configuration.update("editor.parameterHints", false);
        this.configuration.update("editor.suggestOnTriggerCharacters", false);

        this.isGunTaken = true;
    }

    giveTheGunBack() {
        if (!this.isGunTaken) return;

        this.initialSettings.restore(this.configuration);

        this.isGunTaken = false;
    }
}