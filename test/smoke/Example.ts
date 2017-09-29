import * as vscode from "vscode";

class ExampleClass {
    boolProperty : boolean;
    numberProperty : number;

    someMethod(someArgument : string) {
        let a = { first: "first", second: "second" };
        return a.first;
    }
}