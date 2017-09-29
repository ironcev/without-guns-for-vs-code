import * as vscode from 'vscode';
import GunController from './GunController';

export default class CodeLensGunController implements GunController {
    private readonly configuration: vscode.WorkspaceConfiguration;

    isGunTaken: boolean;

    private initialSettings = (new class {
        private codeLens : boolean;

        store(configuration : vscode.WorkspaceConfiguration) {
            this.codeLens = configuration.get("editor.codeLens");
        }

        restore(configuration : vscode.WorkspaceConfiguration) {
            configuration.update("editor.codeLens", this.codeLens);
        }
    })

    constructor(configuration : vscode.WorkspaceConfiguration) {
        this.configuration = configuration;
        this.isGunTaken = false;
    }

    takeTheGun() {
        if (this.isGunTaken) return;

        this.initialSettings.store(this.configuration);

        this.configuration.update("editor.codeLens", false);

        this.isGunTaken = true;
    }

    giveTheGunBack() {
        if (!this.isGunTaken) return;

        this.initialSettings.restore(this.configuration);

        this.isGunTaken = false;
    }
}