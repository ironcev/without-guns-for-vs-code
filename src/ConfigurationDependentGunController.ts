import { WorkspaceConfiguration } from 'vscode';
import GunController from './GunController';
import ConfigurationProvider from './ConfigurationProvider';

/**
 * A gun controller that implements its behavior by modifying the Workspace Configuration.
 *
 * The configuration settings that have to be changed are provided via constructor's
 * "gunlessSettings" parameter. In a rare case when the gunless settings are not hardcoded but
 * have to be calculated at run-time, the "getGunlessSettings()" method should be overriden
 * to return the gunless settings. This method will be called only once, the first time when
 * the Guns are turned OFF.
 */
export default abstract class ConfigurationDependentGunController extends GunController {
    /**
     * The settings that had been configured in the workspace settings before
     * the gunless settings were applied.
     */
    private initialSettings : any;

    constructor(private readonly configurationProvider : ConfigurationProvider, private gunlessSettings : any | undefined) {
        super();
    }

    protected takeTheGunCore() {
        let configuration = this.configurationProvider.getConfiguration();

        if (this.gunlessSettings == undefined)
            this.gunlessSettings = this.getGunlessSettings(configuration);

        this.storeInitialSettings(configuration);
        this.applyGunlessSettings(configuration);
    }

    protected giveTheGunBackCore() {
        let configuration = this.configurationProvider.getConfiguration();
        this.restoreInitialSettings(configuration);
    }

    protected storeInitialSettings(configuration: WorkspaceConfiguration) {
        this.initialSettings = {};
        for (var property in this.gunlessSettings) {
            this.initialSettings[property] = this.getWorkspaceValueForSetting(property, configuration);
        }
    }

    private getWorkspaceValueForSetting(setting : string, configuration: WorkspaceConfiguration) {
        const allConfiguration = configuration.inspect(setting);
        if (allConfiguration == undefined) return undefined;
        return allConfiguration.workspaceValue;
    }

    protected applyGunlessSettings(configuration: WorkspaceConfiguration) {
        for (var property in this.gunlessSettings) {
            configuration.update(property, this.gunlessSettings[property]);
        }
    }

    protected restoreInitialSettings(configuration: WorkspaceConfiguration) {
        for (var property in this.gunlessSettings) {
            configuration.update(property, this.initialSettings[property]);
        }
        this.initialSettings = undefined;
    }

    protected getGunlessSettings(configuration : WorkspaceConfiguration) : any { return undefined; }
}