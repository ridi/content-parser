# @ridi/pdf-parser

> Common PDF data parser for Ridibooks services

[![NPM version](https://badge.fury.io/js/%40ridi%2Fpdf-parser.svg)](https://badge.fury.io/js/%40ridi%2Fpdf-parser)
[![Build Status](https://travis-ci.org/ridi/content-parser.svg?branch=master)](https://travis-ci.org/ridi/content-parser)
[![codecov](https://codecov.io/gh/ridi/content-parser/branch/master/graph/badge.svg)](https://codecov.io/gh/ridi/content-parser)
[![NPM total downloads](https://img.shields.io/npm/dt/%40ridi%2Fpdf-parser.svg)](https://npm.im/%40ridi%2Fpdf-parser)
[![Greenkeeper badge](https://badges.greenkeeper.io/ridi/content-parser.svg)](https://greenkeeper.io/)

## Features

- [ ] Structure parsing
- [ ] Read files
  - [ ] Read cover page
- [ ] Encrypt and decrypt function when parsing or reading
- [ ] Debug mode
- [ ] Environment
  - [x] Node
  - [ ] CLI
  - [ ] Browser
- [ ] Online demo

## Install

```bash
npm install @ridi/pdf-parser
```

## Usage

Basic:

```js
import { PdfParser } from '@ridi/pdf-parser';
// or const { PdfParser } = require('@ridi/pdf-parser');

const parser = new PdfParser('./foo/bar.pdf');
parser.parse(/* { parseOptions } */).then((items) => {
  parser.readItems(items/*, { readOptions } */).then((results) => {
    ...
  });
  ...
});
```

with [AesCryptor](https://github.com/ridi/content-parser/blob/master/src/cryptor/AesCryptor.js):

```js
import { CryptoProvider, AesCryptor } from '@ridi/pdf-parser';
// or const { CryptoProvider, AesCryptor } = require('@ridi/pdf-parser');

const { Purpose } = CryptoProvider;
const { Modes, Padding } = AesCryptor;

class ContentCryptoProvider extends CryptoProvider {
  constructor(key) {
    super();
    this.cryptor = new AesCryptor(Modes.ECB, { key });
  }

  getCryptor(filePath, purpose) {
    return this.cryptor;
  }

  // If use as follows:
  // const provider = new ContentCryptoProvider(...);
  // const parser = new PdfParser('encrypted.pdf', provider);
  // const book = await parser.parse();
  // const cover = await parser.readItem(book.cover);
  //
  // It will be called as follows:
  // 1. run(data, 'encrypted.pdf', Purpose.READ_IN_DIR)
  // 2. run(data, 'encrypted.pdf', Purpose.READ_IN_DIR)
  //
  run(data, filePath, purpose) {
    const cryptor = this.getCryptor(filePath, purpose);
    const padding = Padding.AUTO;
    if (purpose === Purpose.READ_IN_DIR) {
      return cryptor.decrypt(data, padding);
    }
    return data;
  }
}

const cryptoProvider = new ContentCryptoProvider(key);
const parser = new PdfParser('./foo/bar.pdf', cryptoProvider);
```

Log level setting:

```js
import { LogLevel, ... } from '@ridi/pdf-parser';
const parser = new PdfParser(/* path */, /* cryptoProvider */, /* logLevel */)
// or const parser = new PdfParser(/* path */, /* logLevel */)
parser.logger.logLevel = LogLevel.VERBOSE; // SILENT, ERROR, WARN(default), INFO, DEBUG, VERBOSE
```

## API

### parse(parseOptions)

Returns `Promise<PdfBook>` with:

- [PdfBook](#book): Instance with pages info.

Or throw exception.

#### [parseOptions](#parseOptions): `?object`

---

### readItem(item, readOptions)

Returns `string` or `Buffer` in `Promise` with:

- If `readOptions.base64` is `true`:

  - `string`

- Other:

  - `Buffer`

or throw exception.

#### item: [Item](#item)

#### [readOptions](#readOptions): `?object`

---

### readItems(items, readOptions)

Returns `string[]` or `Buffer[]` in `Promise` with:

- If `readOptions.base64` is `true`:

  - `string`

- Other:

  - `Buffer`

or throw exception.

#### items: [Item\[\]](#item)

#### [readOptions](#readOptions): `?object`

---

### readBuffer()

Returns PDF file as `Buffer`.

---

### onProgress = callback(step, totalStep, action)

Tells the progress of parser through `callback`.

```js
const { Action } = PdfParser; // PARSE, READ_ITEMS
parser.onProgress = (step, totalStep, action) => {
  console.log(`[${action}] ${step} / ${totalStep}`);
}
```

## Model

<a id="book"></a>

### [PdfBook](./src/model/Book.js)

- items: *[Item](#item)[]*
- cover: *?[Item](#item)*

<a id="item"></a>

### [Item](./src/model/Item.js)

- pageId: *number*
- width: *number*
- height: *number*

<a id="parseOptions"></a>

## Parse Options

* None.

<a id="readOptions"></a>

## Read Options

* [force](#force)
* [base64](#base64)

---

<a id="force"></a>

### force: *boolean*

If true, ignore any exceptions that occur within parser.

**Default:** `false`

---

<a id="base64"></a>

### base64: *`boolean`*

If false, reads image into a buffer.

**Default:** `false`

## License

[Apache-2.0](https://github.com/ridi/content-parser/packages/pdf-parser/LICENSE)
