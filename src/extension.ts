import * as vscode from 'vscode';
import { Serializer } from './Serializer';
import { Config, Utils } from './utils';
import { Controller } from './Controller';
import { CellStatusProvider } from './CellStatusProvider';


export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.workspace.registerNotebookSerializer(Config.NOTEBOOK_TYPE, new Serializer()),
		new Controller(),
		vscode.commands.registerCommand(`${Config.EXTENSION_ID}.changeContext`, (cellIndex: number) => Utils.showChangeContextQuickPick(cellIndex)),
		vscode.commands.registerCommand(`${Config.EXTENSION_ID}.openOutput`, (cellIndex: number) => Utils.openCellOutput(cellIndex)),
		vscode.commands.registerCommand(`${Config.EXTENSION_ID}.openNewNotebook`, () => Utils.openNewNotebook()),
		vscode.commands.registerCommand(`${Config.EXTENSION_ID}.getContext`, () => context),
		vscode.commands.registerCommand(`${Config.EXTENSION_ID}.toggleSyntaxMode`, (cellIndex: number) => Utils.toggleSyntaxMode(cellIndex)),

		vscode.notebooks.registerNotebookCellStatusBarItemProvider(Config.NOTEBOOK_TYPE, new CellStatusProvider())
	);
	Utils.showFirstTimeInfo();
}