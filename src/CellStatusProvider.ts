const path = require('upath');
import * as vscode from 'vscode';
import { EXTENSION_ID } from './utils';

export class CellStatusProvider implements vscode.NotebookCellStatusBarItemProvider {
  provideCellStatusBarItems(cell: vscode.NotebookCell, token: vscode.CancellationToken): vscode.ProviderResult<vscode.NotebookCellStatusBarItem | vscode.NotebookCellStatusBarItem[]> {
    const items: vscode.NotebookCellStatusBarItem[] = [];

    const selectedFileUriPath = cell.metadata.selectedFileUri;
    if (selectedFileUriPath) {
      const selectedFileUri = vscode.Uri.parse(selectedFileUriPath);

      const item = new vscode.NotebookCellStatusBarItem(`$(file) ${path.basename(selectedFileUri.fsPath)}`, vscode.NotebookCellStatusBarAlignment.Right);
      item.tooltip = selectedFileUri.path;
      item.command = {
        title: "$Change Context",
        command: `${EXTENSION_ID}.changeContext`,
        arguments: [cell.index]
      };
      items.push(item);
    }

    if (cell.outputs.length > 0) {
      const item = new vscode.NotebookCellStatusBarItem('$(output) Open output in new tab', vscode.NotebookCellStatusBarAlignment.Left);
      item.tooltip = 'Open the JSON result of the query in a new tab';
      item.command = {
        title: "Open the JSON result of the query in a new tab",
        command: `${EXTENSION_ID}.openOutput`,
        arguments: [cell.index]
      };
      items.push(item);
    }

    return items;
  }
}