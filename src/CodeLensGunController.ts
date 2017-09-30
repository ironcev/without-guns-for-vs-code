import * as vscode from 'vscode';
import ConfigurationProvider from './ConfigurationProvider';
import ConfigurationDependentGunController from './ConfigurationDependentGunController';

export default class CodeLensGunController extends ConfigurationDependentGunController {
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
        super(configurationProvider);
    }

    takeTheGunWithConfigurationCore(configuration : vscode.WorkspaceConfiguration) {
        this.initialSettings.store(configuration);

        configuration.update("editor.codeLens", false);
    }

    giveTheGunBackWithConfigurationCore(configuration : vscode.WorkspaceConfiguration) {
        this.initialSettings.restore(configuration);
    }
}