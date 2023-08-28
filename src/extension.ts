import * as vscode from 'vscode';
import { Serializer } from './Serializer';
import { EXTENSION_ID, NOTEBOOK_TYPE, openCellOutput, openNewNotebook, showChangeContextQuickPick, showFirstTimeInfo } from './utils';
import { Controller } from './Controller';
import { CellStatusProvider } from './CellStatusProvider';


export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.workspace.registerNotebookSerializer(NOTEBOOK_TYPE, new Serializer()),
		new Controller(),
		vscode.commands.registerCommand(`${EXTENSION_ID}.changeContext`, (cellIndex: number) => showChangeContextQuickPick(cellIndex)),
		vscode.commands.registerCommand(`${EXTENSION_ID}.openOutput`, (cellIndex: number) => openCellOutput(cellIndex)),
		vscode.commands.registerCommand(`${EXTENSION_ID}.openNewNotebook`, () => openNewNotebook()),
		vscode.commands.registerCommand(`${EXTENSION_ID}.getContext`, () => context),
		vscode.notebooks.registerNotebookCellStatusBarItemProvider(NOTEBOOK_TYPE, new CellStatusProvider())
	);
	showFirstTimeInfo();
}