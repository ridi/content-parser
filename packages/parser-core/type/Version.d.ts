export default Version;
declare class Version {
    /**
     * Construct Version object with version.
     * @param  {string} version
     */
    constructor(version: string);
    /**
     * @private
     */
    private major;
    /**
     * @private
     */
    private minor;
    /**
     * @private
     */
    private patch;
    /**
     * Get Version as string
     * @returns {string} version
     */
    toString(): string;
}
