import GunController from './GunController';
import ConfigurationProvider from './ConfigurationProvider'

export default class WithoutGunsExtension {
    /** True if the guns are currently taken. We assume that the guns are initially never taken. */
    private areGunsTaken : boolean = false;
    constructor(private readonly gunControllers : GunController[], private readonly configurationProvider : ConfigurationProvider) { }

    takeTheGuns() {
        if (this.areGunsTaken) return;

        this.gunControllers.forEach(gunController => gunController.takeTheGun());
        this.configurationProvider.getConfiguration().update("withoutGuns.internal.areGunsOff", true); // TODO-IG: Introduce a constant for the setting.

        this.areGunsTaken = true;
    }

    giveTheGunsBack() {
        if (!this.areGunsTaken) return;

        this.gunControllers.forEach(gunController => gunController.giveTheGunBack());
        this.configurationProvider.getConfiguration().update("withoutGuns.internal.areGunsOff", undefined);

        this.areGunsTaken = false;
    }
}