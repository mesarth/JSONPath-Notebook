import * as vscode from 'vscode';
const path = require('upath');


export const getTestFileUri = (relativePath: string) => {
  const workspacePath = __dirname + '../../../..//src/test/suite/files/';
  return vscode.Uri.file(path.join(workspacePath, relativePath));
};