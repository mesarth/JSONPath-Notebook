import * as vscode from 'vscode';
import { TextDecoder, TextEncoder } from 'util';
import { LANGUAGE_ID } from './utils';

interface RawNotebookCell {
  source: string;
  cellType: 'code' | 'markdown';
  metadata?: { [key: string]: any; }
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
          item.cellType === 'code' ? LANGUAGE_ID : 'markdown',
        );
        cell.metadata = item.metadata;
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
      contents.push({
        cellType: cell.kind === vscode.NotebookCellKind.Code ? 'code' : 'markdown',
        source: JSON.stringify(cell.value),
        metadata: cell.metadata
      });
    }

    return new TextEncoder().encode(JSON.stringify(contents));
  }
}