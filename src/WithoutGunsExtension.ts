import GunController from './GunController';
import ConfigurationProvider from './ConfigurationProvider'

const ARE_GUNS_TAKEN_SETTING = "_withoutGuns.internal.areGunsTaken"

export default class WithoutGunsExtension {
    /** True if the guns are currently taken. We assume that the guns are initially never taken. */
    private areGunsTaken : boolean = false;
    constructor(
        private readonly gunControllers : GunController[],
        private readonly configurationProvider : ConfigurationProvider,
        private readonly host : { isFolderOpen() : boolean, showInformationMessage(message:string) : void }
    ) { }

    takeTheGuns() {
        if (!this.host.isFolderOpen()) {
            this.host.showInformationMessage("Guns can be taken only if there is a folder open in the workspace.");
            return;
        }

        this.gunControllers.forEach(gunController => gunController.takeTheGun());
        this.configurationProvider.getConfiguration().update(ARE_GUNS_TAKEN_SETTING, true);

        this.areGunsTaken = true;
    }

    giveTheGunsBack() {
        if (!this.areGunsTaken) return;

        this.gunControllers.forEach(gunController => gunController.giveTheGunBack());
        this.configurationProvider.getConfiguration().update(ARE_GUNS_TAKEN_SETTING, undefined);

        this.areGunsTaken = false;
    }
}