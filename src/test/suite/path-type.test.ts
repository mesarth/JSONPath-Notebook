// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { LANGUAGE_ID, NOTEBOOK_TYPE, getContextUriFromCell, getPreferredPathFormatFromUri } from '../../utils';
import { expect } from 'chai';
const path = require('upath');
// import * as myExtension from '../../extension';

const getTestFileUri = (relativePath: string) => {
	const workspacePath = __dirname + '../../../..//src/test/suite/files/';
	return vscode.Uri.file(path.join(workspacePath, relativePath));
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

describe('Path Type Tests', async () => {
	vscode.window.showInformationMessage('Start all tests.');

	beforeEach(async () => {
		//close all open tabs
		await vscode.commands.executeCommand('workbench.action.closeAllEditors');
	});

	it('getPreferredPathFormatFromUri: Use relative path for file context when useRelativePaths set to true (default)', async () => {
		const notebookUri = getTestFileUri('/notebooks/empty.jsonpath-notebook');
		const notebook = await vscode.workspace.openNotebookDocument(notebookUri);
		await vscode.workspace.getConfiguration('jsonpath-notebook').update('useRelativePaths', true, true);
		await vscode.window.showNotebookDocument(notebook);

		const contextUri = getTestFileUri('/input/bookstore.json');

		const expectedPath = '../input/bookstore.json';
		const actualPath = getPreferredPathFormatFromUri(contextUri);

		expect(actualPath).to.equal(expectedPath);
	});

	it('getPreferredPathFormatFromUri: Use absolute path for file context when useRelativePaths set to true but no notebook is open', async () => {
		const contextUri = getTestFileUri('/input/bookstore.json');

		const expectedPath = contextUri.path;
		const actualPath = getPreferredPathFormatFromUri(contextUri);

		expect(actualPath).to.equal(expectedPath);
	});

	it('getPreferredPathFormatFromUri: Use absolute path for file context when useRelativePaths set to true but is on different drive', async function () {
		if (process.platform !== 'win32') { this.skip(); }

		const notebookUri = getTestFileUri('/notebooks/empty.jsonpath-notebook');
		const notebook = await vscode.workspace.openNotebookDocument(notebookUri);
		await vscode.window.showNotebookDocument(notebook);
		await vscode.workspace.getConfiguration('jsonpath-notebook').update('useRelativePaths', true, true);

		const contextUri = vscode.Uri.file('C:\\input\\bookstore.json');

		const expectedPath = contextUri.path;
		const actualPath = getPreferredPathFormatFromUri(contextUri);

		expect(actualPath).to.equal(expectedPath);
	});

	it('getPreferredPathFormatFromUri: Use absolute path for file context when useRelativePaths set to false', async () => {
		const notebookUri = getTestFileUri('/notebooks/empty.jsonpath-notebook');
		const notebook = await vscode.workspace.openNotebookDocument(notebookUri);
		await vscode.window.showNotebookDocument(notebook);
		await vscode.workspace.getConfiguration('jsonpath-notebook').update('useRelativePaths', false, true);

		const contextUri = getTestFileUri('/input/bookstore.json');

		const expectedPath = contextUri.path;
		const actualPath = getPreferredPathFormatFromUri(contextUri);

		expect(actualPath).to.equal(expectedPath);
	});

	it('getContextUriFromCell: Returns correct uri when metadata selectedFileUri is relative path', async () => {
		const notebookUri = getTestFileUri('/notebooks/empty.jsonpath-notebook');
		const notebook = await vscode.workspace.openNotebookDocument(notebookUri);

		await vscode.window.showNotebookDocument(notebook);

		//add cell with metadata
		const edit = new vscode.WorkspaceEdit();
		const nbEdit = vscode.NotebookEdit.insertCells(0, [{
			kind: vscode.NotebookCellKind.Code,
			languageId: LANGUAGE_ID,
			value: '$..book[?(@.price<10)]',
			metadata: {
				"selectedFileUri": "../input/bookstore.json"
			}
		}]);
		edit.set(notebook.uri, [nbEdit]);
		await vscode.workspace.applyEdit(edit);

		const cell = notebook.cellAt(0);
		if (!cell) { return; }
		const expectedUri = getTestFileUri('/input/bookstore.json');
		const actualUri = getContextUriFromCell(cell);
		expect(actualUri).to.deep.equal(expectedUri);
	});

	it('getContextUriFromCell: Returns correct uri when metadata selectedFileUri is absolute', async () => {
		const notebookUri = getTestFileUri('/notebooks/empty.jsonpath-notebook');
		const notebook = await vscode.workspace.openNotebookDocument(notebookUri);

		await vscode.window.showNotebookDocument(notebook);

		//add cell with metadata
		const edit = new vscode.WorkspaceEdit();
		const nbEdit = vscode.NotebookEdit.insertCells(0, [{
			kind: vscode.NotebookCellKind.Code,
			languageId: LANGUAGE_ID,
			value: '$..book[?(@.price<10)]',
			metadata: {
				"selectedFileUri": getTestFileUri('/input/bookstore.json').path
			}
		}]);
		edit.set(notebook.uri, [nbEdit]);
		await vscode.workspace.applyEdit(edit);

		const cell = notebook.cellAt(0);
		if (!cell) { return; }
		const expectedUri = getTestFileUri('/input/bookstore.json');
		const actualUri = getContextUriFromCell(cell);
		expect(actualUri).to.deep.equal(expectedUri);
	});
});
