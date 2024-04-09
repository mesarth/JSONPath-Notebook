import * as vscode from 'vscode';
import { ExtensionInfo } from './ExtensionInfo';
import { Command } from './Command';
import { GlobalState } from './GlobalState';
import { Configuration } from './Configuration';
const path = require('upath');

export class Utils {
  static getPreferredPathFormatFromUri = (uri: vscode.Uri): string => {
    // absolute path by default
    let filePath = uri.path;

    // check if notebook is open
    const notebookUri = vscode.window.activeNotebookEditor?.notebook.uri;
    if (Configuration.useRelativePaths.get() && notebookUri) {
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

  static getContextUriFromCell = (cell: vscode.NotebookCell): vscode.Uri | undefined => {
    const notebookUri = cell.document.uri;
    const notebookPath = notebookUri.path;

    const selectedFileUri = cell.metadata.selectedFileUri;
    if (!selectedFileUri) {
      return undefined;
    }

    if (path.isAbsolute(selectedFileUri)) {
      return vscode.Uri.parse(selectedFileUri);
    }
    else {
      // build absolute path from relative path because vscode.Uri does not support relative paths
      const absolutePath = path.join(path.dirname(notebookPath), selectedFileUri);
      return vscode.Uri.parse(absolutePath);
    }
  };

  static doesCellUseExtendedSyntax = (cell: vscode.NotebookCell): boolean => {
    const syntaxMode = Configuration.defaultSyntaxMode.get();
    const extended = Configuration.defaultSyntaxMode.options.extended;
    return cell.metadata?.extendedSyntax ?? syntaxMode === extended;
  }

  static toggleSyntaxMode = async (cellIndex: number) => {
    const cell = vscode.window.activeNotebookEditor?.notebook.cellAt(cellIndex);
    if (!cell) { return; }
    const extendedSyntax = this.doesCellUseExtendedSyntax(cell);
    await Utils.updateCellMetadata(cellIndex, { extendedSyntax: !extendedSyntax });
  }

  static updateCellMetadata = async (cellIndex: number, newCellMetadata: { [key: string]: any; }) => {
    const cell = vscode.window.activeNotebookEditor?.notebook.cellAt(cellIndex);
    if (!cell) { return; };

    const edit = new vscode.WorkspaceEdit();
    const nbEdit = vscode.NotebookEdit.updateCellMetadata(cell.index, {
      ...cell.metadata,
      ...newCellMetadata
    }
    );
    edit.set(cell.notebook.uri, [nbEdit]);
    await vscode.workspace.applyEdit(edit);
  };

  static changeContext = async (cellIndex: number, context: vscode.Uri) => {
    // get correct path format based on setting
    const selectedFileUri = Utils.getPreferredPathFormatFromUri(context);

    await Utils.updateCellMetadata(cellIndex, { selectedFileUri });
  };

  static openCellOutput = async (cellIndex: number): Promise<void> => {
    const cell = vscode.window.activeNotebookEditor?.notebook.cellAt(cellIndex);
    const content = new TextDecoder().decode(cell?.outputs[0].items[0].data);
    const document = await vscode.workspace.openTextDocument({ language: 'json', content });
    await vscode.window.showTextDocument(document);
  };

  static openNewNotebook = async (): Promise<void> => {
    const document = await vscode.workspace.openNotebookDocument(ExtensionInfo.NOTEBOOK_TYPE);
    await vscode.window.showNotebookDocument(document);
  };

  static showWalkthrough = async () => {
    const context = await Utils.getContext();

    // check if walkthrough has already been shown
    //TODO: remove isFirstTimeOpen check after next release
    if (
      context.globalState.get(GlobalState.version) === undefined &&
      context.globalState.get(GlobalState.isFirstTimeOpen) === undefined
    ) {
      await vscode.commands.executeCommand(Command.welcome);
    }
  };

  static updateVersionState = async () => {
    const context = await Utils.getContext();
    context.globalState.update(GlobalState.version, context.extension.packageJSON.version);
  }

  static getContext = async () => {
    return await vscode.commands.executeCommand(Command.getContext) as vscode.ExtensionContext;
  };

  static registerNotebookChangeListener = async () => {
    vscode.workspace.onDidChangeNotebookDocument((event) => {
      event.contentChanges.forEach(change => {
        change.addedCells.forEach(async cell => {
          await Utils.setInitialCellMetadata(cell);
        });
      });
    });
  };

  static setInitialCellMetadata = async (cell: vscode.NotebookCell) => {
    if (cell.kind !== vscode.NotebookCellKind.Code) return;
    const extendedSyntax = Utils.doesCellUseExtendedSyntax(cell);
    await Utils.updateCellMetadata(cell.index, { extendedSyntax: extendedSyntax });
  }
}




