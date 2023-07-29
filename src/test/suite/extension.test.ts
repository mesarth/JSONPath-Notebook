import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { EXTENSION_ID, NOTEBOOK_TYPE } from '../../utils';
// import * as myExtension from '../../extension';

suite('Extension Test Suite', async () => {
	vscode.window.showInformationMessage('Start all tests.');

	suite('Command[openEmptyNotebook]', async () => {
		beforeEach(async () => {
			//close all open tabs
			await vscode.commands.executeCommand('workbench.action.closeAllEditors');
		});

		test('is correct NotebookType', async () => {
			await vscode.commands.executeCommand(`${EXTENSION_ID}.openEmptyNotebook`);
			assert.equal(NOTEBOOK_TYPE, vscode.window.activeNotebookEditor?.notebook.notebookType);
		});

		test('is correct NotebookType', async () => {
			await vscode.commands.executeCommand(`${EXTENSION_ID}.openEmptyNotebook`);
			assert.equal(2, vscode.window.activeNotebookEditor?.notebook.cellCount);
		});
	});
});
