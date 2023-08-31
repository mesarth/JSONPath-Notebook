import * as vscode from 'vscode';
import jsonPath from './lib/jsonpath';
import { LANGUAGE_ID, NOTEBOOK_TYPE, showChangeContextQuickPick } from './utils';
import { join } from 'path';
const { Worker, isMainThread, parentPort, workerData, } = require('worker_threads');

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
    //check if file still exists
    try {
      await vscode.workspace.fs.stat(selectedFileUri);
    } catch {
      //file does not exist, ask user to select a different file
      const result = await vscode.window.showErrorMessage(`File ${selectedFileUri.fsPath} does not exist`, { modal: true, detail: 'The context file for this cell was not found at the saved path. It was probably moved or deleted.' }, 'Select different file');
      if (result) {
        await showChangeContextQuickPick(cell.index);
        selectedFileUri = vscode.Uri.parse(cell.metadata.selectedFileUri);
      }
      else {
        //canceled by user, exit execution
        execution.end(false, Date.now());
        return;
      }
    }

    const document = await vscode.workspace.openTextDocument(selectedFileUri);
    try {
      inputContent = JSON.parse(document.getText());
    }
    catch (error: any) {
      execution.replaceOutput([
        new vscode.NotebookCellOutput([
          vscode.NotebookCellOutputItem.text(`Error parsing JSON file. Please check the file and try again. \n\n${error.message}`),
        ])
      ]);
      execution.end(false, Date.now());
      return;
    }

    if (isMainThread) {
      const worker = new Worker(join(__filename, '../worker.js'), {
        workerData: {
          input: inputContent,
          expression: cell.document.getText()
        }
      });
      worker.on('message', (result: any) => {
        execution.replaceOutput([
          new vscode.NotebookCellOutput([
            vscode.NotebookCellOutputItem.json(result)
          ])
        ]);
        execution.end(true, Date.now());
      });

      execution.token.onCancellationRequested(() => {
        worker.terminate;
        execution.end(false, Date.now());
      });
    }

  }

  dispose(): any { }
}