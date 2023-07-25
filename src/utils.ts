import path = require('path');
import * as vscode from 'vscode';

export const NOTEBOOK_TYPE = 'jsonpath-notebook';
export const LANGUAGE_ID = 'JSONPath';
export const EXTENSION_ID = 'schranz.jsonpath-notebook';


export const changeContext = async (cellIndex: number) => {
  const inputTabs = vscode.window.tabGroups.all.flatMap(({ tabs }) => tabs.map(tab => tab.input)).filter(input => input instanceof vscode.TabInputText) as vscode.TabInputText[];
  const jsonTabs = inputTabs.filter((input) => path.extname(input.uri.fsPath) === '.json');
  const filesMap = new Map(jsonTabs.map(tab => [path.basename(tab.uri.fsPath), tab.uri]));
  const fileNames = Array.from(filesMap.keys());
  const result = await vscode.window.showQuickPick(fileNames, {
    canPickMany: false,
    placeHolder: 'Choose a .json file as input for the query'
  });
  if (result) {
    const selectedFileUri = filesMap.get(result);

    const cell = vscode.window.activeNotebookEditor?.notebook.cellAt(cellIndex);

    if (cell) {
      // create workspace edit to update tag
      const edit = new vscode.WorkspaceEdit();
      const nbEdit = vscode.NotebookEdit.updateCellMetadata(cell.index, {
        ...cell.metadata,
        selectedFileUri: selectedFileUri?.fsPath
      });
      edit.set(cell.notebook.uri, [nbEdit]);
      await vscode.workspace.applyEdit(edit);
    }
  }
}