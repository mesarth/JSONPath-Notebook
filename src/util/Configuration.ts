import { ExtensionInfo } from './ExtensionInfo';
import * as vscode from 'vscode';

const SyntaxMode = {
  standard: 'Standard syntax',
  extended: 'Extended syntax'
}


export class Configuration {
  static useRelativePaths = {
    id: 'useRelativePaths',
    default: true,
    async set(value: boolean) {
      return await vscode.workspace.getConfiguration(ExtensionInfo.EXTENSION_ID).update(this.id, value);
    },
    get(): boolean {
      return vscode.workspace.getConfiguration(ExtensionInfo.EXTENSION_ID).get<boolean>(this.id, this.default);
    }
  }

  static defaultSyntaxMode = {
    id: 'defaultSyntaxMode',
    options: SyntaxMode,
    default: SyntaxMode.standard,
    async set(value: string) {
      return await vscode.workspace.getConfiguration(ExtensionInfo.EXTENSION_ID).update(this.id, value);
    },
    get() {
      return vscode.workspace.getConfiguration(ExtensionInfo.EXTENSION_ID).get<string>(this.id, this.default);
    }
  }
}