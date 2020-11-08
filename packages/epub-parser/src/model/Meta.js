/**
 * @typedef {Object} MetaParam
 * @property {string} [name]
 * @property {string} [content]
 */
class Meta {
  /**
   * @type {string}
   */
  name;

  /**
   * @type {string}
   */
  content;

  /**
   * @param {MetaParam} rawObj
   */
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
