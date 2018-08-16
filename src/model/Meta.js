class Meta {
  constructor(rawObj) {
    this.name = rawObj.name;
    this.content = rawObj.content;
    Object.freeze(this);
  }
}

export default Meta;
