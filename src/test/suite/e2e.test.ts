import * as vscode from 'vscode';
import { expect } from 'chai';
import { Utils } from '../../util/utils';
import { ExtensionInfo } from '../../util/ExtensionInfo';
import { Command } from '../../util/Command';
import { Configuration } from '../../util/Configuration';
import { getTestFileUri } from './util';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

describe('E2E Tests', async () => {
	vscode.window.showInformationMessage('Start all tests.');

	beforeEach(async () => {
		//close all open tabs
		await vscode.commands.executeCommand('workbench.action.closeAllEditors');
	});

	it('Run basic query', async () => {
		const inputDocumentUri = getTestFileUri('/input/bookstore.json');
		await vscode.workspace.openTextDocument(inputDocumentUri);

		//prepare notebook
		const notebookData = new vscode.NotebookData([
			{
				kind: vscode.NotebookCellKind.Code,
				languageId: ExtensionInfo.LANGUAGE_ID,
				value: '$..book[?(@.price<10)]',
				metadata: {
					"selectedFileUri": inputDocumentUri.path
				}
			}
		]);
		const document = await vscode.workspace.openNotebookDocument(ExtensionInfo.NOTEBOOK_TYPE, notebookData);
		await vscode.window.showNotebookDocument(document);

		//execute first cell
		await vscode.commands.executeCommand('notebook.execute', document.uri);

		//delay is needed afaik there is no way to check if a cell is finished executing
		await delay(1000);

		//check output
		const output = new TextDecoder().decode(vscode.window.activeNotebookEditor?.notebook.cellAt(0).outputs[0].items[0].data);

		//get expected output content from  from ./files/output/basic.json
		const expectedDocumentPath = getTestFileUri('output/basic.json');
		const expectedOutput = await vscode.workspace.openTextDocument(expectedDocumentPath);
		const expectedOutputContent = expectedOutput.getText();

		expect(JSON.parse(expectedOutputContent)).to.deep.equal(JSON.parse(output));
	});

	describe('New cell has correct syntax mode', async () => {
		const input = Object.values(Configuration.defaultSyntaxMode.options);
		input.forEach(async (syntaxMode) => {
			it(`New cell has correct syntax mode - ${syntaxMode}`, async () => {
				await Configuration.defaultSyntaxMode.set(syntaxMode);

				await vscode.commands.executeCommand(Command.openNewNotebook);
				await vscode.commands.executeCommand('notebook.cell.insertCodeCellBelow');
				await delay(500);
				const cell = vscode.window.activeNotebookEditor?.notebook.cellAt(0);
				const extendedSyntax = cell?.metadata?.extendedSyntax;

				expect(extendedSyntax).to.equal(syntaxMode === Configuration.defaultSyntaxMode.options.extended);
			});
		});
	});

	describe('Cell execution respects syntax mode', async () => {
		const input = [true, false];
		input.forEach(async (extendedSyntax) => {
			it(`Cell execution respects syntax mode - ${extendedSyntax}`, async () => {
				const uri = getTestFileUri('/notebooks/extendedSyntax.jsonpath-notebook');
				const document = await vscode.workspace.openNotebookDocument(uri);

				await vscode.window.showNotebookDocument(document);
				const cell = vscode.window.activeNotebookEditor?.notebook.cellAt(0);
				await Utils.updateCellMetadata(0, { extendedSyntax });
				await vscode.commands.executeCommand('notebook.execute', document.uri);
				await delay(500);

				const success = cell?.executionSummary?.success;
				expect(success).to.equal(extendedSyntax);
			});
		});
	});
});
