import * as vscode from "vscode";

interface ExampleInterface {
    boolProperty : boolean;
    numberProperty : number;
}

abstract class BaseExampleClass {

}

class ExampleClass extends BaseExampleClass implements ExampleInterface {
    boolProperty : boolean;
    numberProperty : number;

    someMethod(someArgument : string) {
        let a = { first: "first", second: "second" };
        return a.first;
    }
}