import * as vscode from 'vscode';
import ConfigurationProvider from './ConfigurationProvider';
import GunController from './GunController';

export default class CodeLensGunController extends GunController {
    private readonly configurationProvider: ConfigurationProvider;

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
        super();
        this.configurationProvider = configurationProvider;
    }

    takeTheGunCore() {
        let configuration = this.configurationProvider.getConfiguration();
        this.initialSettings.store(configuration);

        configuration.update("editor.codeLens", false);
    }

    giveTheGunBackCore() {
        let configuration = this.configurationProvider.getConfiguration();
        this.initialSettings.restore(configuration);
    }
}