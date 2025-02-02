import { RegexProtocol } from './regex.protocol';

export class RemoveSpacesRegex implements RegexProtocol {
  execute(string: string): string {
    return string.replace(/\s+/g, '');
  }
}
