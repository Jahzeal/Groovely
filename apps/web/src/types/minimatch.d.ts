declare module 'minimatch' {
  export interface IMinimatch {
    pattern: string;
    options: any;
    set: any[][];
    regexp: RegExp;
    negate: boolean;
    comment: boolean;
    empty: boolean;
    makeRe(): RegExp;
    match(fname: string): boolean;
    matchOne(fileArray: string[], patternArray: string[], partial: boolean): boolean;
  }

  export function minimatch(target: string, pattern: string, options?: any): boolean;
  export function filter(pattern: string, options?: any): (element: string, indexed: number, array: string[]) => boolean;
  export function match(list: string[], pattern: string, options?: any): string[];
  export function makeRe(pattern: string, options?: any): RegExp;

  export class Minimatch implements IMinimatch {
    constructor(pattern: string, options?: any);
    pattern: string;
    options: any;
    set: any[][];
    regexp: RegExp;
    negate: boolean;
    comment: boolean;
    empty: boolean;
    makeRe(): RegExp;
    match(fname: string): boolean;
    matchOne(fileArray: string[], patternArray: string[], partial: boolean): boolean;
  }

  export default minimatch;
}
