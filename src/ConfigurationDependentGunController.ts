import * as vscode from 'vscode';
import GunController from './GunController';
import ConfigurationProvider from './ConfigurationProvider';

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