import { ExtensionInfo } from './ExtensionInfo';

export class Command {
  static readonly changeContext = ExtensionInfo.EXTENSION_ID + '.changeContext';
  static readonly openOutput = ExtensionInfo.EXTENSION_ID + '.openOutput';
  static readonly openNewNotebook = ExtensionInfo.EXTENSION_ID + '.openNewNotebook';
  static readonly getContext = ExtensionInfo.EXTENSION_ID + '.getContext';
  static readonly toggleSyntaxMode = ExtensionInfo.EXTENSION_ID + '.toggleSyntaxMode';
  static readonly welcome = ExtensionInfo.EXTENSION_ID + '.welcome';
}