<!-- Run JSONPath queries inside VS Code notebooks (also known as Jupyter Notebooks).  -->

<p align="center">
  <a href="https://marketplace.visualstudio.com/">
    <img width="150" height="150" src="./images/icon.png" alt="JSONPath Notebook" width="200" />
  </a>
</p>
<p align="center">
  <h1 align="center">JSONPath Notebook<br>for Visual Studio Code</h1>
  <p align="center">
A <a href="https://marketplace.visualstudio.com/">Visual Studio Code Extension</a> for running JSONPath queries inside Notebooks (also known as Jupyter Notebooks).
  </p>
</p>

[![Actions Status](https://github.com/mesarth/JSONPath-Notebook/actions/workflows/main.yml/badge.svg)](https://github.com/mesarth/JSONPath-Notebook/actions/workflows/main.yml)
[VS Code Marketplace](https://marketplace.visualstudio.com/)

![Intro Showcase](./images/intro.gif)

## Features
- Quickly run JSONPath queries on your JSON files
- Annotate and organize queries using [Markdown cells](#markdown-support)
- allows you to use [different JSON input files for each cell](#switching-input-file-context)
- [open query result](#open-output) in new document to save or further edit
- input file (context) is remembered by each cell and stored in the notebook file
- store and share notebook files `.jsonpath-notebook`
<!-- - supports Visual Studio Code Web - [vscode.dev](https://vscode.dev) or [github.dev](https://github.dev) -->
<!-- ### Planned
- Proper Syntax Highlighting
- Error handling
- JSONPath engine options -->

## Installation
Install the extension through the VS Code marketplace. 
[https://marketplace.visualstudio.com/](https://marketplace.visualstudio.com/) or just search for `JSONPath Notebook` inside the Extension Pane.

If you prefer not use the Microsoft Marketplace you can also install the extension directly:
1. Go to the [Releases page](/releases) of the Repository and download the latest `.vsix` file.
2. Install the extension by either running the VS Code command `Developer: Install Extension from Location` and selecting the .visx file or by running the command `code --install-extension <filename>.visx`

## Usage

### Creating a new Notebook
After installation a popup should appear, asking you to create a new notebook.

You can also create a new notebook by using the command `JSONPath Notebook: Open new Notebook` or creating a file with the `.jsonpath-notebook` ending.

![Creating a new Notebook Showcase](./images/create-notebook.gif)


### Switching input file (context)
On first execution of a cell the input file is determined as follows
- by default the JSON file opened in the editor will be used
  - if there is more than one JSON file opened in the editor, a popup appears asking to select a file
  - there is also an option in this popup to select a file from the file system
- if there is no JSON file opened, a popup appears asking to select a file

The chosen context (input file) gets saved inside the notebook (per cell) and can be changed any time by clicking on the corresponding button in the lower right of the cell.  

![Switching input file Showcase](./images/context.gif)


### Open output
The result of a query can be opened in a new file by clicking the button `Open output in new tab` in the lower left of the cell.

![Open output Showcase](./images/open-output.gif)


### Markdown support
JSONPath Notebook supports Markdown formatted cells. To add a new Markdown cell press the button `+ Markdown` or run the command `Notebook: Insert Markdown Cell Above/Below`. For an introduction to the Markdown syntax see [Github Markdown Guide](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#quoting-code).

![Markdown Showcase](./images/markdown.gif)


## Extension Settings
WIP

## Release Notes
See [Changelog.md](Changelog.md)

## Issue Reporting and Feature Requests
Found a bug? Have a feature request? Reach out on our [GitHub Issues page](/issues).

## JSONPath engines used
- Default: [https://github.com/brunerd/jsonpath](https://github.com/brunerd/jsonpath)
- more engine options coming soon

Note: Because the standardization of JSONPath is [still ongoing](https://datatracker.ietf.org/wg/jsonpath/about/), current engine implementations differ in syntax and functionality.