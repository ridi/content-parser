const normalize = version => {
  if (!/(?:0|[1-9]\d*)(?:\.(?:0|[1-9]\d*)){0,3}/gm.test(version)) {
    return '1.0';
  }
  return version;
};

class Version {
  /**
   * @private
   */
  major;

  /**
   * @private
   */
  minor;

  /**
   * @private
   */
  patch;

  /**
   * Construct Version object with version.
   * @param {string} version
   */
  constructor(version) {
    const component = normalize(version).split('.');
    this.major = parseInt(component[0], 10);
    this.minor = parseInt(component[1] || 0, 10) || 0;
    this.patch = parseInt(component[2] || 0, 10) || 0;
    Object.freeze(this);
  }

  /**
   * Get Version as string
   * @returns {string} version
   */
  toString() {
    return `${this.major}.${this.minor}.${this.patch}`;
  }
}

export default Version;
