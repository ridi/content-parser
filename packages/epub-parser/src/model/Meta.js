class Meta {
  constructor(rawObj = {}) {
    this.name = rawObj.name;
    this.content = rawObj.content;
    Object.freeze(this);
  }

  toRaw() {
    return {
      name: this.name,
      content: this.content,
    };
  }
}

export default Meta;
