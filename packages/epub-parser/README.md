# @ridi/epub-parser

> Common EPUB2 data parser for Ridibooks services

[![npm version](https://badge.fury.io/js/%40ridi%2Fepub-parser.svg)](https://badge.fury.io/js/%40ridi%2Fepub-parser)
[![Build Status](https://travis-ci.org/ridi/content-parser.svg?branch=master)](https://travis-ci.org/ridi/content-parser)
[![codecov](https://codecov.io/gh/ridi/content-parser/branch/master/graph/badge.svg)](https://codecov.io/gh/ridi/content-parser)

## Features

- [x] EPUB2 parsing
- [ ] EPUB3 parsing
- [x] Package validation with option
- [x] Unzip epub file when parsing with options
- [x] Read files
  - [x] Extract inner HTML of body in Spine with option
  - [x] Change base path of Spine, CSS and Inline style with option
  - [x] Customize CSS, Inline Style with options
- [x] Encrypt and decrypt function when parsing or reading or unzipping
- [ ] More [spec](http://www.idpf.org/epub/30/spec/epub30-ocf.html#sec-container-metainf)
  - [ ] encryption.xml
  - [ ] manifest.xml
  - [ ] metadata.xml
  - [ ] rights.xml
  - [ ] signatures.xml
- [ ] Debug mode
- [ ] Environment
  - [x] Node 
  - [ ] CLI
  - [ ] Browser
- [ ] Online demo

## Install

```bash
npm install @ridi/epub-parser
```

## Usage

Basic:

```js
import { EpubParser } from '@ridi/epub-parser';
// or const { EpubParser } = require('@ridi/epub-parser');

const parser = new EpubParser('./foo/bar.epub' or './unzippedPath');
parser.parse(/* { parseOptions } */).then((book) => {
  parser.readItems(book.spines/*, { readOptions } */).then((results) => {
    ...
  });
  ...
});
```

with [Cryptor](https://github.com/ridi/epub-parser/blob/master/src/cryptor/Cryptor.js):

```js
import { CryptoProvider, Cryptor } from '@ridi/epub-parser';
// or const { CryptoProvider, Cryptor } = require('@ridi/epub-parser');

const { Status } = CryptoProvider;
const { Modes, Padding } = Cryptor;

class ContentCryptoProvider extends CryptoProvider {
  constructor(key) {
    super();
    this.cryptor = new Cryptor(Modes.ECB, { key, padding: Padding.PKCS7 });
  }

  // Encrypt all content when unzipping and decrypt it when read.
  run(data, filePath) {
    if (this.status === Status.UNZIP) {
      return this.encrypt(data);
    } else if (this.status === Status.READ) {
      return Buffer.from(this.decrypt(data));
    }
    return data;
  }

  encrypt(data, filePath) {
    return this.cryptor.encrypt(data);
  }

  decrypt(data, filePath) {
    return this.cryptor.decrypt(data);
  }
}

const cryptoProvider = new ContentCryptoProvider(key);
const parser = new EpubParser('./foo/bar.epub' or './unzippedPath', cryptoProvider);
```

## API

### parse(parseOptions)

Returns `Promise<Book>` with:

- [Book](#book): Instance with metadata, spine list, table of contents, etc.

Or throw exception.

#### [parseOptions](#parseOptions): `?object`

---

### readItem(item, readOptions)

Returns `string` or `Buffer` in `Promise` with:

- [SpineItem](#spineItem), [CssItem](#cssItem), [InlineCssItem](#inlineCssItem), [NcxItem](#ncxItem), [SvgItem](#svgItem):

  - `string`

- Other items:

  - `Buffer`

or throw exception.

#### item: `Item` (see: [Item Types](#itemTypes))

#### [readOptions](#readOptions): `?object`

---

### readItems(items, readOptions)

Returns `string[]` or `Buffer[]` in `Promise` with:

- [SpineItem](#spineItem), [CssItem](#cssItem), [InlineCssItem](#inlineCssItem), [NcxItem](#ncxItem), [SvgItem](#svgItem):

  - `string[]`

- Other items:

  - `Buffer[]`

or throw exception.

#### items: `Item[]` (see: [Item Types](#itemTypes))

#### [readOptions](#readOptions): `?object`

## Model

<a id="book"></a>

### [Book](./src/model/Book.js)

- titles: *string[]*
- creators: *[Author](#author)[]*
- subjects: *string[]*
- description: *?string*
- publisher: *?string*
- contributors: *[Author](#author)[]*
- dates: *[DateTime](#dateTime)[]*
- type: *?string*
- format: *?string*
- identifiers: *[Identifier](#identifier)[]*
- source: *?string*
- language: *?string*
- relation: *?string*
- rights: *?string*
- version: *[Version](#version)*
- metas: *[Meta](#meta)[]*
- items: *[Item](#item)[]*
- spines: *[SpintItem](#spineItem)[]*
- ncx: *?[NcxItem](#ncxItem)*
- fonts: *[FontItem](#fontItem)[]*
- cover: *?[ImageItem](#imageItem)*
- images: *[ImageItem](#imageItem)[]*
- styles: *[CssItem](#cssItem)[]*
- guides: *[Guide](#Guide)[]*
- deadItems: *[DeadItem](#deadItem)[]*

<a id="author"></a>

### [Author](./src/model/Author.js)

- name: *?string*
- fileAs: *?string*
- role: *string* (**Default: Author.Roles.UNDEFINED**)

<a id="dateTime"></a>

### [DateTime](./src/model/DateTime.js)

- value: *?string*
- event: *string* (**Default: DateTime.Events.UNDEFINED**)

<a id="identifier"></a>

### [Identifier](./src/model/Identifier.js)

- value: *?string*
- scheme: *string* (**Default: Identifier.Schemes.UNDEFINED**)

<a id="meta"></a>

### [Meta](./src/model/Meta.js)

- name: *?string*
- content: *?string*

<a id="guide"></a>

### [Guide](./src/model/Guide.js)

- title: *?string*
- type: *string* (**Default: Guide.Types.UNDEFINED**)
- href: *?string*
- item: *?[Item](#item)*

<a id="itemTypes"></a>

### Item Types

<a id="item"></a>

#### [Item](./src/model/Item.js)

- id: *?id*
- href: *?string*
- mediaType: *?string*
- size: *?number*
- isFileExists: *boolean* (**size !== undefined**)

<a id="spineItem"></a>

#### [SpineItem](./src/model/SpineItem.js) (extend [Item](#item))

- index: *number* (**Default: -1**)
- isLinear: *boolean* (**Default: true**)
- styles: *?[CssItem](#cssItem)[]*

<a id="ncxItem"></a>

#### [NcxItem](./src/model/NcxItem.js) (extend [Item](#item))

- navPoints: *[NavPoint](#navPoint)[]*

<a id="cssItem"></a>

#### [CssItem](./src/model/CssItem.js) (extend [Item](#item))
- namespace: *string*

<a id="inlineCssItem"></a>

#### [InlineCssItem](./src/model/InlineCssItem.js) (extend [CssItem](#cssItem))
- style: *string* (**Default: ''**)

<a id="imageItem"></a>

#### [ImageItem](./src/model/ImageItem.js) (extend [Item](#item))
- isCover: *boolean* (**Default: false**)

<a id="svgItem"></a>

#### [SvgItem](./src/model/SvgItem.js) (extend [ImageItem](#imageItem))

<a id="fontItem"></a>

#### [FontItem](./src/model/FontItem.js) (extend [Item](#item))

<a id="deadItem"></a>

#### [DeadItem](./src/model/DeadItem.js) (extend [Item](#item))
- reason: *string* (**Default: DeadItem.Reason.UNDEFINED**)

<a id="navPoint"></a>

### [NavPoint](./src/model/NavPoint.js)

- id: *?string*
- label: *?string*
- src: *?string*
- anchor: *?string*
- depth: *number* (**Default: 0**)
- children: *NavPoint[]*
- spine: *?[SpineItem](#spineItem)*

<a id="version"></a>

### [Version](./src/model/Version.js)

- major: *number*
- minor: *number*
- patch: *number*
- isValid: *boolean* (**Only 2.x.x is valid because current epub-parser only supports EPUB2.**)
- toString(): *string*

<a id="parseOptions"></a>

## Parse Options

* [validatePackage](#validatePackage)
* [allowNcxFileMissing](#allowNcxFileMissing)
* [unzipPath](#unzipPath)
* [overwrite](#overwrite)
* [ignoreLinear](#ignoreLinear)
* [parseStyle](#parseStyle)
* [styleNamespacePrefix](#styleNamespacePrefix)

---

<a id="validatePackage"></a>

### validatePackage: *`boolean`*

If true, validation package specifications in [IDPF listed](http://www.idpf.org/doc_library/epub/OCF_2.0.1_draft.doc) below.
> only using if input is EPUB file.
- Zip header should not corrupt.
- `mimetype` file must be first file in archive.
- `mimetype` file should not compressed.
- `mimetype` file should only contain string `application/epub+zip`.
- Should not use extra field feature of ZIP format for mimetype file.

**Default:** `false`

---

<a id="allowNcxFileMissing"></a>

### allowNcxFileMissing: *`boolean`*

If false, stop parsing when NCX file not exists.

**Default:** `true`

---

<a id="unzipPath"></a>

### unzipPath: *`?string`*

If specified, uncompress to that path.
> only using if input is EPUB file.

**Default:** `undefined`

---

<a id="overwrite"></a>

### overwrite: *`boolean`*

If true, overwrite to [unzipPath](#unzipPath) when uncompress.
> only using if unzipPath specified.

**Default:** `true`

---

<a id="ignoreLinear"></a>

### ignoreLinear: *`boolean`*

If true, ignore `index` difference caused by `isLinear` property of [SpineItem](#spineItem).

```js
// e.g. If left is false, right is true.
[{ index: 0, isLinear: true, ... },       [{ index: 0, isLinear: true, ... },
{ index: 1, isLinear: true, ... },        { index: 1, isLinear: true, ... },
{ index: -2, isLinear: false, ... },      { index: 2, isLinear: false, ... },
{ index: 3, isLinear: true, ... }]        { index: 3, isLinear: true, ... }]
```

**Default:** `false`

---

<a id="parseStyle"></a>

### parseStyle: *`boolean`*

If true, styles used for spine is described, and one namespace is given per CSS file or inline style.

Otherwise it [CssItem](#cssItem)`.namespace`, [SpineItem](#spineItem)`.styles` is `undefined`.

In any list, [InlineCssItem](#inlineCssItem) is always positioned after [CssItem](#CssItem). ([Book](#book)`.styles`, [Book](#book)`.items`, [SpineItem](#spineItem)`.styles`, ...)

**Default:** `true`

---

<a id="styleNamespacePrefix"></a>

### styleNamespacePrefix: *`string`*

Prepend given string to namespace for identification.
> only using if parseStyle is true.

**Default:** `'ridi_style'`

---

<a id="readOptions"></a>

## Read Options

* [basePath](#basePath)
* [extractBody](#extractBody)
* [serializedAnchor](#serializedAnchor)
* [removeAtrules](#removeAtrules)
* [removeTags](#removeTags)
* [removeIds](#removeIds)
* [removeClasses](#removeClasses)

---

<a id="basePath"></a>

### basePath: *`?string`*

If specified, change base path of paths used by spine and css.

HTML: [SpineItem](#spineItem)

```html
...
  <!-- Before -->
  <div>
    <img src="../Images/cover.jpg">
  </div>
  <!-- After -->
  <div>
    <img src="{basePath}/OEBPS/Images/cover.jpg">
  </div>
...
```

CSS: [CssItem](#cssItem), [InlineCssItem](#inlineCssItem)

```css
/* Before */
@font-face {
  font-family: NotoSansRegular;
  src: url("../Fonts/NotoSans-Regular.ttf");
}
/* After */
@font-face {
  font-family: NotoSansRegular;
  src: url("{basePath}/OEBPS/Fonts/NotoSans-Regular.ttf");
}
```

**Default:** `undefined`

---

<a id="extractBody"></a>

### extractBody: *`boolean|function`*

If true, extract body. Otherwise it returns a full string.
If specify a function instead of true, use function to transform body.

`false`:

```js
'<!doctype><html>\n<head>\n</head>\n<body style="background-color: #000000;">\n  <p>Extract style</p>\n  <img src=\"../Images/api-map.jpg\"/>\n</body>\n</html>'
```

`true`:

```js
'<body style="background-color: #000000;">\n  <p>Extract style</p>\n  <img src=\"../Images/api-map.jpg\"/>\n</body>'
```

`function`:

```js
readOptions.extractBody = (innerHTML, attrs) => {
  const string = attrs.map((attr) => {
    return ` ${attr.key}=\"${attr.value}\"`;
  }).join(' ');
  return `<article ${string}>${innerHTML}</article>`;
};
```
```js
'<article style="background-color: #000000;">\n  <p>Extract style</p>\n  <img src=\"../Images/api-map.jpg\"/>\n</article>'
```

**Default:** `false`

---

<a id="serializedAnchor"></a>

### serializedAnchor: *`Boolean`*

If true, replace file path of anchor in spine with spine index.

```xml
...
<spine toc="ncx">
  <itemref idref="Section0001.xhtml"/> <!-- index: 0 -->
  <itemref idref="Section0002.xhtml"/> <!-- index: 1 -->
  <itemref idref="Section0003.xhtml"/> <!-- index: 2 -->
  ...
</spine>
...
```
```html
<!-- Before -->
<a href="./Text/Section0002.xhtml#title">Chapter 2</a>
<!-- After -->
<a href="1#title">Chapter 2</a>
```

**Default:** `false`

---

<a id="removeAtrules"></a>

### removeAtrules: *`string[]`*

Remove at-rules.

**Default:** `[]`

---

<a id="removeTags"></a>

### removeTags: *`string[]`*

Remove selector that point to specified tags.

**Default:** `[]`

---

<a id="removeIds"></a>

### removeIds: *`string[]`*

Remove selector that point to specified ids.

**Default:** `[]`

---

<a id="removeClasses"></a>

### removeClasses: *`string[]`*

Remove selector that point to specified classes.

**Default:** `[]`

---
