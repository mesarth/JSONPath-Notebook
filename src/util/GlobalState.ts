import { ExtensionInfo } from './ExtensionInfo';

export class GlobalState {
  static readonly isFirstTimeOpen = `${ExtensionInfo.EXTENSION_ID}:isFirstTimeOpen`;
  static readonly version = `${ExtensionInfo.EXTENSION_ID}:version`;
}