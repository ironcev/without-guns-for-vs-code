# Without Guns for Visual Studio Code
A [Visual Studio Code](https://code.visualstudio.com) extension that teaches you mindful programming.

*Without Guns* allows you to quickly turn ON and OFF the following widely used Visual Studio Code features:
- IntelliSense
- Syntax Highlighting
- Code Lens

When these features are turned OFF, we say that we code "without guns".

Occasional coding without guns forces you to code mindfully and yields the following benefits:
- Increased coding confidence
- Deeper knowledge of programming language syntax and features
- Deeper knowledge of used frameworks and libraries

I suggest coding without guns whenever you learn something new, being that a new programming language, algorithm, framework or a technology.

## FAQ
### Q: Why is the extension called "Without Guns"? Do you like guns?
No, I don't like guns. On the contrary, I dream of a world without them. The origin of the name is a story of its own :-) It has something to do with a quote from the 1996 film [Last Man Standing](https://en.wikipedia.org/wiki/Last_Man_Standing_(1996_film)) starring [Karina Lombard](https://en.wikipedia.org/wiki/Karina_Lombard), [Bruce Willis](https://en.wikipedia.org/wiki/Bruce_Willis), and [Christopher Walken](https://en.wikipedia.org/wiki/Christopher_Walken). I plan to write a blog post about it. The blog post will also explain the whole philosophy behind the programming without guns.

### Q: Are you suggesting that we should always code without IntelliSense, Syntax Highlighting, etc.?
No. On the contrary. I am myself a huge fan and a strong proponent of productivity features and tools. What I am suggesting is to turn them off *occasionally*, especially when learning a new programming language or a new framework.

### Q: Does this really work? Will programming without guns really bring me confidence and deeper knowledge?
Out of my years-long experience in practicing this technique - yes, definitely. Productivity features and tools like IntelliSense help you being fast and productive in the "production environment". Writing code without guns helps you learn programming languages, frameworks, and libraries in a much firmer way. Leaving guns behind intentionally while learning leads to a much deeper coding experience. This at the end brings deeper knowledge and a greater coding confidence.

### Q: Shouldn't we better spend time learning how to more efficiently use programming tools instead of learning how to code without them?
We should do both, master our programming tools and master working without them. Coding without guns can be seen as [practicing Tai Chi movements in a slow and mindful manner](https://youtu.be/2GX4WZSUVPo). It builds strong inner foundations. Programming with guns is [using Tai Chi in a fight](https://youtu.be/Jw5mn15xv5o).

### Q: Is *Without Guns* written without guns?
Yes, a good portion of it. This is my first project ever written in [TypeScript](http://www.typescriptlang.org). Programming it without guns was a great way to deeply experience TypeScript's syntax and surrounding libraries.

### Q: Is this all a joke?
No. I'm dead serious about programming without guns.

## Known Limitations
*Without Guns* unobtrusively changes some [Visual Studio Code workspace settings](https://code.visualstudio.com/docs/getstarted/settings) on the fly. These results in two intrinsic limitations:
- The extension cannot be used if there is no active workspace. In other words, you have to have a folder opened in Visual Studio Code in order for the extension to work.
- You have to "get the guns back" before closing Visual Studio Code. Otherwise, if you close VS code while the guns are OFF, you will not be able to turn them automatically ON any more. If that happens, do not despair :-) To get the guns back simply do the following:
    - Open the VS Code settings (*File* > *Preferences* > *Settings*).
    - Inside the `settings.json` file you will see the following settings:

            "editor.quickSuggestions": {
                "other": false,
                "comments": false,
                "strings": false
            },
            "editor.wordBasedSuggestions": false,
            "editor.parameterHints": false,
            "editor.suggestOnTriggerCharacters": false,
            "editor.codeLens": false,
            "editor.tokenColorCustomizations": {
                // Some token color settings, potentially a lot of them...
            },
            "_withoutGuns.internal.areGunsTaken": true

    - Just delete those settings and save the `settings.json` file.
    - That's it. This will bring your guns back to you :-)

## Extension Settings
*Without Guns* extension comes with only one setting, `_withoutGuns.internal.areGunsTaken`. As the name suggests, this is a setting used internally by the extension itself. It should not be changed manually. In other words, just ignore it.

## Release Notes
All notable changes to the *Without Guns* extension are documented in the [changelog](CHANGELOG.md). Below is the excerpt from the changelog that lists only the major changes.

### [0.3.0] - 2017-10-13
#### Added
- "Guns: With" and "Guns: Without" commands are context sensitive. (They are active only if the Guns are currently taken or not, respectively.)

### [0.2.0] - 2017-09-29
#### Added
- Turns Syntax Highlighting on and off.
- Turns Code Lens on and off.

### [0.1.0] - 2017-09-28
#### Added
- Turns IntelliSense on and off.

## License
*Without Guns* is licensed under the [MIT license](LICENSE).