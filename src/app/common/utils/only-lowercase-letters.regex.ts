import { RegexProtocol } from './regex.protocol';

export class OnlyLowercaseLettersRegex implements RegexProtocol {
  execute(string: string): string {
    return string.replace(/[^a-z]/g, '');
  }
}
