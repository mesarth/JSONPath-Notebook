import path = require('path');
import * as vscode from 'vscode';
import { EXTENSION_ID } from './utils';

export class CellStatusProvider implements vscode.NotebookCellStatusBarItemProvider {
  provideCellStatusBarItems(cell: vscode.NotebookCell, token: vscode.CancellationToken): vscode.ProviderResult<vscode.NotebookCellStatusBarItem | vscode.NotebookCellStatusBarItem[]> {
    const items: vscode.NotebookCellStatusBarItem[] = [];

    const selectedFileUriPath = cell.metadata.selectedFileUri;
    if (selectedFileUriPath) {
      const selectedFileUri = vscode.Uri.parse(selectedFileUriPath);

      const item = new vscode.NotebookCellStatusBarItem(path.basename(selectedFileUri.fsPath), vscode.NotebookCellStatusBarAlignment.Right);
      item.tooltip = "This file is used to evaulate the JSONPath expression on";
      item.command = {
        title: "Change Context",
        command: `${EXTENSION_ID}.changeContext`,
        arguments: [cell.index]
      }
      items.push(item);
    }
    return items;
  }
}