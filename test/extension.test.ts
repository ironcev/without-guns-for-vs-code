import * as assert from 'assert';
import * as vscode from 'vscode';
import * as myExtension from '../src/extension';
import * as json from 'load-json-file';
import path = require('path');

/** Generates useful data. */
suite("Data Generator", () => {
    /** 
     * Generates TextMate Scopes based on the scopes that are used in the theme definitions used in the
     * VS Code at the time of runing the test.
     */
    test("TextMate Scopes", () => {
        let allScopes = vscode.extensions.all
        // Filter only the theme extensions.
        .filter(extension => extension.packageJSON.contributes.themes)
        // Combine the extension metadata and the theme configuration. We will need both later.
        .map(extension => extension.packageJSON.contributes.themes.map(theme => ({...theme, extension })))
        // A single theme is actually array of theme because a theme can potentially have variations.
        // E.g. the dark theme comes with several variations: Dark+, Dark Visual Studio, ...
        .reduce((previous, current) => previous.concat(current), Array.of<any>())
        .map(theme => path.join(theme.extension.extensionPath, theme.path))
        // Why the try catch? See the comment in Syntax Highlighting Gun Controller (in parsing the theme configurations).
        .map(themePath => {try {return json.sync(themePath);} catch {return undefined}})
        // Ignore those that we couldn't past. Who cares, we will anyway have enough of scopes collected.
        .filter(themeConfiguration => themeConfiguration != undefined)
        // Get only those that define token colors. There are e.g. include themes configurations that do
        // not contain token colors definitions.
        .filter(themeConfiguration => themeConfiguration.tokenColors)
        // Get the token colors arrays.
        .map(themeConfiguration => themeConfiguration.tokenColors)
        // Reduce them to a single array.
        .reduce((previous, current) => previous.concat(current), Array.of<any>())
        // Get only those that have the scope property defined (most of them, but not all ;-)).
        .filter(tokenColor => tokenColor.scope)
        // Get the scope strings.
        .map(tokenColor => tokenColor.scope)
        // Scope can be either an array of single scopes (strings) or just a single string.
        // So let's turn them all into arrays and reduce to a single array.
        .map(scope => Array.isArray(scope) ? scope : [scope])
        .reduce((previous, current) => previous.concat(current), Array.of<string>())
        // Add some which are used but were not always found in the themes.
        .concat(["support.type.primitive", "entity.name.variable.parameter"])
        // Sort them. Just a matter of taste :-)
        .sort((first, second) => first.localeCompare(second));

        let uniqueScopes = Array.from(new Set<string>(allScopes));

        console.log(
            '[' +
                uniqueScopes
                    .map(scope => '"' + scope + '"')
                    .join(',\n')
            + ']'
        );
    }); 
});