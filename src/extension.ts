'use strict';

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    const gunControllers : GunController[] = [
        new IntelliSenseGunController(vscode.workspace.getConfiguration())
    ]

    let gunsOff = vscode.commands.registerCommand('withoutGuns.gunsOff', () => {
        vscode.window.showInformationMessage('We just took your guns. That\'s for your own good.');
        gunControllers.forEach(gunController => gunController.takeTheGun());
    });

    let gunsOn = vscode.commands.registerCommand('withoutGuns.gunsOn', () => {
        vscode.window.showInformationMessage('You got your guns back. Be careful what you do with them.');
        gunControllers.forEach(gunController => gunController.giveTheGunBack());
    });

   context.subscriptions.push(gunsOff);
   context.subscriptions.push(gunsOn);
}

/**
 *  Controlls a single gun.
 * 
 *  If a gun controller needs to manipulate VS Code settings in order to achieve the control
 *  it should do the following:
 *  - Store the current VS Code settings each time when taking the gun.
 *  - The settings are stored in a private field called "initialSettings".
 *  - Restore the settings when giving the gun back.
 */
interface GunController {
    /** True if the gun is currently taken. We assume that the gun is initially never taken. */
    isGunTaken : boolean;
    takeTheGun();
    giveTheGunBack();
}

class IntelliSenseGunController implements GunController {
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