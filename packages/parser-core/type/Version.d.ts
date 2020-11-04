export default Version;
declare class Version {
    /**
     * Construct Version object with version.
     * @param  {string} version
     */
    constructor(version: string);
    major: number;
    minor: number;
    patch: number;
    /**
     * Get Version as string
     * @returns {string} version
     */
    toString(): string;
}
