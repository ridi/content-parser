/// <reference types="node" />
import CryptoProvider from './CryptoProvider';
import Logger from './Logger';
import type { BaseParserOption } from './BaseParseContext';
import type { BaseReadOption } from './BaseReadContext';
import type { LoggerOption } from './Logger';
import type BaseParseContext from './BaseParseContext';
import type BaseReadContext from './BaseReadContext';
import type BaseBook from './BaseBook';
import type BaseItem from './BaseItem';
export declare type TaskFunctions<T extends BaseParseContext> = ((context: T) => Promise<T>) | ((options?: BaseParserOption | undefined) => Promise<T>) | ((context: T) => Promise<BaseBook>) | ((items: BaseItem[], options?: BaseReadOption | undefined) => Promise<BaseReadContext>) | ((context: BaseReadContext) => Promise<Array<string | Buffer>>) | ((context?: BaseReadContext) => Promise<Array<string | Buffer> | void>);
export interface Task<T extends BaseParseContext> {
    fun: TaskFunctions<T>;
    name: string;
}
declare abstract class Parser<T extends BaseParseContext> {
    static get parseDefaultOptions(): BaseParserOption;
    static get parseOptionTypes(): {
        [key in keyof BaseParserOption]: string;
    };
    static get readDefaultOptions(): BaseReadOption;
    static get readOptionTypes(): {
        [key in keyof BaseReadOption]: string;
    };
    get input(): string;
    get cryptoProvider(): CryptoProvider;
    get logger(): Logger;
    get onProgress(): (step: number, totalStep: number, action: string) => void;
    /**
     * Set callback that tells progress of parse and readItems.
     * @example
     * parser.onProgress = (step, totalStep, action) => {
     *   console.log(`[${action}] ${step} / ${totalStep}`);
     * }
     */
    set onProgress(onProgress: (step: number, totalStep: number, action: string) => void);
    /**
     * Create new Parser
     * @example
     * class FooParser extends Parser {
     *   ...
     * }
     * new FooParser('./foo/bar.zip' or './foo/bar');
     */
    constructor(input: string, cryptoProvider?: CryptoProvider, loggerOptions?: LoggerOption);
    protected abstract getParseContextClass(): T;
    protected abstract getBookClass(): typeof BaseBook;
    protected abstract getReadContextClass(): typeof BaseReadContext | void;
    protected abstract getReadItemClass(): typeof BaseItem | void;
    protected parseBeforeTasks(): Task<T>[];
    protected parseTasks(): Task<T>[];
    protected parseAfterTasks(): Task<T>[];
    parse(options?: BaseParserOption): Promise<BaseBook>;
    protected prepareParse(options?: BaseParserOption): Promise<T>;
    /**
     * Unzipping if zip source and unzipPath option specified
     */
    protected unzipIfNeeded(context: T): Promise<T>;
    protected abstract createBook(context: T): Promise<BaseBook>;
    protected readBeforeTasks(): Task<T>[];
    protected readTasks(): Task<T>[];
    protected readAfterTasks(): Task<T>[];
    readItem(item: BaseItem, options?: BaseReadOption): Promise<(BaseItem[] | BaseReadOption | undefined)>;
    readItems(items: BaseItem[], options?: BaseReadOption): Promise<(BaseItem[] | BaseReadOption | undefined)[]>;
    protected prepareRead(items: BaseItem[], options?: BaseReadOption): Promise<BaseReadContext>;
    abstract read(context?: BaseReadContext): Promise<Array<string | Buffer> | void>;
    protected unzipTasks(): Task<T>[];
    unzip(unzipPath?: string, overwrite?: boolean): Promise<boolean | void>;
}
export default Parser;
