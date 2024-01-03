import * as vscode from 'vscode';
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

export class Config {
  static readonly NOTEBOOK_TYPE = 'jsonpath-notebook';
  static readonly LANGUAGE_ID = 'JSONPath';
  static readonly EXTENSION_ID = 'jsonpath-notebook';
}

export class Utils {
  static getPreferredPathFormatFromUri = (uri: vscode.Uri): string => {
    // absolute path by default
    let filePath = uri.path;

    // check if relative paths should be used
    const useRelativePaths = vscode.workspace.getConfiguration('jsonpath-notebook').get<boolean>('useRelativePaths', true);
    // check if notebook is open
    const notebookUri = vscode.window.activeNotebookEditor?.notebook.uri;
    if (useRelativePaths && notebookUri) {
      // check if both files are on the same drive
      // if not, use absolute path
      const notebookRoot = path.parse(notebookUri.fsPath).root;
      const contextRoot = path.parse(uri.fsPath).root;
      if (notebookRoot === contextRoot) {
        // use relative path
        filePath = path.relative(path.dirname(notebookUri.path), uri.path);
      }
    }
    return filePath;
  };

  static getContextUriFromCell = (cell: vscode.NotebookCell): vscode.Uri => {
    const notebookUri = cell.document.uri;
    const notebookPath = notebookUri.path;

    const selectedFileUri = cell.metadata.selectedFileUri;

    if (path.isAbsolute(selectedFileUri)) {
      return vscode.Uri.parse(selectedFileUri);
    }
    else {
      // build absolute path from relative path because vscode.Uri does not support relative paths
      const absolutePath = path.join(path.dirname(notebookPath), selectedFileUri);
      return vscode.Uri.parse(absolutePath);
    }
  };

  static changeContext = async (cellIndex: number, context: vscode.Uri) => {
    const cell = vscode.window.activeNotebookEditor?.notebook.cellAt(cellIndex);
    if (!cell) { return; };

    // get correct path format based on setting
    const selectedFileUri = Utils.getPreferredPathFormatFromUri(context);

    // create workspace edit to update tag
    const edit = new vscode.WorkspaceEdit();
    const nbEdit = vscode.NotebookEdit.updateCellMetadata(cell.index, {
      ...cell.metadata,
      selectedFileUri
    });
    edit.set(cell.notebook.uri, [nbEdit]);
    await vscode.workspace.applyEdit(edit);
  };

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
      const uri = await Utils.showJsonFileSelector();
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
      uri = await Utils.showJsonFileSelector();
    }
    quickpick.dispose();

    if (!uri) return undefined;
    await Utils.changeContext(cellIndex, uri);
    return uri;
  };

  static openCellOutput = async (cellIndex: number): Promise<void> => {
    const cell = vscode.window.activeNotebookEditor?.notebook.cellAt(cellIndex);
    const content = new TextDecoder().decode(cell?.outputs[0].items[0].data);
    const document = await vscode.workspace.openTextDocument({ language: 'json', content });
    await vscode.window.showTextDocument(document);
  };

  static openNewNotebook = async (): Promise<void> => {
    const notebookData = new vscode.NotebookData([
      {
        kind: vscode.NotebookCellKind.Markup,
        languageId: 'markdown',
        value: '# Welcome to JSONPath Notebook!\n**To get started:** Add your JSONPath query in the code cell below and press run.\n\nTo get rid of this introduction text, select the trash bin icon on the top right. You can add you own text cells to the notebook by clicking the *Markdown*-Button on the top left.\n\nFor more information check out the [README](https://github.com/mesarth/jsonpath-notebook).\n\n<sup>Note: This pre-filled intro notebook is only shown on this first time.</sup>'
      },
      {
        kind: vscode.NotebookCellKind.Code,
        languageId: Config.LANGUAGE_ID,
        value: '$.store.book[*].author'
      }
    ]);

    const firstTime = await Utils.isFirstTimeOpen();
    if (firstTime) {
      (await Utils.getContext()).globalState.update('jsonpath-notebook:isFirstTimeOpen', false);
    }


    const document = await vscode.workspace.openNotebookDocument(Config.NOTEBOOK_TYPE, firstTime ? notebookData : undefined);
    await vscode.window.showNotebookDocument(document);
  };

  static isFirstTimeOpen = async () => {
    return (await Utils.getContext()).globalState.get(`${Config.EXTENSION_ID}:isFirstTimeOpen`) !== false;
  };

  static showFirstTimeInfo = async () => {
    if (await Utils.isFirstTimeOpen()) {
      vscode.window.showInformationMessage('JSONPath Notebook is installed. Create a new .jsonpath-notebook file to start.', 'Create new notebook').then(selected => selected && vscode.commands.executeCommand(`${Config.EXTENSION_ID}.openNewNotebook`));
    }
  };

  static getContext = async () => {
    return await vscode.commands.executeCommand(`${Config.EXTENSION_ID}.getContext`) as vscode.ExtensionContext;
  };
}




