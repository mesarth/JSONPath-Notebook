import * as vscode from 'vscode';
import { Utils } from '../../util/utils';
import { ExtensionInfo } from '../../util/ExtensionInfo';
import { expect } from 'chai';
import { Configuration } from '../../util/Configuration';
import { getTestFileUri } from './util';

describe('Path Type Tests', async () => {
	vscode.window.showInformationMessage('Start all tests.');

	beforeEach(async () => {
		//close all open tabs
		await vscode.commands.executeCommand('workbench.action.closeAllEditors');
	});

	it('Utils.getPreferredPathFormatFromUri: Use relative path for file context when useRelativePaths set to true (default)', async () => {
		const notebookUri = getTestFileUri('/notebooks/empty.jsonpath-notebook');
		const notebook = await vscode.workspace.openNotebookDocument(notebookUri);
		await Configuration.useRelativePaths.set(true);
		await vscode.window.showNotebookDocument(notebook);

		const contextUri = getTestFileUri('/input/bookstore.json');

		const expectedPath = '../input/bookstore.json';
		const actualPath = Utils.getPreferredPathFormatFromUri(contextUri);

		expect(actualPath).to.equal(expectedPath);
	});

	it('Utils.getPreferredPathFormatFromUri: Use absolute path for file context when useRelativePaths set to true but no notebook is open', async () => {
		const contextUri = getTestFileUri('/input/bookstore.json');

		const expectedPath = contextUri.path;
		const actualPath = Utils.getPreferredPathFormatFromUri(contextUri);

		expect(actualPath).to.equal(expectedPath);
	});

	it('Utils.getPreferredPathFormatFromUri: Use absolute path for file context when useRelativePaths set to true but is on different drive', async function () {
		if (process.platform !== 'win32') { this.skip(); }

		const notebookUri = getTestFileUri('/notebooks/empty.jsonpath-notebook');
		const notebook = await vscode.workspace.openNotebookDocument(notebookUri);
		await vscode.window.showNotebookDocument(notebook);
		await Configuration.useRelativePaths.set(true);

		const contextUri = vscode.Uri.file('Z:\\input\\bookstore.json');

		const expectedPath = contextUri.path;
		const actualPath = Utils.getPreferredPathFormatFromUri(contextUri);

		expect(actualPath).to.equal(expectedPath);
	});

	it('Utils.getPreferredPathFormatFromUri: Use absolute path for file context when useRelativePaths set to false', async () => {
		const notebookUri = getTestFileUri('/notebooks/empty.jsonpath-notebook');
		const notebook = await vscode.workspace.openNotebookDocument(notebookUri);
		await vscode.window.showNotebookDocument(notebook);
		await Configuration.useRelativePaths.set(false);

		const contextUri = getTestFileUri('/input/bookstore.json');

		const expectedPath = contextUri.path;
		const actualPath = Utils.getPreferredPathFormatFromUri(contextUri);

		expect(actualPath).to.equal(expectedPath);
	});

	it('Utils.getContextUriFromCell: Returns correct uri when metadata selectedFileUri is relative path', async () => {
		const notebookUri = getTestFileUri('/notebooks/empty.jsonpath-notebook');
		const notebook = await vscode.workspace.openNotebookDocument(notebookUri);

		await vscode.window.showNotebookDocument(notebook);

		//add cell with metadata
		const edit = new vscode.WorkspaceEdit();
		const nbEdit = vscode.NotebookEdit.insertCells(0, [{
			kind: vscode.NotebookCellKind.Code,
			languageId: ExtensionInfo.LANGUAGE_ID,
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
		const actualUri = Utils.getContextUriFromCell(cell);
		expect(actualUri).to.deep.equal(expectedUri);
	});

	it('Utils.getContextUriFromCell: Returns correct uri when metadata selectedFileUri is absolute', async () => {
		const notebookUri = getTestFileUri('/notebooks/empty.jsonpath-notebook');
		const notebook = await vscode.workspace.openNotebookDocument(notebookUri);

		await vscode.window.showNotebookDocument(notebook);

		//add cell with metadata
		const edit = new vscode.WorkspaceEdit();
		const nbEdit = vscode.NotebookEdit.insertCells(0, [{
			kind: vscode.NotebookCellKind.Code,
			languageId: ExtensionInfo.LANGUAGE_ID,
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
		const actualUri = Utils.getContextUriFromCell(cell);
		expect(actualUri).to.deep.equal(expectedUri);
	});
});
