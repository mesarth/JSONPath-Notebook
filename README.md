# JSONPath Notebook for Visual Studio Code
A [Visual Studio Code Extension](https://marketplace.visualstudio.com/) which allows you to use JSONPath queries inside Notebooks.

[![Actions Status](https://github.com/mesarth/JSONPath-Notebook/actions/workflows/main.yml/badge.svg)](https://github.com/mesarth/JSONPath-Notebook/actions/workflows/main.yml)

INSERT GIF?

## Features
- Quickly run JSONPath queries on your JSON files
- Annotate queries using Markdown cells
- allows you to use [different JSON input files for each cell](#switching-input-file-context)
- open query result in new tab to save or edit
- output and input file context get saved with the notebook
- supports VS Code web and remote environments


## Installation
Install extension through the VS Code marketplace. 
[https://marketplace.visualstudio.com/](https://marketplace.visualstudio.com/) or just search for ``JSONPath Notebook`` inside the Extension Pane.

If you prefer not use the Microsoft Marketplace you can also install the extension directly:
1. Go to the [Releases page](https://github.com/mesarth/JSONPath-Notebook/releases) of the Repository and download the latest ``.vsix`` file.
2. Install the extension by either running the VS Code command ``Developer: Install Extension from Location`` and selecting the .visx file or by running the command ``code --install-extension <filename>.visx``

## Usage

INSERT GIF?

### Creating a new Notebook
After installation a popup should appear, asking you to create a new notebook.

You can also create a new notebook by using the command ``JSONPath Notebook: Open new Notebook`` or creating a new file ending with ``.jsonpath-notebook``

### Switching input file (context)
On first execution of a cell the context is determined as follows
- by default the JSON file opened in the current window will be used
- if there is more than one JSON file opened in the editor, a popup appears asking to select a file
  - there is also an option in this popup to select a not opened file

The chosen context (input file) gets saved inside the notebook (per cell) and can be changed any time by clicking on 

## Extension Settings
WIP

## Release Notes
See [Changelog.md](Changelog.md)

## Issue Reporting and Feature Requests
Found a bug? Have a feature request? Reach out on our [GitHub Issues page](https://github.com/mesarth/JSONPath-Notebook/issues).
