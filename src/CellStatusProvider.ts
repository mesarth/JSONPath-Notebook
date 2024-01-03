const path = require('upath');
import * as vscode from 'vscode';
import { Config } from './utils';

export class CellStatusProvider implements vscode.NotebookCellStatusBarItemProvider {
  provideCellStatusBarItems(cell: vscode.NotebookCell, token: vscode.CancellationToken): vscode.ProviderResult<vscode.NotebookCellStatusBarItem | vscode.NotebookCellStatusBarItem[]> {
    const items: vscode.NotebookCellStatusBarItem[] = [];

    // change context
    const itemContent = {
      text: '$(search-new-editor) Select input file (context)',
      tooltip: 'Select an input file (context) for this cell'
    }

    const selectedFileUriPath = cell.metadata.selectedFileUri;
    if (selectedFileUriPath) {
      const selectedFileUri = vscode.Uri.parse(selectedFileUriPath);
      itemContent.text = `$(file) ${path.basename(selectedFileUri.fsPath)}`;
      itemContent.tooltip = selectedFileUri.path;
    }
    const item = new vscode.NotebookCellStatusBarItem(itemContent.text, vscode.NotebookCellStatusBarAlignment.Right);
    item.tooltip = itemContent.tooltip;
    item.command = {
      title: "$Change Context",
      command: `${Config.EXTENSION_ID}.changeContext`,
      arguments: [cell.index]
    };
    items.push(item);


    // open output in new tab
    if (cell.outputs.length > 0) {
      const item = new vscode.NotebookCellStatusBarItem('$(output) Open output in new tab', vscode.NotebookCellStatusBarAlignment.Left);
      item.tooltip = 'Open the JSON result of the query in a new tab';
      item.command = {
        title: "Open the JSON result of the query in a new tab",
        command: `${Config.EXTENSION_ID}.openOutput`,
        arguments: [cell.index]
      };
      items.push(item);
    }

    return items;
  }
}