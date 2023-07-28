import * as vscode from 'vscode';
import { Serializer } from './Serializer';
import { EXTENSION_ID, NOTEBOOK_TYPE, openCellOutput, openEmptyNotebook, showChangeContextQuickPick } from './utils';
import { Controller } from './controller';
import { CellStatusProvider } from './CellStatusProvider';


export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.workspace.registerNotebookSerializer(NOTEBOOK_TYPE, new Serializer()),
		new Controller(),
		vscode.commands.registerCommand(`${EXTENSION_ID}.changeContext`, (cellIndex: number) => showChangeContextQuickPick(cellIndex)),
		vscode.commands.registerCommand(`${EXTENSION_ID}.openOutput`, (cellIndex: number) => openCellOutput(cellIndex)),
		vscode.commands.registerCommand(`${EXTENSION_ID}.openEmptyNotebook`, () => openEmptyNotebook()),
		vscode.notebooks.registerNotebookCellStatusBarItemProvider(NOTEBOOK_TYPE, new CellStatusProvider())
	);

	vscode.window.showInformationMessage('JSONPath Notebooks is now active. Create a new .jsonpath-notebook file to start', 'Create new notebook').then(() => openEmptyNotebook());
}