import { TextDecoder, TextEncoder } from 'util';
import * as vscode from 'vscode';
import jsonPath from './lib/jsonpath'
import path = require('path');

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.workspace.registerNotebookSerializer('jsonpath-notebook', new SampleSerializer())
	);
	context.subscriptions.push(new Controller());
}

interface RawNotebook {
	cells: RawNotebookCell[];
}

interface RawNotebookCell {
	source: string;
	cell_type: 'code' | 'markdown';
	selectedFileUri?: string;
}

class SampleSerializer implements vscode.NotebookSerializer {
	async deserializeNotebook(
		content: Uint8Array,
		_token: vscode.CancellationToken
	): Promise<vscode.NotebookData> {
		var contents = new TextDecoder().decode(content);

		let raw: RawNotebookCell[];
		try {
			raw = (<RawNotebook>JSON.parse(contents)).cells;
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
					item.cell_type === 'code' ? 'JSONPath' : 'markdown',
				)
				cell.metadata = {
					selectedFileUri: item.selectedFileUri
				};
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
				selectedFileUri: cell.metadata?.selectedFileUri
			});
		}

		return new TextEncoder().encode(JSON.stringify(contents));
	}
}


class Controller {
	readonly controllerId = 'jsonpath-notebook-controller-id';
	readonly notebookType = 'jsonpath-notebook';
	readonly label = 'JSONPath Notebook';
	readonly supportedLanguages = ['JSONPath'];

	private readonly _controller: vscode.NotebookController;
	private _executionOrder = 0;

	constructor() {
		this._controller = vscode.notebooks.createNotebookController(
			this.controllerId,
			this.notebookType,
			this.label
		);

		this._controller.supportedLanguages = this.supportedLanguages;
		this._controller.supportsExecutionOrder = true;
		this._controller.executeHandler = this._execute.bind(this);
	}

	private _execute(
		cells: vscode.NotebookCell[],
		_notebook: vscode.NotebookDocument,
		_controller: vscode.NotebookController
	): void {
		for (let cell of cells) {
			this._doExecution(cell);
		}
	}

	private async _doExecution(cell: vscode.NotebookCell): Promise<void> {
		const execution = this._controller.createNotebookCellExecution(cell);
		execution.executionOrder = ++this._executionOrder;
		execution.start(Date.now()); // Keep track of elapsed time to execute cell.

		const inputTabs = vscode.window.tabGroups.all.flatMap(({ tabs }) => tabs.map(tab => tab.input)).filter(input => input instanceof vscode.TabInputText) as vscode.TabInputText[];
		const jsonTabs = inputTabs.filter((input) => path.extname(input.uri.fsPath) === '.json');

		let inputContent = {};
		let selectedFileUri: vscode.Uri | undefined;

		if (cell.metadata.selectedFileUri) {
			selectedFileUri = vscode.Uri.parse(cell.metadata.selectedFileUri);
		}
		else {
			if (jsonTabs.length == 1) {
				selectedFileUri = jsonTabs[0].uri;
			}
			else if (jsonPath.length > 1) {
				const filesMap = new Map(jsonTabs.map(tab => [path.basename(tab.uri.fsPath), tab.uri]));
				const fileNames = Array.from(filesMap.keys());
				const result = await vscode.window.showQuickPick(fileNames, {
					canPickMany: false,
					placeHolder: 'Choose a .json file as input for the query'
				});
				if (result) {
					selectedFileUri = filesMap.get(result);
				}
			}
			else {
				const filePickerOptions: vscode.OpenDialogOptions = {
					title: 'Choose a .json file as input for the query',
					canSelectMany: false,
					filters: {
						'JSON': ['json']
					}
				};

				const result = await vscode.window.showOpenDialog(filePickerOptions);
				if (result && result.length > 0) {
					selectedFileUri = result[0];
				}
			}
		}
		if (selectedFileUri) {
			const document = await vscode.workspace.openTextDocument(selectedFileUri);
			inputContent = JSON.parse(document.getText());
		}

		const result = jsonPath(inputContent, cell.document.getText());

		execution.replaceOutput([
			new vscode.NotebookCellOutput([
				vscode.NotebookCellOutputItem.json(result)
			])
		]);
		execution.end(true, Date.now());
	}

	dispose(): any { }
}