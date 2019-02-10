import { should, assert } from 'chai';
import path from 'path';

import CryptoProvider from '../src/CryptoProvider';
import Errors from '../src/errors';
import Parser from '../src/Parser';
import Paths from '../../../test/paths';
import { isString } from '../src/typecheck';

should(); // Initialize should

class TestCryptoProvider extends CryptoProvider {}

class Item {
  constructor(rawObj) {
    Object.getOwnPropertyNames(rawObj).forEach(name => {
      this[name] = rawObj[name];
    });
  }
}

class TestParser extends Parser {
  _getParseContextClass() { return Object; }
  _getBookClass() { return Object; }
  _getReadContextClass() { return Object; }
  _getReadItemClass() { return Item; }
  async _read(context) {
    const { items, entries, options } = context;
    const results = [];
    await items.reduce((prevPromise, item) => {
      return prevPromise.then(async () => {
        const entry = entries.find(item.path);
        const file = await entry.getFile();
        results.push(file);
      });
    }, Promise.resolve());
    return results;
  }
}

describe('Parser', () => {
  describe('Initialize test', () => {
    const zipPath = Paths.DEFAULT;
    const unzippedPath = Paths.UNZIPPED_DEFAULT;
    const cryptoProvider = new TestCryptoProvider();
    const loggerNamespace = 'LoggerNamespace';
  
    it('Input is file path', () => {
      const parser = new Parser(zipPath);
      parser.input.should.be.equal(zipPath);
      assert(parser.cryptoProvider === undefined);
      parser.logger.should.be.not.null;
      parser.logger.namespace.should.equal(Parser.name);
    });
  
    it('Input is directory path', () => {
      const parser = new Parser(unzippedPath);
      parser.input.should.be.equal(unzippedPath);
      assert(parser.cryptoProvider === undefined);
      parser.logger.should.be.not.null;
      parser.logger.namespace.should.equal(Parser.name);
    });
  
    it('with cryptoProvider', () => {
      const parser = new Parser(zipPath, cryptoProvider);
      parser.input.should.be.equal(zipPath);
      parser.cryptoProvider.should.equal(cryptoProvider);
      parser.logger.should.be.not.null;
      parser.logger.namespace.should.equal(Parser.name);
    });
  
    it('with loggerName', () => {
      const parser = new Parser(zipPath, cryptoProvider, loggerNamespace);
      parser.input.should.be.equal(zipPath);
      parser.cryptoProvider.should.equal(cryptoProvider);
      parser.logger.should.be.not.null;
      parser.logger.namespace.should.equal(loggerNamespace);
    });
  
    it('Set onProgress', () => {
      const parser = new TestParser(Paths.DEFAULT);
      parser.onProgress = (step, totalStep, action) => {
        Number.isInteger(step).should.be.true;
        Number.isInteger(totalStep).should.be.true;
        isString(action).should.be.true;
      };
      return parser.parse();
    });
  
    describe('Error situation', () => {
      it('Input required', () => {
        try { new Parser(); } catch (err) { err.code.should.equal(Errors.EINVAL.code); }
      });

      it('Input must be string type', () => {
        try { new Parser([]); } catch (err) { err.code.should.equal(Errors.EINVAL.code); }
      });

      it('No such file or directory', () => {
        try { new Parser('./test/res/test'); } catch (err) { err.code.should.equal(Errors.ENOENT.code); }
      });
  
      it('Input must be CryptoProvider subclassing type', () => {
        try { new Parser(zipPath, []); } catch (err) { err.code.should.equal(Errors.EINVAL.code); }
      });
  
      it('onProgress must be function type', () => {
        const parser = new Parser(Paths.DEFAULT);
        try { parser.onProgress = 5; } catch (err) { err.code.should.equal(Errors.EINVAL.code); }
      });

      it('Subclass required', done => {
        const parser = new Parser(Paths.DEFAULT);
        try { parser._getParseContextClass(); } catch (err) { err.code.should.equal(Errors.EINTR.code); }
        try { parser._getBookClass(); } catch (err) { err.code.should.equal(Errors.EINTR.code); }
        try { parser._getReadContextClass(); } catch (err) { err.code.should.equal(Errors.EINTR.code); }
        try { parser._getReadItemClass(); } catch (err) { err.code.should.equal(Errors.EINTR.code); }
        (async () => {
          try { await parser._read(); } catch (err) {
            err.code.should.equal(Errors.EINTR.code);
            done();
          }
        })();
      });

      it('Parameter values received from constructor can not be changed', () => {
        (() => {
          const parser = new Parser(Paths.DEFAULT);
          parser.input = Paths.UNZIPPED_DEFAULT;
          parser.cryptoProvider = new TestCryptoProvider();
          parser.logger = undefined;
        }).should.throw(/Cannot set property/gi);
      });
    });
  });

  const unzipPath = path.join('.', 'temp');

  describe('Parsing test', () => {
    it('Parse with default options from file', () => {
      return new TestParser(Paths.DEFAULT).parse();
    });

    it('Parse with default options from directory', () => {
      return new TestParser(Paths.UNZIPPED_DEFAULT).parse();
    });

    it('Use unzipPath option', () => {
      const parser = new TestParser(Paths.DEFAULT);
      parser.input.should.equal(Paths.DEFAULT);
      return parser.parse({ unzipPath }).catch(err => {
        err.code.should.equal(Errors.EINVAL.code);
      }).then(() => {
        parser.input.should.equal(unzipPath);
      });
    });

    describe('Error situation', () => {
      it('Invalid options', () => {
        return new TestParser(Paths.DEFAULT).parse({ i_am_invalid_option: true }).catch(err => {
          err.code.should.equal(Errors.EINVAL.code);
        });
      });
    
      it('Invalid option value (Type mismatch)', () => {
        return new TestParser(Paths.DEFAULT).parse({ unzipPath: true }).catch(err => {
          err.code.should.equal(Errors.EINVAL.code);
        });
      });

      it('First task must be Parser._prepareParse', () => {
        const parser = new TestParser(Paths.DEFAULT);
        parser._parseBeforeTasks()[0].fun.should.equal(parser._prepareParse);
      });

      it('Last task must be Parser._createBook', () => {
        const parser = new TestParser(Paths.DEFAULT);
        parser._parseAfterTasks()[parser._parseAfterTasks().length - 1].fun.should.equal(parser._createBook);
      });
    });
  });

  describe('Reading test', () => {
    it('Read single item from file', () => {
      return new TestParser(Paths.DEFAULT).readItem(new Item({ path: 'mimetype' })).then(result => {
        assert(result !== undefined);
      });
    });

    it('Read multiple items from file', () => {
      return new TestParser(Paths.DEFAULT).readItems([new Item({ path: 'mimetype' }), new Item({ path: 'mimetype' })]).then(results => {
        results.length.should.equal(2);
      });
    });

    it('Read single item from directory', () => {
      return new TestParser(Paths.UNZIPPED_DEFAULT).readItem(new Item({ path: 'mimetype' })).then(result => {
        assert(result !== undefined);
      });
    });

    it('Read multiple items from directory', () => {
      return new TestParser(Paths.UNZIPPED_DEFAULT).readItems([new Item({ path: 'mimetype' }), new Item({ path: 'mimetype' })]).then(results => {
        results.length.should.equal(2);
      });
    });

    it('Use force option', () => {
      return new TestParser(Paths.DEFAULT).readItem({ path: 'mimetype' }, { force: true }).then(result => {
        assert(result !== undefined);
      });
    });

    describe('Error situation', () => {
      it('Invalid options', () => {
        return new TestParser(Paths.DEFAULT).readItem({}, { i_am_invalid_option: true }).catch(err => {
          err.code.should.equal(Errors.EINVAL.code);
        });
      });
    
      it('Invalid option value (Type mismatch)', () => {
        return new TestParser(Paths.DEFAULT).readItem({}, { force: 'true' }).catch(err => {
          err.code.should.equal(Errors.EINVAL.code);
        });
      });

      it('First task must be Parser._prepareRead', () => {
        const parser = new TestParser(Paths.DEFAULT);
        parser._readBeforeTasks()[0].fun.should.equal(parser._prepareRead);
      });

      it('Item must be Parser._getReadItemClass type', () => {
        return new TestParser(Paths.DEFAULT).readItem({ path: './test' }).catch(err => {
          err.code.should.equal(Errors.EINVAL.code);
        });
      });
    });
  });
});
