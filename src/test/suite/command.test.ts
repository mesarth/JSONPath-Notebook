// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { assert, expect } from 'chai';
import { EXTENSION_ID, LANGUAGE_ID, NOTEBOOK_TYPE, getContext } from '../../utils';
import path = require('path');
// import * as myExtension from '../../extension';

const getTestFileUri = (relativePath: string) => {
	const workspacePath = __dirname + '../../../..//src/test/suite/files/';
	return vscode.Uri.file(path.join(workspacePath, relativePath));
};

describe('Command Tests', async () => {
	vscode.window.showInformationMessage('Start all tests.');

	beforeEach(async () => {
		//close all open tabs
		await vscode.commands.executeCommand('workbench.action.closeAllEditors');
	});

	describe('openNewNotebook', async () => {
		it('is correct NotebookType', async () => {
			await vscode.commands.executeCommand(`${EXTENSION_ID}.openNewNotebook`);
			assert.equal(NOTEBOOK_TYPE, vscode.window.activeNotebookEditor?.notebook.notebookType);
		});

		it('is correct Notebook - first time', async () => {
			(await getContext()).globalState.update('jsonpath-notebook:isFirstTimeOpen', true);
			await vscode.commands.executeCommand(`${EXTENSION_ID}.openNewNotebook`);
			assert.equal(2, vscode.window.activeNotebookEditor?.notebook.cellCount);
		});

		it('is correct Notebook - not first time', async () => {
			(await getContext()).globalState.update('jsonpath-notebook:isFirstTimeOpen', false);
			await vscode.commands.executeCommand(`${EXTENSION_ID}.openNewNotebook`);
			assert.equal(0, vscode.window.activeNotebookEditor?.notebook.cellCount);
		});
	});

	it('openOutput', async () => {
		const uri = getTestFileUri('/notebooks/cellOutput.jsonpath-notebook');
		const document = await vscode.workspace.openNotebookDocument(uri);

		await vscode.window.showNotebookDocument(document);

		const cell = vscode.window.activeNotebookEditor?.notebook.cellAt(0);
		const output = JSON.parse(new TextDecoder().decode(cell?.outputs?.at(0)?.items?.at(0)?.data));

		await vscode.commands.executeCommand(`${EXTENSION_ID}.openOutput`, 0);
		const openedOutput = JSON.parse(vscode.window.activeTextEditor?.document.getText() ?? "null");
		expect(openedOutput).to.deep.equal(output);
	});
});
