import * as vscode from 'vscode';
import { TextDecoder, TextEncoder } from 'util';
import { Config } from './utils';

interface RawNotebookCell {
  source: string;
  cellType: 'code' | 'markdown';
  metadata?: { [key: string]: any; }
  output?: Object
}

export class Serializer implements vscode.NotebookSerializer {
  async deserializeNotebook(
    content: Uint8Array,
    _token: vscode.CancellationToken
  ): Promise<vscode.NotebookData> {
    var contents = new TextDecoder().decode(content);

    let raw: RawNotebookCell[];
    try {
      raw = (<RawNotebookCell[]>JSON.parse(contents));
    } catch {
      raw = [];
    }

    const cells = raw.map(
      item => {
        const cell = new vscode.NotebookCellData(
          item.cellType === 'code'
            ? vscode.NotebookCellKind.Code
            : vscode.NotebookCellKind.Markup,
          JSON.parse(item.source),
          item.cellType === 'code' ? Config.LANGUAGE_ID : 'markdown',
        );
        cell.metadata = item.metadata;
        if (item.output) {
          cell.outputs = [new vscode.NotebookCellOutput([vscode.NotebookCellOutputItem.json(item.output)])];
        }
        return cell;
      }
    );

    return new vscode.NotebookData(cells);
  }

  async serializeNotebook(
    data: vscode.NotebookData,
    _token: vscode.CancellationToken
  ): Promise<Uint8Array> {
    let contents: RawNotebookCell[] = [];

    for (const cell of data.cells) {
      const outputItem = cell?.outputs?.at(0)?.items[0];
      const rawOutput = outputItem?.mime === 'text/x-json' ? outputItem.data : undefined;
      let output = undefined;
      if (rawOutput) {
        output = JSON.parse(new TextDecoder().decode(rawOutput));
      }

      contents.push({
        cellType: cell.kind === vscode.NotebookCellKind.Code ? 'code' : 'markdown',
        source: JSON.stringify(cell.value),
        metadata: cell.metadata,
        output
      });
    }

    return new TextEncoder().encode(JSON.stringify(contents));
  }
}