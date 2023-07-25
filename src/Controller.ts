import * as vscode from 'vscode';
import jsonPath from './lib/jsonpath'
import path = require('path');
import { LANGUAGE_ID, NOTEBOOK_TYPE } from './utils';

export class Controller {
  readonly controllerId = 'jsonpath-notebook-controller-id';
  readonly label = 'JSONPath Notebook';
  readonly supportedLanguages = [LANGUAGE_ID];

  private readonly _controller: vscode.NotebookController;
  private _executionOrder = 0;

  constructor() {
    this._controller = vscode.notebooks.createNotebookController(
      this.controllerId,
      NOTEBOOK_TYPE,
      this.label
    );

    this._controller.supportedLanguages = this.supportedLanguages;
    this._controller.supportsExecutionOrder = true;
    this._controller.executeHandler = this._execute.bind(this);
  }

  private _execute(
    cells: vscode.NotebookCell[],
    _notebook: vscode.NotebookDocument,
    _controller: vscode.NotebookController
  ): void {
    for (let cell of cells) {
      this._doExecution(cell, _notebook);
    }
  }

  private async _doExecution(cell: vscode.NotebookCell, notebook: vscode.NotebookDocument): Promise<void> {
    const execution = this._controller.createNotebookCellExecution(cell);
    execution.executionOrder = ++this._executionOrder;
    execution.start(Date.now()); // Keep track of elapsed time to execute cell.

    const inputTabs = vscode.window.tabGroups.all.flatMap(({ tabs }) => tabs.map(tab => tab.input)).filter(input => input instanceof vscode.TabInputText) as vscode.TabInputText[];
    const jsonTabs = inputTabs.filter((input) => path.extname(input.uri.fsPath) === '.json');

    let inputContent = {};
    let selectedFileUri: vscode.Uri | undefined;

    if (cell.metadata.selectedFileUri) {
      selectedFileUri = vscode.Uri.parse(cell.metadata.selectedFileUri);
    }
    else {
      if (jsonTabs.length == 1) {
        selectedFileUri = jsonTabs[0].uri;
      }
      else if (jsonPath.length > 1) {
        const filesMap = new Map(jsonTabs.map(tab => [path.basename(tab.uri.fsPath), tab.uri]));
        const fileNames = Array.from(filesMap.keys());
        const result = await vscode.window.showQuickPick(fileNames, {
          canPickMany: false,
          placeHolder: 'Choose a .json file as input for the query'
        });
        if (result) {
          selectedFileUri = filesMap.get(result);
        }
      }
      else {
        const filePickerOptions: vscode.OpenDialogOptions = {
          title: 'Choose a .json file as input for the query',
          canSelectMany: false,
          filters: {
            'JSON': ['json']
          }
        };

        const result = await vscode.window.showOpenDialog(filePickerOptions);
        if (result && result.length > 0) {
          selectedFileUri = result[0];
        }
      }
    }
    if (selectedFileUri) {
      const document = await vscode.workspace.openTextDocument(selectedFileUri);
      inputContent = JSON.parse(document.getText());
    }

    const result = jsonPath(inputContent, cell.document.getText());

    // create workspace edit to update tag
    const edit = new vscode.WorkspaceEdit();
    const nbEdit = vscode.NotebookEdit.updateCellMetadata(cell.index, {
      ...cell.metadata,
      selectedFileUri: selectedFileUri?.fsPath
    });
    edit.set(cell.notebook.uri, [nbEdit]);
    await vscode.workspace.applyEdit(edit);

    execution.replaceOutput([
      new vscode.NotebookCellOutput([
        vscode.NotebookCellOutputItem.json(result)
      ])
    ]);
    execution.end(true, Date.now());
  }

  dispose(): any { }
}