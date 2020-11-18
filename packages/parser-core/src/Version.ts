class Version {
  private major: number;

  private minor: number;

  private patch: number;

  constructor(version = '1.0') {
    if (!/(?:0|[1-9]\d*)(?:\.(?:0|[1-9]\d*)){0,3}/gm.test(version)) {
      version = '1.0';
    }
    const result = version.split('.');
    this.major = parseInt(result[0], 10);
    this.minor = parseInt(result[1] || '0', 10) || 0;
    this.patch = parseInt(result[2] || '0', 10) || 0;
    Object.freeze(this);
  }

  /**
   * Get Version as string
   */
  toString(): string {
    return `${this.major}.${this.minor}.${this.patch}`;
  }
}

export default Version;
