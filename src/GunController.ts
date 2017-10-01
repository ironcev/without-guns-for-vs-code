/**
 *  Controlls a single gun.
 */
export default abstract class GunController {
    /** True if the gun is currently taken. We assume that the gun is initially never taken. */
    private isGunTaken : boolean = false;
    takeTheGun() {
        if (this.isGunTaken) return;
        this.takeTheGunCore();
        this.isGunTaken = true;
    }

    giveTheGunBack() {
        if (!this.isGunTaken) return;
        this.giveTheGunBackCore();
        this.isGunTaken = false;
    }

    protected abstract takeTheGunCore() : void;
    protected abstract giveTheGunBackCore() : void;
}