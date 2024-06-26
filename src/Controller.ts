import * as vscode from 'vscode';
import { Utils } from './util/utils';
import { ExtensionInfo } from './util/ExtensionInfo';
import { join } from 'upath';
import { QuickPickUtil } from './util/QuickPickUtil';
// eslint-disable-next-line @typescript-eslint/naming-convention
const { Worker, isMainThread } = require('worker_threads');

export class Controller {
  readonly controllerId = 'jsonpath-notebook-controller-id';
  readonly label = 'JSONPath Notebook';
  readonly supportedLanguages = [ExtensionInfo.LANGUAGE_ID];

  private readonly _controller: vscode.NotebookController;
  private _executionOrder = 0;

  constructor() {
    this._controller = vscode.notebooks.createNotebookController(
      this.controllerId,
      ExtensionInfo.NOTEBOOK_TYPE,
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

  private async getSelectedFileUri(cell: vscode.NotebookCell): Promise<vscode.Uri | undefined> {
    let selectedFileUri = Utils.getContextUriFromCell(cell);

    // if no file is selected, ask user to select one
    if (!selectedFileUri) {
      selectedFileUri = await QuickPickUtil.showChangeContextQuickPick(cell.index);
      if (!selectedFileUri) {
        return undefined;
      }
    }

    try {
      //check if file still exists
      await vscode.workspace.fs.stat(selectedFileUri);
    } catch (err) {
      //file does not exist, ask user to select a different file
      const selectedFileOption = await vscode.window.showErrorMessage(`File ${selectedFileUri.fsPath} does not exist`, { modal: true, detail: 'The context file for this cell was not found at the saved path. It was probably moved or deleted.' }, 'Select different file');
      if (selectedFileOption) {
        selectedFileUri = await QuickPickUtil.showChangeContextQuickPick(cell.index);
      }
      else {
        return undefined;
      }
    }
    return selectedFileUri;
  }

  private async _doExecution(cell: vscode.NotebookCell, notebook: vscode.NotebookDocument): Promise<void> {
    const execution = this._controller.createNotebookCellExecution(cell);

    const selectedFileUri = await this.getSelectedFileUri(cell);
    if (!selectedFileUri) {
      execution.end(false, Date.now());
      return;
    }

    // start execution
    execution.executionOrder = ++this._executionOrder;
    execution.start(Date.now()); // Keep track of elapsed time to execute cell.

    let inputContent = {};
    // read context file and parse as JSON    
    const document = await vscode.workspace.openTextDocument(selectedFileUri);
    try {
      inputContent = JSON.parse(document.getText());
    }
    catch (error: any) {
      execution.replaceOutput([
        new vscode.NotebookCellOutput([
          vscode.NotebookCellOutputItem.stderr(`Error parsing JSON file. Please check the file and try again. \n\n${error.message}`),
        ])
      ]);
      execution.end(false, Date.now());
      return;
    }
    const useExtendedSyntax = Utils.doesCellUseExtendedSyntax(cell);

    // execute JSONPath query in worker thread
    if (isMainThread) {
      const worker = new Worker(join(__filename, '../worker.js'), {
        workerData: {
          input: inputContent,
          expression: cell.document.getText().trim(),
          useExtendedSyntax
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

      worker.on('error', (err: any) => {
        execution.replaceOutput([
          new vscode.NotebookCellOutput([
            vscode.NotebookCellOutputItem.stderr(err.message)
          ])
        ]);
        execution.end(false, Date.now());
      });

      execution.token.onCancellationRequested(() => {
        worker.terminate;
        execution.end(false, Date.now());
      });
    }
  }

  dispose(): any { }
}