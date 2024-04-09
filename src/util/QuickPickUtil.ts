import * as vscode from 'vscode';
import { Utils } from './utils';
const path = require('upath');

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


export class QuickPickUtil {
  private static showJsonFileSelector = async () => {
    const filePickerOptions: vscode.OpenDialogOptions = {
      title: 'Choose a .json file as input for the query',
      canSelectMany: false,
      filters: {
        'json': ['json']
      }
    };

    const result = await vscode.window.showOpenDialog(filePickerOptions);
    if (result && result.length > 0) {
      return result[0];
    }
    return undefined;
  };

  static showChangeContextQuickPick = async (cellIndex: number, autoChoose = false): Promise<vscode.Uri | undefined> => {
    const inputTabs = vscode.window.tabGroups.all.flatMap(({ tabs }) => tabs.map(tab => tab.input)).filter(input => input instanceof vscode.TabInputText) as vscode.TabInputText[];
    const jsonTabs = inputTabs.filter((input) => path.extname(input.uri.fsPath) === '.json');

    if (autoChoose && jsonTabs.length === 1) {
      const uri = jsonTabs[0].uri;
      await Utils.changeContext(cellIndex, uri);
      return uri;
    }
    else if (jsonTabs.length === 0) {
      const uri = await this.showJsonFileSelector();
      if (!uri) return undefined;
      await Utils.changeContext(cellIndex, uri);
      return uri;
    }

    const cell = vscode.window.activeNotebookEditor?.notebook.cellAt(cellIndex);
    const quickpick = vscode.window.createQuickPick<FileItem | SeparatorItem | OpenFileItem>();
    quickpick.busy = true;
    quickpick.matchOnDescription = true;
    quickpick.title = 'JSONPath Notebook - Change context';
    quickpick.placeholder = 'Choose a .json file as input for the query';
    quickpick.show();

    quickpick.items = jsonTabs.map(tab => new FileItem(tab.uri, vscode.window.activeNotebookEditor?.notebook.uri ?? tab.uri));
    quickpick.activeItems = quickpick.items.filter(item => {
      if (item instanceof FileItem) {
        return item.uri.fsPath === cell?.metadata.selectedFileUri;
      }
      return false;
    });
    quickpick.items = [...quickpick.items, new SeparatorItem, new OpenFileItem];
    quickpick.busy = false;
    const result = await new Promise(resolve => {
      quickpick.onDidAccept(() => resolve(true));
      quickpick.onDidHide(() => resolve(false));
    });
    if (!result) return undefined;

    const selectedItems = quickpick.selectedItems;
    let uri: vscode.Uri | undefined = undefined;
    if (selectedItems[0] instanceof FileItem) {
      uri = selectedItems[0].uri;
    }
    else if (selectedItems[0] instanceof OpenFileItem) {
      uri = await this.showJsonFileSelector();
    }
    quickpick.dispose();

    if (!uri) return undefined;
    await Utils.changeContext(cellIndex, uri);
    return uri;
  };
}