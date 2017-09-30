import * as vscode from 'vscode';

export default interface ConfigurationProvider {
    getConfiguration() : vscode.WorkspaceConfiguration;
}