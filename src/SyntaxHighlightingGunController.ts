import * as vscode from 'vscode';
import * as json from 'load-json-file';
import ConfigurationDependentGunController from './ConfigurationDependentGunController';
import ConfigurationProvider from './ConfigurationProvider';
import path = require('path');


export default class SyntaxHighlightingGunController extends ConfigurationDependentGunController {
    private initialSettings = (new class {
        private tokenColorCustomizations : any;

        store(configuration : vscode.WorkspaceConfiguration) {
            this.tokenColorCustomizations = configuration.get("editor.tokenColorCustomizations");
        }

        restore(configuration : vscode.WorkspaceConfiguration) {
            configuration.update("editor.tokenColorCustomizations", this.tokenColorCustomizations);
        }
    })

    constructor(configurationProvider : ConfigurationProvider) {
        super(configurationProvider);
    }

    takeTheGunWithConfigurationCore(configuration : vscode.WorkspaceConfiguration) {
        this.initialSettings.store(configuration);

        let currentThemeId = configuration.get<string>("workbench.colorTheme");
        configuration.update("editor.tokenColorCustomizations", this.createTokenColorCustomizations(currentThemeId));
    }

    giveTheGunBackWithConfigurationCore(configuration : vscode.WorkspaceConfiguration) {
        this.initialSettings.restore(configuration);
    }

    private createTokenColorCustomizations(currentThemeId : string) {
        let editorForegroundColor = this.getEditorForegroundColor(currentThemeId);

        let textMateRules =
            SyntaxHighlightingGunController.getCSharpTokenColorCustomizations()
                .concat(SyntaxHighlightingGunController.getTypescriptTokenColorCustomizations())
                .map(scopeName => ({
                    scope: scopeName,
                    settings: {
                        foreground: editorForegroundColor
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

    private getEditorForegroundColor(currentThemeId : string) {
        // VS Code API does not directly support getting the configuration of
        // the current theme :-(
        // So we need a bit of API acrobatics here.

        // Let's start with a fallback that will be acceptable on both
        // light and dark themes - blue color, hopefully :-)
        // We will use this if anything goes wrong with the resolution
        // of the editor foreground color defined by the theme.
        let fallbackColor = "#0000ff";

        if (!currentThemeId) return fallbackColor; // Should never happen, but let's be paranoic.

        // Luckily, themes are extensions. So we will try to find the
        // extension that corresponds to the current theme.
        let currentThemeExtensionAsArray = vscode.extensions.all
            // Filter only theme extensions.
            .filter(extension => extension.packageJSON.contributes.themes)
            // Combine the extension metadata and the theme configuration. We will need both later.
            .map(extension => extension.packageJSON.contributes.themes.map(theme => ({...theme, extension })))
            // A single theme is actually array of theme because a theme can potentially have variations.
            // E.g. the dark theme comes with several variations: Dark+, Dark Visual Studio, ...
            .reduce((previous, current) => previous.concat(current), Array.of<any>())
            // Get the one for the current theme.
            .filter(theme => theme.id == currentThemeId || theme.label == currentThemeId);
        if (!currentThemeExtensionAsArray) return fallbackColor; // Paranoic again.

        if (currentThemeExtensionAsArray.length < 1) return fallbackColor; // And again...

        let currentThemeExtension = currentThemeExtensionAsArray[0];
        if (!currentThemeExtension) return fallbackColor;

        let extensionPath = currentThemeExtension.extension.extensionPath;
        if (!extensionPath || extensionPath == "") return fallbackColor;

        return this.findEditorForegroundColorRecursively(extensionPath, currentThemeExtension.path, fallbackColor);
    }

    private findEditorForegroundColorRecursively(extensionPath : string, themeRelativePath: string, fallbackColor : string) : string {
        // Within the extension directory we can have several theme definition files which
        // can include each other. We are looking for the value "colors.editor.foreground".
        // If we cannot find it in the current theme definition file, and that theme definition file
        // includes another one, we have to check that one as well, all the way up.
        // BDW, colors are usually defined in some base theme file which is on thr top of the
        // include chain. See the default dark themes as example.

        let themePath = path.join(extensionPath, themeRelativePath);

        let themeConfiguration : any;
        try {
            // I am really scared of this.
            // Reading and parsing JSON from a file on disk :-(
            // Usr rights? A slightly invalid JSON that VS Code tolerates etc.
            // That's why try-catch.
            themeConfiguration = json.sync(themePath);
        } catch {
            return fallbackColor;
        }

        if (!themeConfiguration) return fallbackColor;

        if (!themeConfiguration.colors) {
            // The colors are not specified.
            // That means we most likely have a theme definition file that includes
            // another one.
            if (themeConfiguration.include) {
                // It can be that the initial theme relative path contains subdirectories ;-)
                // So we have to calculate the new extension path because the relative
                // paths of the included themes will not contain that subdirectory ;-)

                return this.findEditorForegroundColorRecursively(path.dirname(themePath), themeConfiguration.include, fallbackColor);
            } else {
                return fallbackColor;
            }
        } else  {
            let color = themeConfiguration.colors["editor.foreground"];
            return color ? color : fallbackColor;
        }
    }
}