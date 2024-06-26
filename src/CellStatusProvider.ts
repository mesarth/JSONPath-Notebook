const path = require('upath');
import * as vscode from 'vscode';
import { Utils } from './util/utils';
import { Command } from './util/Command';

export class CellStatusProvider implements vscode.NotebookCellStatusBarItemProvider {
  provideCellStatusBarItems(cell: vscode.NotebookCell, token: vscode.CancellationToken): vscode.ProviderResult<vscode.NotebookCellStatusBarItem | vscode.NotebookCellStatusBarItem[]> {

    if (cell.kind !== vscode.NotebookCellKind.Code) {
      return [];
    }

    const items: (vscode.NotebookCellStatusBarItem | undefined)[] = [
      this.changeContextItem(cell),
      this.openOutputItem(cell),
      this.syntaxModeItem(cell)
    ];
    return items.filter(item => item !== undefined) as vscode.NotebookCellStatusBarItem[];
  }

  changeContextItem(cell: vscode.NotebookCell): vscode.NotebookCellStatusBarItem {
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
      command: Command.changeContext,
      arguments: [cell.index]
    };
    return item;
  }

  openOutputItem(cell: vscode.NotebookCell): vscode.NotebookCellStatusBarItem | undefined {
    if (cell.outputs.length > 0) {
      const item = new vscode.NotebookCellStatusBarItem('$(output) Open output in new tab', vscode.NotebookCellStatusBarAlignment.Left);
      item.tooltip = 'Open the JSON result of the query in a new tab';
      item.command = {
        title: "Open the JSON result of the query in a new tab",
        command: Command.openOutput,
        arguments: [cell.index]
      };
      return item;
    }
  }

  syntaxModeItem(cell: vscode.NotebookCell): vscode.NotebookCellStatusBarItem {
    const extendedSyntax = Utils.doesCellUseExtendedSyntax(cell);
    const text = extendedSyntax ? '$(beaker) Extended Syntax' : '$(workspace-trusted)'
    const item = new vscode.NotebookCellStatusBarItem(text, vscode.NotebookCellStatusBarAlignment.Right);
    item.tooltip = (extendedSyntax ? 'Extended syntax enabled. Click to switch to standard syntax.' : 'Standard syntax enabled. Click to switch to extended syntax.') + ' Default can be set in settings.';
    item.command = {
      title: "Toggle Syntax Mode",
      command: Command.toggleSyntaxMode,
      arguments: [cell.index]
    };
    return item;
  }
}