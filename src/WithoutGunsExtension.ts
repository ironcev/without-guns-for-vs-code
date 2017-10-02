import GunController from './GunController';

export default class WithoutGunsExtension {
    constructor(private readonly gunControllers : GunController[]) { }

    takeTheGuns() {
        this.gunControllers.forEach(gunController => gunController.takeTheGun());
    }

    giveTheGunsBack() {
        this.gunControllers.forEach(gunController => gunController.giveTheGunBack());
    }
}