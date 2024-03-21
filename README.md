<!-- Run JSONPath queries inside VS Code notebooks (also known as Jupyter Notebooks).  -->

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=tschranz.jsonpath-notebook">
    <img width="150" height="150" src="./images/icon.png" alt="JSONPath Notebook" width="200" />
  </a>
</p>
<p align="center">
  <h1 align="center">JSONPath Notebook<br>for Visual Studio Code</h1>
  <p align="center">
    A Visual Studio Code Extension for running JSONPath queries inside Notebooks (also known as Jupyter Notebooks).
  </p>
</p>

![Intro Showcase](./images/intro.gif)

## Features

- Quickly run JSONPath queries on your JSON files
- Annotate and organize queries using [Markdown cells](#markdown-support)
- allows you to use [different JSON input files for each cell](#switching-input-file-context)
- [open query result](#open-output) in new document to save or further edit
- input file (context) is remembered by each cell and stored in the notebook file
- store and share notebook files `.jsonpath-notebook`

## Installation

Install the extension through the VS Code marketplace.
[https://marketplace.visualstudio.com/items?itemName=tschranz.jsonpath-notebook](https://marketplace.visualstudio.com/items?itemName=tschranz.jsonpath-notebook) or just search for `JSONPath Notebook` inside the Extension Pane.

If you prefer not use the Microsoft Marketplace you can also install the extension directly:

1. Go to the [Releases page](https://github.com/mesarth/JSONPath-Notebook/releases) of the Repository and download the latest `.vsix` file.
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

## JSONPath Syntax

See [RFC 9535](https://www.rfc-editor.org/rfc/rfc9535) for the full JSONPath standard.

<details>
  <summary>Here are some examples:</summary>

```json
{ "store": {
    "book": [
      { "category": "reference",
        "author": "Nigel Rees",
        "title": "Sayings of the Century",
        "price": 8.95
      },
      { "category": "fiction",
        "author": "Evelyn Waugh",
        "title": "Sword of Honour",
        "price": 12.99
      },
      { "category": "fiction",
        "author": "Herman Melville",
        "title": "Moby Dick",
        "isbn": "0-553-21311-3",
        "price": 8.99
      },
      { "category": "fiction",
        "author": "J. R. R. Tolkien",
        "title": "The Lord of the Rings",
        "isbn": "0-395-19395-8",
        "price": 22.99
      }
    ],
    "bicycle": {
      "color": "red",
      "price": 399
    }
  }
}
```

| JSONPath                                    | Intended Result |
----------------------------------------------|------------------
| $.store.book[*].author                      | the authors of all books in the store |
| $..author                                   |	all authors |
| $.store.*	                                  | all things in the store, which are some books and a red bicycle |
| $.store..price                              | the prices of everything in the store |
| $..book[2]                                  | the third book |
| $..book[2].author	                          | the third book's author |
| $..book[2].publisher	                      | empty result: the third book does not have a "publisher" member |
| $..book[-1]	                                | the last book in order |
| <span>$..book[0,1] <br> $..book[:2]</span>  | the first two books |
| $..book[?@.isbn]	                          | all books with an ISBN number |
| $..book[?@.price<10]	                      | all books cheaper than 10 |
| $..*	                                      | all member values and array elements contained in the input value |

</details>

## Extension Settings

### `jsonpath-notebook.useRelativePaths`

When set to `true` the notebook will save the paths to input files relative to the location of the notebook file itself. This is particularly useful for sharing notebooks and input files as a package because it ensures that the links to input files will work on different machines and directories.

| Type    | Default |
| ------- | ------- |
| boolean | true    |

## JSONPath engine

JSONPath Notebook uses the [json-p3](https://github.com/jg-rp/json-p3) JSONPath engine for querying JSON files. The engine follows the JSONPath standard as defined in [RFC 9535](https://www.rfc-editor.org/rfc/rfc9535.html).

Before version 2.0 the extension used [brunerd's jsonpath engine](https://github.com/brunerd/jsonpath). That version did not implement the full JSONPath standard. Queries created with the old engine may need to be adjusted to work with the new engine.

## Release Notes

See [Changelog.md](https://github.com/mesarth/JSONPath-Notebook/blob/main/CHANGELOG.md)

## Issue Reporting and Feature Requests

Found a bug? Have a feature request? Reach out on our [GitHub Issues page](https://github.com/mesarth/JSONPath-Notebook/issues).
