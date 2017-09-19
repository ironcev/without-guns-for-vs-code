'use strict'; 

import * as vscode from 'vscode'; 

export function activate(context: vscode.ExtensionContext) { 
   console.log('Congratulations, your extension "without-guns" is now active!'); 

   let disposable = vscode.commands.registerCommand('withoutGuns.gunsOff', () => { 
       vscode.window.showInformationMessage('Your guns are turned off ;-)'); 
   }); 

   context.subscriptions.push(disposable); 
}