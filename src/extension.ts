import * as vscode from 'vscode';
import * as gcons from "./AllGunControllers";
import WithoutGunsExtension from './WithoutGunsExtension';

export function activate(context: vscode.ExtensionContext) {
    const gunControllers : gcons.GunController[] = [
        new gcons.IntelliSenseGunController(vscode.workspace),
        new gcons.CodeLensGunController(vscode.workspace),
        new gcons.SyntaxHighlightingGunController(vscode.workspace)
    ]

    let withoutGunsExtension = new WithoutGunsExtension(gunControllers, vscode.workspace);

    let gunsOff = vscode.commands.registerCommand('withoutGuns.gunsOff', () => {
        withoutGunsExtension.takeTheGuns();
    });

    let gunsOn = vscode.commands.registerCommand('withoutGuns.gunsOn', () => {
        withoutGunsExtension.giveTheGunsBack();
    });

   context.subscriptions.push(gunsOff, gunsOn);
}