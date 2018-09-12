class Version {
  get isValid() { return this.major === 2; }

  constructor(string) {
    if (!/(?:0|[1-9]\d*)(?:\.(?:0|[1-9]\d*)){0,3}/gm.test(string)) {
      string = '2.0';
    }
    const result = string.split('.');
    this.major = parseInt(result[0], 10);
    this.minor = parseInt(result[1] || 0, 10) || 0;
    this.patch = parseInt(result[2] || 0, 10) || 0;
  }

  toString() {
    return `${this.major}.${this.minor}.${this.patch}`;
  }
}

export default Version;
