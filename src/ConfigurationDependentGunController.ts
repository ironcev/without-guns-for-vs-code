import * as vscode from 'vscode';
import GunController from './GunController';
import ConfigurationProvider from './ConfigurationProvider';

/**
 *  A gun controller that implements its behavior by modifying the Workspace Configuration.
 * 
 *  If a gun controller needs to manipulate VS Code settings (Workspace Configuration)
 *  in order to achieve the control, then it should do the following:
 *  - Store the current VS Code settings each time when taking the gun.
 *  - The settings are stored in a private field called "initialSettings".
 *  - Restore the settings when giving the gun back.
 */
export default abstract class ConfigurationDependentGunController extends GunController {
    constructor(private readonly configurationProvider : ConfigurationProvider) {
        super();
    }

    takeTheGunCore() {
        let configuration = this.configurationProvider.getConfiguration();
        this.takeTheGunWithConfigurationCore(configuration);
    }

    giveTheGunBackCore() {
        let configuration = this.configurationProvider.getConfiguration();
        this.giveTheGunBackWithConfigurationCore(configuration);
    }

    protected abstract takeTheGunWithConfigurationCore(configuration : vscode.WorkspaceConfiguration) : void;
    protected abstract giveTheGunBackWithConfigurationCore(configuration : vscode.WorkspaceConfiguration) : void;
}