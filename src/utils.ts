import path = require('path');
import * as vscode from 'vscode';

export const NOTEBOOK_TYPE = 'jsonpath-notebook';
export const LANGUAGE_ID = 'JSONPath';
export const EXTENSION_ID = 'schranz.jsonpath-notebook';


class FileItem implements vscode.QuickPickItem {

  label: string;
  description: string;

  constructor(public uri: vscode.Uri, public cwd: vscode.Uri) {
    this.label = `$(file) ${path.basename(uri.fsPath)}`;
    this.description = path.dirname(path.relative(path.dirname(cwd.fsPath), uri.fsPath));
  }
}

const changeContext = async (cellIndex: number, context: vscode.Uri) => {
  const cell = vscode.window.activeNotebookEditor?.notebook.cellAt(cellIndex);

  if (cell) {
    // create workspace edit to update tag
    const edit = new vscode.WorkspaceEdit();
    const nbEdit = vscode.NotebookEdit.updateCellMetadata(cell.index, {
      ...cell.metadata,
      selectedFileUri: context?.fsPath
    });
    edit.set(cell.notebook.uri, [nbEdit]);
    await vscode.workspace.applyEdit(edit);
  }
}

export const showChangeContextQuickPick = async (cellIndex: number) => {


  const quickpick = vscode.window.createQuickPick<FileItem>();
  quickpick.busy = true;
  quickpick.matchOnDescription = true;
  quickpick.title = 'JSONPath Notebook - Change context'
  quickpick.placeholder = 'Choose a .json file as input for the query';
  quickpick.show();

  const inputTabs = vscode.window.tabGroups.all.flatMap(({ tabs }) => tabs.map(tab => tab.input)).filter(input => input instanceof vscode.TabInputText) as vscode.TabInputText[];
  const jsonTabs = inputTabs.filter((input) => path.extname(input.uri.fsPath) === '.json');
  quickpick.items = jsonTabs.map(tab => new FileItem(tab.uri, vscode.window.activeNotebookEditor?.notebook.uri ?? tab.uri));
  quickpick.busy = false;
  quickpick.onDidChangeSelection(async (item) => {
    await changeContext(cellIndex, item[0].uri)
    quickpick.dispose();
  });
}