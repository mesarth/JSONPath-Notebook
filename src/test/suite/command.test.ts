// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { assert, expect } from 'chai';
import { Config, Utils } from '../../utils';
import { getTestFileUri } from './util';
// import * as myExtension from '../../extension';

describe('Command Tests', async () => {
	vscode.window.showInformationMessage('Start all tests.');

	beforeEach(async () => {
		//close all open tabs
		await vscode.commands.executeCommand('workbench.action.closeAllEditors');
	});

	describe('openNewNotebook', async () => {
		it('is correct NotebookType', async () => {
			await vscode.commands.executeCommand(`${Config.EXTENSION_ID}.openNewNotebook`);
			assert.equal(Config.NOTEBOOK_TYPE, vscode.window.activeNotebookEditor?.notebook.notebookType);
		});
	});

	it('openOutput', async () => {
		const uri = getTestFileUri('/notebooks/cellOutput.jsonpath-notebook');
		const document = await vscode.workspace.openNotebookDocument(uri);

		await vscode.window.showNotebookDocument(document);

		const cell = vscode.window.activeNotebookEditor?.notebook.cellAt(0);
		const output = JSON.parse(new TextDecoder().decode(cell?.outputs?.at(0)?.items?.at(0)?.data));

		await vscode.commands.executeCommand(`${Config.EXTENSION_ID}.openOutput`, 0);
		const openedOutput = JSON.parse(vscode.window.activeTextEditor?.document.getText() ?? "null");
		expect(openedOutput).to.deep.equal(output);
	});


	describe('toggleSyntaxMode', async () => {
		const input = [true, false];
		input.forEach(async (extendedSyntax) => {
			it(`toggles syntax mode - extendedSyntax: ${extendedSyntax}`, async () => {
				//prepare notebook
				const inputDocumentUri = getTestFileUri('/input/bookstore.json');
				const notebookData = new vscode.NotebookData([
					{
						kind: vscode.NotebookCellKind.Code,
						languageId: Config.LANGUAGE_ID,
						value: '$..book[?(@.price<10)]',
						metadata: {
							"selectedFileUri": inputDocumentUri.path,
							extendedSyntax
						}
					}
				]);
				const document = await vscode.workspace.openNotebookDocument(Config.NOTEBOOK_TYPE, notebookData);
				await vscode.window.showNotebookDocument(document);

				const cell = vscode.window.activeNotebookEditor?.notebook.cellAt(0);
				expect(cell?.metadata?.extendedSyntax).to.equal(extendedSyntax);
				await vscode.commands.executeCommand(`${Config.EXTENSION_ID}.toggleSyntaxMode`, 0);
				expect(cell?.metadata?.extendedSyntax).to.not.equal(extendedSyntax);
			});
		});
	});

	describe('walkthrough', async () => {
		const input = [[undefined, undefined, true], [undefined, '2.0.0', false], [false, undefined, false], [false, '2.0.0', false]];

		input.forEach(([isFirstTimeOpen, version, shouldOpen]) => it(`shows walkthrough - firstTimeOpen: ${isFirstTimeOpen}, version: ${version}`, async () => {
			const context = await Utils.getContext();
			context.globalState.update(`${Config.EXTENSION_ID}:isFirstTimeOpen`, isFirstTimeOpen);
			context.globalState.update(`${Config.EXTENSION_ID}:version`, version);

			await Utils.showWalkthrough();

			//check if walkthrough is open
			const isOpen = vscode.window.tabGroups.all.flatMap(group => group.tabs).flatMap(tab => tab.label).includes('Welcome');
			expect(isOpen).to.equal(shouldOpen);
		}));
	});
});
