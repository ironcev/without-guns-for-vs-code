import * as vscode from 'vscode';
import GunController from './GunController';

export default class SyntaxHighlightingGunController implements GunController {
    private readonly configuration: vscode.WorkspaceConfiguration;
    private readonly tokenColorCustomizations : any;

    isGunTaken: boolean;

    private initialSettings = (new class {
        private tokenColorCustomizations : any;

        store(configuration : vscode.WorkspaceConfiguration) {
            this.tokenColorCustomizations = configuration.get("editor.tokenColorCustomizations");
        }

        restore(configuration : vscode.WorkspaceConfiguration) {
            configuration.update("editor.tokenColorCustomizations", this.tokenColorCustomizations);
        }
    })

    constructor(configuration : vscode.WorkspaceConfiguration) {
        this.configuration = configuration;
        this.isGunTaken = false;
        this.tokenColorCustomizations = SyntaxHighlightingGunController.createTokenColorCustomizations();
    }

    takeTheGun() {
        if (this.isGunTaken) return;

        this.initialSettings.store(this.configuration);

        this.configuration.update("editor.tokenColorCustomizations", this.tokenColorCustomizations);

        this.isGunTaken = true;
    }

    giveTheGunBack() {
        if (!this.isGunTaken) return;

        this.initialSettings.restore(this.configuration);

        this.isGunTaken = false;
    }

    private static createTokenColorCustomizations() {
        let editorForegroundColor = this.getEditorForegroundColor();

        let textMateRules =
            SyntaxHighlightingGunController.getCSharpTokenColorCustomizations()
                .concat(SyntaxHighlightingGunController.getTypescriptTokenColorCustomizations())
                .map(scopeName => ({
                    scope: scopeName,
                    settings: {
                        foreground: "#FFFFFF"
                    }
                }));

        return {
            comments : editorForegroundColor,
            functions : editorForegroundColor,
            keywords : editorForegroundColor,
            numbers : editorForegroundColor,
            strings: editorForegroundColor,
            types : editorForegroundColor,
            variables : editorForegroundColor,
            textMateRules : textMateRules
        };
    }

    // TODO-IG: Make these token customizations configurable.
    // Or even better, is it possible to get them dynamically in the extension itself?
    private static getCSharpTokenColorCustomizations() {
        return [
            "storage.modifier", // E.g. public.
            "constant.language" // E.g. null.
        ]
    }

    private static getTypescriptTokenColorCustomizations() {
        return [
            "keyword.control", // E.g. import.
            "storage.type", // E.g. class.
            "support.type.primitive", // E.g. boolean.
            "meta.object-literal.key", // E.g. { literalKey : value }.
            "entity.other.inherited-class" // E.g. Class implements InheritedClass.
        ]
    }

    private static getEditorForegroundColor() {
        return "#FFFFFF"; // TODO-IG: Find a way to get it from the current theme.
    }
}