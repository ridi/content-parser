import { should } from 'chai';

import Logger, { LogLevel } from '../src/Logger';

should(); // Initialize should

let current;

class Test {
  async run(...args) {
    const result = await new Promise(resolve => {
      setTimeout(() => {
        resolve(args);
      }, 50);
    });
    return result;
  }

  runSync(...args) {
    return args;
  }
}

describe('Logger', () => {
  const logNames = ['log', 'info', 'warn', 'error', 'debug'];
  const origin = {
    log: (log => log)(console.log),
    info: (info => info)(console.info),
    warn: (warn => warn)(console.warn),
    error: (error => error)(console.error),
    debug: (debug => debug)(console.debug),
  };

  before(() => {
    logNames.forEach(name => {
      console[name] = (...args) => {
        origin[name](...args);
        current = args.join(' ');
      };
    });
  });

  after(() => {
    logNames.forEach(name => {
      console[name] = origin[name];
    });
  });

  describe('Initialize test', () => {
    const defaultLogLevel = LogLevel.WARN;
    it('No parms', () => {
      const logger = new Logger();
      logger.namespace.should.equal(Logger.name);
      logger.logLevel.should.equal(defaultLogLevel);
    });

    it('Namespace is Null or Undefined', () => {
      const logger = new Logger(undefined);
      logger.namespace.should.equal(Logger.name);
      logger.logLevel.should.equal(defaultLogLevel);
    });

    const namespace = 'Test';
    it('with namespace', () => {
      const logger = new Logger(namespace);
      logger.namespace.should.equal(namespace);
      logger.logLevel.should.equal(defaultLogLevel);
    });

    const logLevel = LogLevel.SILENT;
    it('with logLevel in LogLevel', () => {
      const logger = new Logger(namespace, logLevel);
      logger.namespace.should.equal(namespace);
      logger.logLevel.should.equal(logLevel);
    });

    it('with invalid logLevel', () => {
      const logger = new Logger(namespace, 'invaild_level');
      logger.namespace.should.equal(namespace);
      logger.logLevel.should.equal(LogLevel.WARN);
    });

    it('Set logLevel in LogLevel', () => {
      const logger = new Logger();
      logger.namespace.should.equal(Logger.name);
      logger.logLevel.should.equal(defaultLogLevel);
      logger.logLevel = LogLevel.INFO;
      logger.logLevel.should.equal(LogLevel.INFO);
    });

    it('Set invalid logLevel', () => {
      const logger = new Logger();
      logger.namespace.should.equal(Logger.name);
      logger.logLevel.should.equal(defaultLogLevel);
      logger.logLevel = 'invaild_level';
      logger.logLevel.should.equal(defaultLogLevel);
    });
  });

  describe('Logging test', () => {
    it('Check logLevel', () => {
      Logger.confirm(LogLevel.SILENT, LogLevel.SILENT).should.be.true;
      Logger.confirm(LogLevel.SILENT, LogLevel.ERROR).should.be.false;
      Logger.confirm(LogLevel.ERROR, LogLevel.ERROR).should.be.true;
      Logger.confirm(LogLevel.ERROR, LogLevel.WARN).should.be.false;
      Logger.confirm(LogLevel.WARN, LogLevel.WARN).should.be.true;
      Logger.confirm(LogLevel.WARN, LogLevel.INFO).should.be.false;
      Logger.confirm(LogLevel.INFO, LogLevel.INFO).should.be.true;
      Logger.confirm(LogLevel.INFO, LogLevel.DEBUG).should.be.false;
      Logger.confirm(LogLevel.DEBUG, LogLevel.DEBUG).should.be.true;
      Logger.confirm(LogLevel.DEBUG, LogLevel.VERBOSE).should.be.false;
      Logger.confirm(LogLevel.VERBOSE, LogLevel.VERBOSE).should.be.true;
    });

    it('info test', () => {
      const logger = new Logger();
      logger.logLevel = LogLevel.INFO;
      logger.info('info');
      current.should.equal(`[Logger] info`);
      logger.info('info', 'test');
      current.should.equal(`[Logger] info test`);
      logger.info('info', 'test', 'log');
      current.should.equal(`[Logger] info test log`);
    });
  
    it('warn test', () => {
      const logger = new Logger();
      logger.logLevel = LogLevel.WARN;
      logger.warn('warn');
      current.should.equal(`[Logger] warn`);
      logger.warn('warn', 'test');
      current.should.equal(`[Logger] warn test`);
      logger.warn('warn', 'test', 'log');
      current.should.equal(`[Logger] warn test log`);
    });
  
    it('error test', () => {
      const logger = new Logger();
      logger.logLevel = LogLevel.ERROR;
      logger.error('error');
      current.should.equal(`[Logger] error`);
      logger.error('error', 'test');
      current.should.equal(`[Logger] error test`);
      logger.error('error', 'test', 'log');
      current.should.equal(`[Logger] error test log`);
    });

    it('debug test', () => {
      const logger = new Logger();
      logger.logLevel = LogLevel.DEBUG;
      logger.debug('debug');
      current.should.equal(`[Logger] debug`);
      logger.debug('debug', 'test');
      current.should.equal(`[Logger] debug test`);
      logger.debug('debug', 'test', 'log');
      current.should.equal(`[Logger] debug test log`);
    });

    it('measure test', async () => {
      const logger = new Logger();
      logger.logLevel = LogLevel.VERBOSE;

      const args = [1, 'string', true]
      let test = new Test();
      let result = await logger.measure(test.run, test, args, 'measure');
      result.should.deep.equal(args);
      current.startsWith(`[Logger] measure`).should.be.true;
      result = await logger.measure(test.run, test, args, 'measure', 'log');
      result.should.deep.equal(args);
      current.startsWith(`[Logger] measure log`).should.be.true;
      logger.result('measure result', 'log');
      current.startsWith(`[Logger] measure result log`).should.be.true;

      logger.logLevel = LogLevel.ERROR;
      result = await logger.measure(test.run, test, args, 'skip');
      result.should.deep.equal(args);
      current.startsWith(`[Logger] measure result log`).should.be.true;
    });

    it('measureSync test', () => {
      const logger = new Logger();
      logger.logLevel = LogLevel.VERBOSE;

      const args = [1, 'string', true]
      let test = new Test();
      let result = logger.measureSync(test.runSync, test, args, 'measureSync');
      result.should.deep.equal(args);
      current.startsWith(`[Logger] measureSync`).should.be.true;
      logger.measureSync(test.runSync, test, args, 'measureSync', 'log');
      result.should.deep.equal(args);
      current.startsWith(`[Logger] measureSync log`).should.be.true;
      logger.result('measureSync result', 'log');
      current.startsWith(`[Logger] measureSync result log`).should.be.true;

      logger.logLevel = LogLevel.ERROR;
      result = logger.measureSync(test.runSync, test, args, 'skip');
      result.should.deep.equal(args);
      current.startsWith(`[Logger] measureSync result log`).should.be.true;
    });
  });
});
