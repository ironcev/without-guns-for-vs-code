/**
 *  Controlls a single gun.
 * 
 *  If a gun controller needs to manipulate VS Code settings in order to achieve the control
 *  it should do the following:
 *  - Store the current VS Code settings each time when taking the gun.
 *  - The settings are stored in a private field called "initialSettings".
 *  - Restore the settings when giving the gun back.
 */
export default interface GunController {
    /** True if the gun is currently taken. We assume that the gun is initially never taken. */
    isGunTaken : boolean;
    takeTheGun();
    giveTheGunBack();
}