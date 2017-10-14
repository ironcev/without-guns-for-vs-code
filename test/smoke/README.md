# Smoke Tests

This folder contains sample source files that are used in smoke tests. There is a single file per programming language or file type.

Each file is a compilation of real-life source code taken from different open source projects. The projects from which the code has been taken are listed on the top of the file using the following schema:

    // The example is compiled out of the following open source files:
    // - <File path> (<File URL>)

For example:

    // The example is compiled out of the following open source files:
    // - SwissKnife/Source/SwissKnife/Collections/CollectionExtensions.cs (https://github.com/ironcev/SwissKnife/blob/fb04fc8ace2c5d840727ebfd674021f59848bdff/Source/SwissKnife/Collections/CollectionExtensions.cs)

Each file has the name `Example.<extension>`. E.g. `Example.ts`. The word *Example* should be capitalized using the file naming conventions typical for the sample programming language. E.g. `Example.cs` for C# and `example.py` for Python.

The goal is to create realistic compilations that cover most of the features of the particular programming language or file type. The examples will grow over time.