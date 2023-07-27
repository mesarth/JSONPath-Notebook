import { rejects } from 'assert';
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

class SeparatorItem implements vscode.QuickPickItem {
  label = '';
  kind = vscode.QuickPickItemKind.Separator;
}

class OpenFileItem implements vscode.QuickPickItem {
  label = 'Select different file';
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

export const showJsonFileSelector = async () => {
  const filePickerOptions: vscode.OpenDialogOptions = {
    title: 'Choose a .json file as input for the query',
    canSelectMany: false,
    filters: {
      'JSON': ['json']
    }
  };

  const result = await vscode.window.showOpenDialog(filePickerOptions);
  if (result && result.length > 0) {
    return result[0];
  }
  return undefined
}

export const showChangeContextQuickPick = async (cellIndex: number, autoChoose = false): Promise<void> => {
  const inputTabs = vscode.window.tabGroups.all.flatMap(({ tabs }) => tabs.map(tab => tab.input)).filter(input => input instanceof vscode.TabInputText) as vscode.TabInputText[];
  const jsonTabs = inputTabs.filter((input) => path.extname(input.uri.fsPath) === '.json');

  if (autoChoose && jsonTabs.length == 1) {
    await changeContext(cellIndex, jsonTabs[0].uri);
    return;
  }

  const cell = vscode.window.activeNotebookEditor?.notebook.cellAt(cellIndex);
  const quickpick = vscode.window.createQuickPick<FileItem | SeparatorItem | OpenFileItem>();
  quickpick.busy = true;
  quickpick.matchOnDescription = true;
  quickpick.title = 'JSONPath Notebook - Change context'
  quickpick.placeholder = 'Choose a .json file as input for the query';
  quickpick.show();
  quickpick.items = jsonTabs.map(tab => new FileItem(tab.uri, vscode.window.activeNotebookEditor?.notebook.uri ?? tab.uri));
  quickpick.activeItems = quickpick.items.filter(item => {
    if (item instanceof FileItem) {
      return item.uri.fsPath === cell?.metadata.selectedFileUri;
    }
    return false
  });
  quickpick.items = [...quickpick.items, new SeparatorItem, new OpenFileItem];
  quickpick.busy = false;
  await new Promise(resolve => quickpick.onDidAccept(resolve));
  const selectedItems = quickpick.selectedItems;
  let uri: vscode.Uri | undefined = undefined;
  if (selectedItems[0] instanceof FileItem) {
    uri = selectedItems[0].uri;
  }
  else if (selectedItems[0] instanceof OpenFileItem) {
    uri = await showJsonFileSelector();
  }
  if (uri) {
    await changeContext(cellIndex, uri);
  }
  quickpick.dispose();
  return
}

export const openCellOutput = async (cellIndex: number): Promise<void> => {
  const cell = vscode.window.activeNotebookEditor?.notebook.cellAt(cellIndex);
  const content = new TextDecoder().decode(cell?.outputs[0].items[0].data);
  const document = await vscode.workspace.openTextDocument({ language: 'json', content });
  await vscode.window.showTextDocument(document);
}