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

        let currentThemeId = configuration.get<string>("workbench.colorTheme", "");
        configuration.update("editor.tokenColorCustomizations", this.createTokenColorCustomizations(currentThemeId));
    }

    giveTheGunBackWithConfigurationCore(configuration : vscode.WorkspaceConfiguration) {
        this.initialSettings.restore(configuration);
    }

    private createTokenColorCustomizations(currentThemeId : string) {
        let editorForegroundColor = this.getEditorForegroundColor(currentThemeId);

        return {
            comments: {
                foreground: editorForegroundColor,
                fontStyle: ""            
            },
            functions: {
                foreground: editorForegroundColor,
                fontStyle: ""            
            },
            keywords: {
                foreground: editorForegroundColor,
                fontStyle: ""            
            },
            numbers: {
                foreground: editorForegroundColor,
                fontStyle: ""            
            },
            strings: {
                foreground: editorForegroundColor,
                fontStyle: ""            
            },
            types: {
                foreground: editorForegroundColor,
                fontStyle: ""            
            },
            variables: {
                foreground: editorForegroundColor,
                fontStyle: ""            
            },
            textMateRules: [{
                scope: SyntaxHighlightingGunController.getTextMateScopes(),
                settings: {
                    foreground: editorForegroundColor,
                    fontStyle: ""            
                }
            }]
        };
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
            // Filter only the theme extensions.
            .filter(extension => extension.packageJSON.contributes.themes)
            // Combine the extension metadata and the theme configuration. We will need both later.
            .map(extension => extension.packageJSON.contributes.themes.map((theme : any) => ({...theme, extension })))
            // A single theme is actually array of theme because a theme can potentially have variations.
            // E.g. the dark theme comes with several variations: Dark+, Dark Visual Studio, ...
            .reduce((previous, current) => previous.concat(current), Array.of<any>())
            // Get the one for the current theme.
            .filter((theme : any) => theme.id == currentThemeId || theme.label == currentThemeId);
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
            // Usr rights? A slightly invalid JSON that VS Code tolerates ;-)
            // E.g. many theme definition files contain //-style one line comments which are not JSON conform, etc.
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
                // It can be that the initial theme relative path contains subdirectorifes ;-)
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

    private static getTextMateScopes() {
        // Yeap, they are hardcoded, why not.
        // We do not want to generate them at run time because of the processing overhead.
        // And the chances are that these scopes will cover everything that will ever occur
        // in the teams out there in the wild.
        // The list is generated using the "TextMate Scopes" data generator that can be
        // found in the integration tests.
        return [
            "beginning.punctuation.definition.list.markdown",
            "beginning.punctuation.definition.quote.markdown",
            "comment",
            "comment.block.documentation",
            "comment.block.preprocessor",
            "comment.documentation",
            "constant",
            "constant.character",
            "constant.character, constant.other",
            "constant.character.entity",
            "constant.character.escape",
            "constant.language",
            "constant.numeric",
            "constant.numeric, constant.language, support.constant, constant.character, variable.parameter, punctuation.section.embedded, keyword.other.unit",
            "constant.other.color.rgb-value",
            "constant.other.rgb-value",
            "constant.other.symbol",
            "constant.other.symbol.ruby",
            "constant.regexp",
            "constant.sha.git-rebase",
            "emphasis",
            "entity.name.class",
            "entity.name.class, entity.name.type",
            "entity.name.class, entity.name.type, support.type, support.class",
            "entity.name.exception",
            "entity.name.function",
            "entity.name.function, meta.function-call, support.function, keyword.other.special-method, meta.block-level, markup.changed.git_gutter",
            "entity.name.section",
            "entity.name.selector",
            "entity.name.tag",
            "entity.name.tag.css",
            "entity.name.type",
            "entity.name.variable.parameter",
            "entity.other.attribute-name",
            "entity.other.attribute-name, meta.tag punctuation.definition.string",
            "entity.other.attribute-name.attribute.scss",
            "entity.other.attribute-name.class.css",
            "entity.other.attribute-name.class.mixin.css",
            "entity.other.attribute-name.html",
            "entity.other.attribute-name.id.css",
            "entity.other.attribute-name.parent-selector.css",
            "entity.other.attribute-name.pseudo-class.css",
            "entity.other.attribute-name.pseudo-element.css",
            "entity.other.attribute-name.scss",
            "entity.other.inherited-class",
            "header",
            "invalid",
            "invalid.deprecated",
            "invalid.illegal",
            "keyword",
            "keyword, storage, storage.type, entity.name.tag.css",
            "keyword.control",
            "keyword.operator",
            "keyword.operator, constant.other.color",
            "keyword.operator.cast",
            "keyword.operator.class, keyword.operator, constant.other, source.php.embedded.line",
            "keyword.operator.expression",
            "keyword.operator.logical.python",
            "keyword.operator.new",
            "keyword.operator.sizeof",
            "keyword.other.DML.sql",
            "keyword.other.important",
            "keyword.other.special-method.ruby",
            "keyword.other.unit",
            "markup.bold",
            "markup.bold, markup.italic",
            "markup.changed",
            "markup.deleted",
            "markup.deleted.diff, meta.diff.header.from-file",
            "markup.error",
            "markup.heading",
            "markup.heading.setext",
            "markup.inline.raw",
            "markup.inserted",
            "markup.inserted.diff, markup.deleted.diff, meta.diff.header.to-file, meta.diff.header.from-file",
            "markup.inserted.diff, meta.diff.header.to-file",
            "markup.italic",
            "markup.list",
            "markup.output",
            "markup.prompt",
            "markup.quote",
            "markup.raw",
            "markup.traceback",
            "markup.underline",
            "meta.definition.variable.name",
            "meta.diff, meta.diff.header",
            "meta.diff.header",
            "meta.diff.header.from-file",
            "meta.diff.header.from-file, meta.diff.header.to-file",
            "meta.diff.header.to-file",
            "meta.diff.index",
            "meta.diff.range",
            "meta.doctype, meta.tag.sgml-declaration.doctype, meta.tag.sgml.doctype",
            "meta.function-call.object",
            "meta.function-call.object.php",
            "meta.link",
            "meta.object-literal.key",
            "meta.object-literal.key entity.name.function",
            "meta.preprocessor",
            "meta.preprocessor.numeric",
            "meta.preprocessor.string",
            "meta.property-group support.constant.property-value.css, meta.property-value support.constant.property-value.css",
            "meta.property-name",
            "meta.property-value",
            "meta.property-value constant.other",
            "meta.return-type",
            "meta.selector",
            "meta.selector entity",
            "meta.selector entity punctuation",
            "meta.selector.css entity.other.attribute-name.id",
            "meta.separator",
            "meta.structure.dictionary.key.python",
            "meta.tag",
            "meta.tag entity.other.attribute-name",
            "meta.tag string -source -punctuation, text source text meta.tag string -punctuation",
            "meta.tag.inline source, text.html.php.source",
            "meta.tag.other, entity.name.tag.style, entity.name.tag.script, meta.tag.block.script, source.js.embedded punctuation.definition.tag.html, source.css.embedded punctuation.definition.tag.html",
            "meta.tag.sgml punctuation.definition.tag.html",
            "meta.tag.sgml.doctype",
            "meta.tag.sgml.doctype entity.name.tag",
            "meta.tag.sgml.doctype string",
            "meta.template.expression",
            "meta.toc-list.id",
            "meta.type.cast.expr",
            "meta.type.new.expr",
            "punctuation",
            "punctuation.definition.comment",
            "punctuation.definition.entity",
            "punctuation.definition.string.end.php, punctuation.definition.string.begin.php",
            "punctuation.definition.tag",
            "punctuation.definition.tag.begin.html",
            "punctuation.definition.tag.end.html",
            "punctuation.definition.tag.html",
            "punctuation.definition.tag.html, punctuation.definition.tag.begin, punctuation.definition.tag.end",
            "punctuation.definition.template-expression",
            "punctuation.definition.template-expression.begin",
            "punctuation.definition.template-expression.end",
            "punctuation.section.embedded -(source string source punctuation.section.embedded), meta.brace.erb.html",
            "punctuation.section.embedded.begin.php",
            "punctuation.section.embedded.begin.php, punctuation.section.embedded.end.php",
            "punctuation.section.embedded.coffee",
            "punctuation.section.embedded.end.php",
            "source.coffee.embedded",
            "source.css.less entity.other.attribute-name.id",
            "source.php.embedded.line.html",
            "source.ruby.embedded.source",
            "storage",
            "storage.modifier",
            "storage.modifier.import.java",
            "storage.modifier.package.java",
            "storage.type",
            "storage.type.annotation.groovy",
            "storage.type.annotation.java",
            "storage.type.cs",
            "storage.type.generic.cs",
            "storage.type.generic.groovy",
            "storage.type.generic.java",
            "storage.type.groovy",
            "storage.type.java",
            "storage.type.modifier.cs",
            "storage.type.object.array.groovy",
            "storage.type.object.array.java",
            "storage.type.parameters.groovy",
            "storage.type.primitive.array.groovy",
            "storage.type.primitive.array.java",
            "storage.type.primitive.groovy",
            "storage.type.primitive.java",
            "storage.type.token.java",
            "storage.type.variable.cs",
            "string",
            "string source",
            "string, constant.other.symbol, entity.other.inherited-class, markup.heading, markup.inserted.git_gutter",
            "string.comment.buffered.block.jade",
            "string.interpolated.jade",
            "string.quoted.double.handlebars",
            "string.quoted.double.html",
            "string.quoted.double.html, punctuation.definition.string.begin.html, punctuation.definition.string.end.html",
            "string.quoted.double.xml",
            "string.quoted.jade",
            "string.quoted.single.handlebars",
            "string.quoted.single.html",
            "string.quoted.single.xml",
            "string.quoted.single.yaml",
            "string.regexp",
            "string.tag",
            "string.unquoted.block.yaml",
            "string.unquoted.cdata.xml",
            "string.unquoted.html",
            "string.unquoted.plain.in.yaml",
            "string.unquoted.plain.out.yaml",
            "string.value",
            "strong",
            "support",
            "support.class",
            "support.constant",
            "support.constant.color",
            "support.constant.dom",
            "support.constant.font-name",
            "support.constant.handlebars",
            "support.constant.json",
            "support.constant.math",
            "support.constant.media",
            "support.constant.media-type",
            "support.constant.property-value",
            "support.function",
            "support.function.git-rebase",
            "support.type",
            "support.type.primitive",
            "support.type.property-name",
            "support.type.property-name.css",
            "support.type.property-name.json",
            "support.type.vendored.property-name",
            "support.variable",
            "text source",
            "token.debug-token",
            "token.error-token",
            "token.info-token",
            "token.warn-token",
            "variable",
            "variable, support.other.variable, string.other.link, string.regexp, entity.name.tag, entity.other.attribute-name, meta.tag, declaration.tag, markup.deleted.git_gutter",
            "variable.css",
            "variable.language",
            "variable.language.js",
            "variable.language.ruby",
            "variable.language.wildcard.java",
            "variable.other, variable.js, punctuation.separator.variable",
            "variable.other.less",
            "variable.other.php, variable.other.normal",
            "variable.other.property",
            "variable.parameter",
            "variable.scss"
        ];
    }
}