import * as vscode from 'vscode';
import jsonPath from './lib/jsonpath';
import path = require('path');
import { LANGUAGE_ID, NOTEBOOK_TYPE, showChangeContextQuickPick } from './utils';

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

    let inputContent = {};

    if (!cell.metadata.selectedFileUri) {
      await showChangeContextQuickPick(cell.index, true);
    }

    let selectedFileUri = vscode.Uri.parse(cell.metadata.selectedFileUri);
    const document = await vscode.workspace.openTextDocument(selectedFileUri);
    inputContent = JSON.parse(document.getText());

    const result = jsonPath(inputContent, cell.document.getText());

    execution.replaceOutput([
      new vscode.NotebookCellOutput([
        vscode.NotebookCellOutputItem.json(result)
      ])
    ]);
    execution.end(true, Date.now());
  }

  dispose(): any { }
}