import * as vscode from 'vscode';
import { Serializer } from './Serializer';
import { Utils } from './util/utils';
import { ExtensionInfo } from './util/ExtensionInfo';
import { Controller } from './Controller';
import { CellStatusProvider } from './CellStatusProvider';
import { QuickPickUtil } from './util/QuickPickUtil';
import { Command } from './util/Command';


export async function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.workspace.registerNotebookSerializer(ExtensionInfo.NOTEBOOK_TYPE, new Serializer()),
		new Controller(),
		vscode.commands.registerCommand(Command.changeContext, (cellIndex: number) => QuickPickUtil.showChangeContextQuickPick(cellIndex)),
		vscode.commands.registerCommand(Command.openOutput, (cellIndex: number) => Utils.openCellOutput(cellIndex)),
		vscode.commands.registerCommand(Command.openNewNotebook, () => Utils.openNewNotebook()),
		vscode.commands.registerCommand(Command.getContext, () => context),
		vscode.commands.registerCommand(Command.toggleSyntaxMode, (cellIndex: number) => Utils.toggleSyntaxMode(cellIndex)),
		vscode.commands.registerCommand(Command.welcome, () => vscode.commands.executeCommand('workbench.action.openWalkthrough', `${ExtensionInfo.PUBLISHER}.${ExtensionInfo.EXTENSION_ID}#jsonpathNotebookWelcome`)),

		vscode.notebooks.registerNotebookCellStatusBarItemProvider(ExtensionInfo.NOTEBOOK_TYPE, new CellStatusProvider())
	);

	await Utils.showWalkthrough();
	await Utils.updateVersionState();

	await Utils.registerNotebookChangeListener();
}