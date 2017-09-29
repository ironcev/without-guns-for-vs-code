'use strict';

import * as vscode from 'vscode';
import * as gcons from "./AllGunControllers";

export function activate(context: vscode.ExtensionContext) {
    const gunControllers : gcons.GunController[] = [
        new gcons.IntelliSenseGunController(vscode.workspace.getConfiguration())
    ]

    let gunsOff = vscode.commands.registerCommand('withoutGuns.gunsOff', () => {
        vscode.window.showInformationMessage('We just took your guns. That\'s for your own good.');
        gunControllers.forEach(gunController => gunController.takeTheGun());
    });

    let gunsOn = vscode.commands.registerCommand('withoutGuns.gunsOn', () => {
        vscode.window.showInformationMessage('You got your guns back. Be careful what you do with them.');
        gunControllers.forEach(gunController => gunController.giveTheGunBack());
    });

   context.subscriptions.push(gunsOff);
   context.subscriptions.push(gunsOn);
}