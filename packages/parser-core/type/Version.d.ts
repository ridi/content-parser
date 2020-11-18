declare class Version {
    private major;
    private minor;
    private patch;
    constructor(version?: string);
    /**
     * Get Version as string
     * @returns {string} version
     */
    toString(): string;
}
export default Version;
