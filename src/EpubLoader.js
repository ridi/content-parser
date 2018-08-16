const privateProps = new WeakMap();

class EpubLoader {
  static get defaultOptions() {
    return {};
  }

  static get defaultOptionTypes() {
    return {};
  }

  get input() { return privateProps.get(this).input; }

  get options() { return privateProps.get(this).options; }

  constructor(input, options = {}) {
    privateProps.set(this, { input, options });
  }

  readText(item, encoding = 'utf8') {

  }

  readData(item) {

  }
}

export default EpubLoader;
