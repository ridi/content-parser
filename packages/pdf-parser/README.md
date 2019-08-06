# @ridi/pdf-parser

> Common PDF data parser for Ridibooks services

[![NPM version](https://badge.fury.io/js/%40ridi%2Fpdf-parser.svg)](https://badge.fury.io/js/%40ridi%2Fpdf-parser)
[![Build Status](https://travis-ci.org/ridi/content-parser.svg?branch=master)](https://travis-ci.org/ridi/content-parser)
[![codecov](https://codecov.io/gh/ridi/content-parser/branch/master/graph/badge.svg)](https://codecov.io/gh/ridi/content-parser)
[![NPM total downloads](https://img.shields.io/npm/dt/%40ridi%2Fpdf-parser.svg)](https://npm.im/%40ridi%2Fpdf-parser)

## Features

- [x] Structure parsing
- [ ] Read files
  - [ ] Read cover page
- [x] Encrypt and decrypt function when parsing or reading
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
parser.parse().then((book) => {
  ...
});
parser.read().then((pdfFileBuffer) => {
  ...
});
```

with [AesCryptor](https://github.com/ridi/content-parser/blob/master/src/cryptor/AesCryptor.js):

```js
import { CryptoProvider, AesCryptor } from '@ridi/pdf-parser';
// or const { CryptoProvider, AesCryptor } = require('@ridi/pdf-parser');

const { Purpose } = CryptoProvider;
const { Mode, Padding } = AesCryptor;

class ContentCryptoProvider extends CryptoProvider {
  constructor(key) {
    super();
    this.cryptor = new AesCryptor(Mode.ECB, { key });
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
    if (purpose === Purpose.READ_IN_DIR) {
      return cryptor.decrypt(data, { padding: Padding.AUTO });
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

### parse()

Returns `Promise<PdfBook>` with:

- [PdfBook](#book): Instance with pages info.

Or throw exception.

---

### read()

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

- version: *[Version](#version)*
- title: *string*
- author: *string*
- subject: *string*
- keywords: *string*
- creator: *string*
- producer: *string*
- creationDate: *?string*
- modificationDate: *?string*
- outlineItems: *[OutlineItem](#outlineItem)[]*
- isLinearized: *boolean*
- isAcroFormPresent: *boolean*
- isXFAPresent: *boolean*
- isCollectionPresent: *boolean*
- userInfo: *object*
- pageCount: *number*
- permissions: *[Permissions](#permissions)*
- toRaw(): *object*

<a id="version"></a>

### [Version](../parser-core/src/Version.js)

- major: *number*
- minor: *number*
- patch: *number*
- toString(): *string*

<a id="outlineItem"></a>

### [OutlineItem](./src/model/OutlineItem.js)

- dest: *?string|\*[]*
- url: *?string*
- title: *string*
- color: *[Color](#color)*
- bold: *boolean*
- italic: *boolean*
- depth: *number* (**Default: 0**)
- children: *[OutlineItem](#outlineItem)[]*
- page: *?number*
- toRaw(): *object*

<a id="color"></a>

### [Color](../src/model/Color.js)

- red: *number*
- green: *number*
- blue: *number*
- intValue: *number* (ex: `7237488`)
- hexString: *string* (ex: `'#6e6f70'`)
- rgbString: *string* (ex: `'rgb(110, 111, 112)'`)
- toRaw(): *object*

<a id="permissions"></a>

### [Permissions](../src/model/Permissions.js)

- allowPrinting: *boolean*
- allowContentsModifying: *boolean*
- allowCopying: *boolean*
- allowAnnotationsModifying: *boolean*
- allowInteractiveFormsModifying: *boolean*
- allowCopyingForAccessibility: *boolean*
- allowAssembling: *boolean*
- allowHighQualityPrinting: *boolean*
- toRaw(): *?number[]*

## License

[Apache-2.0](https://github.com/ridi/content-parser/packages/pdf-parser/LICENSE)
