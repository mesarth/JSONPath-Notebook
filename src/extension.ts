import * as vscode from 'vscode';
import { Serializer } from './Serializer';
import { EXTENSION_ID, NOTEBOOK_TYPE, openCellOutput, showChangeContextQuickPick } from './utils';
import { Controller } from './controller';
import { CellStatusProvider } from './CellStatusProvider';


export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.workspace.registerNotebookSerializer(NOTEBOOK_TYPE, new Serializer())
	);
	context.subscriptions.push(new Controller());
	vscode.notebooks.registerNotebookCellStatusBarItemProvider(NOTEBOOK_TYPE, new CellStatusProvider());
	vscode.commands.registerCommand(`${EXTENSION_ID}.changeContext`, (cellIndex: number) => showChangeContextQuickPick(cellIndex))
	vscode.commands.registerCommand(`${EXTENSION_ID}.openOutput`, (cellIndex: number) => openCellOutput(cellIndex))
}