// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { assert, expect } from 'chai';
import { EXTENSION_ID, LANGUAGE_ID, NOTEBOOK_TYPE } from '../../utils';
import path = require('path');
// import * as myExtension from '../../extension';

const getTestFileUri = (relativePath: string) => {
	const workspacePath = __dirname + '../../../..//src/test/suite/files/';
	return vscode.Uri.file(path.join(workspacePath, relativePath));
};

describe('Extension Test Suite', async () => {
	vscode.window.showInformationMessage('Start all tests.');

	beforeEach(async () => {
		//close all open tabs
		await vscode.commands.executeCommand('workbench.action.closeAllEditors');
	});

	describe('Command[openNewNotebook]', async () => {
		it('is correct NotebookType', async () => {
			await vscode.commands.executeCommand(`${EXTENSION_ID}.openNewNotebook`);
			assert.equal(NOTEBOOK_TYPE, vscode.window.activeNotebookEditor?.notebook.notebookType);
		});

		it('is correct Notebook', async () => {
			await vscode.commands.executeCommand(`${EXTENSION_ID}.openNewNotebook`);
			assert.equal(2, vscode.window.activeNotebookEditor?.notebook.cellCount);
		});
	});

	it('Run basic query', async () => {
		const inputDocumentUri = getTestFileUri('/input/bookstore.json');
		await vscode.workspace.openTextDocument(inputDocumentUri);

		//prepare notebook
		const notebookData = new vscode.NotebookData([
			{
				kind: vscode.NotebookCellKind.Code,
				languageId: LANGUAGE_ID,
				value: '$..book[?(@.price<10)]',
				metadata: {
					"selectedFileUri": inputDocumentUri.path
				}
			}
		]);
		const document = await vscode.workspace.openNotebookDocument(NOTEBOOK_TYPE, notebookData);
		await vscode.window.showNotebookDocument(document);

		//execute first cell
		await vscode.commands.executeCommand('notebook.execute', document.uri);

		//delay is needed afaik there is no way to check if a cell is finished executing
		const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
		await delay(1000);

		//check output
		const output = new TextDecoder().decode(vscode.window.activeNotebookEditor?.notebook.cellAt(0).outputs[0].items[0].data);

		//get expected output content from  from ./files/output/basic.json
		const expectedDocumentPath = getTestFileUri('output/basic.json');
		const expectedOutput = await vscode.workspace.openTextDocument(expectedDocumentPath);
		const expectedOutputContent = expectedOutput.getText();

		expect(JSON.parse(expectedOutputContent)).to.deep.equal(JSON.parse(output));
	});
});
