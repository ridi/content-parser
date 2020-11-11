export default BaseReadContext;
export type BaseReadOption = {
    force: boolean;
};
export type BaseReadOptionType = {
    force: string;
};
/**
  * @typedef {Object} BaseReadOption
  * @property {boolean} force
  *
  * @typedef {Object} BaseReadOptionType
  * @property {string} force
  */
declare class BaseReadContext {
    /**
     * @pblic
     * @type {BaseReadOption}
     */
    options: BaseReadOption;
    /**
     * @public
     * @type {import('./readEntries').ReadEntriesReturnType[]}
     */
    public entries: import('./readEntries').ReadEntriesReturnType[];
    /**
     * @public
     * @type {Array<import('./BaseBook').default>}
     */
    public items: Array<import('./BaseBook').default>;
}
