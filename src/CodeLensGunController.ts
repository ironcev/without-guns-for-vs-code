import * as vscode from 'vscode';
import ConfigurationProvider from './ConfigurationProvider';
import GunController from './GunController';

export default class CodeLensGunController implements GunController {
    private readonly configurationProvider: ConfigurationProvider;

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

    constructor(configurationProvider: ConfigurationProvider) {
        this.configurationProvider = configurationProvider;
        this.isGunTaken = false;
    }

    takeTheGun() {
        if (this.isGunTaken) return;

        let configuration = this.configurationProvider.getConfiguration();
        this.initialSettings.store(configuration);

        configuration.update("editor.codeLens", false);

        this.isGunTaken = true;
    }

    giveTheGunBack() {
        if (!this.isGunTaken) return;

        let configuration = this.configurationProvider.getConfiguration();
        this.initialSettings.restore(configuration);

        this.isGunTaken = false;
    }
}