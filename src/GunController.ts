/**
 *  Controlls a single gun.
 * 
 *  If a gun controller needs to manipulate VS Code settings in order to achieve the control
 *  it should do the following:
 *  - Store the current VS Code settings each time when taking the gun.
 *  - The settings are stored in a private field called "initialSettings".
 *  - Restore the settings when giving the gun back.
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