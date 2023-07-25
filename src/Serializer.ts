import * as vscode from 'vscode';
import { TextDecoder, TextEncoder } from 'util';
import { LANGUAGE_ID } from './utils';

interface RawNotebookCell {
  source: string;
  cell_type: 'code' | 'markdown';
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
          item.cell_type === 'code'
            ? vscode.NotebookCellKind.Code
            : vscode.NotebookCellKind.Markup,
          JSON.parse(item.source),
          item.cell_type === 'code' ? LANGUAGE_ID : 'markdown',
        )
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
      console.log(cell);

      contents.push({
        cell_type: cell.kind === vscode.NotebookCellKind.Code ? 'code' : 'markdown',
        source: JSON.stringify(cell.value),
        metadata: cell.metadata
      });
    }

    return new TextEncoder().encode(JSON.stringify(contents));
  }
}