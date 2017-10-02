'use strict';

import * as vscode from 'vscode';
import * as gcons from "./AllGunControllers";

export function activate(context: vscode.ExtensionContext) {
    const gunControllers : gcons.GunController[] = [
        new gcons.IntelliSenseGunController(vscode.workspace),
        new gcons.CodeLensGunController(vscode.workspace),
        new gcons.SyntaxHighlightingGunController(vscode.workspace)
    ]

    let gunsOff = vscode.commands.registerCommand('withoutGuns.gunsOff', () => {
        gunControllers.forEach(gunController => gunController.takeTheGun());
    });

    let gunsOn = vscode.commands.registerCommand('withoutGuns.gunsOn', () => {
        gunControllers.forEach(gunController => gunController.giveTheGunBack());
    });

   context.subscriptions.push(gunsOff);
   context.subscriptions.push(gunsOn);
}