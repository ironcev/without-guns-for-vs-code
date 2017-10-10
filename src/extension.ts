import * as vscode from 'vscode';
import * as gcons from "./AllGunControllers";
import WithoutGunsExtension from './WithoutGunsExtension';

export function activate(context: vscode.ExtensionContext) {
    const gunControllers : gcons.GunController[] = [
        new gcons.IntelliSenseGunController(vscode.workspace),
        new gcons.CodeLensGunController(vscode.workspace),
        new gcons.SyntaxHighlightingGunController(vscode.workspace)
    ]

    const host = (new class {
        isFolderOpen = () => vscode.workspace.workspaceFolders != undefined;
        showInformationMessage = (message : string) => vscode.window.showInformationMessage(message);
    });

    let withoutGunsExtension = new WithoutGunsExtension(gunControllers, vscode.workspace, host);

    let takeTheGuns = vscode.commands.registerCommand('withoutGuns.takeTheGuns', () => {
        withoutGunsExtension.takeTheGuns();
    });

    let giveTheGunsBack = vscode.commands.registerCommand('withoutGuns.giveTheGunsBack', () => {
        withoutGunsExtension.giveTheGunsBack();
    });

    context.subscriptions.push(takeTheGuns, giveTheGunsBack);
}