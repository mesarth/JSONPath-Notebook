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

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

describe('Path Type Tests', async () => {
	vscode.window.showInformationMessage('Start all tests.');

	beforeEach(async () => {
		//close all open tabs
		await vscode.commands.executeCommand('workbench.action.closeAllEditors');
	});

	it('getPreferredPathFormatFromUri: Use relative path for file context when useRelativePaths set to true (default)', async () => {

	});

	it('getPreferredPathFormatFromUri: Use absolute path for file context when useRelativePaths set to true but is on different drive', async () => {

	});

	it('getPreferredPathFormatFromUri: Use absolute path for file context when useRelativePaths set to false', async () => {

	});

	it('getContextUriFromCell: Returns correct uri when metadata selectedFileUri is relative path', async () => {

	});

	it('getContextUriFromCell: Returns correct uri when metadata selectedFileUri is absolute', async () => {

	});
});
