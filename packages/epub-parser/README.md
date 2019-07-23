# @ridi/epub-parser

> Common EPUB2 data parser for Ridibooks services

[![NPM version](https://badge.fury.io/js/%40ridi%2Fepub-parser.svg)](https://badge.fury.io/js/%40ridi%2Fepub-parser)
[![Build Status](https://travis-ci.org/ridi/content-parser.svg?branch=master)](https://travis-ci.org/ridi/content-parser)
[![codecov](https://codecov.io/gh/ridi/content-parser/branch/master/graph/badge.svg)](https://codecov.io/gh/ridi/content-parser)
[![NPM total downloads](https://img.shields.io/npm/dt/%40ridi%2Fepub-parser.svg)](https://npm.im/%40ridi%2Fepub-parser)
[![Greenkeeper badge](https://badges.greenkeeper.io/ridi/content-parser.svg)](https://greenkeeper.io/)

## Features

- [x] EPUB2 parsing
- [ ] EPUB3 parsing
- [x] Package validation with option
- [x] Unzip epub file when parsing with options
- [x] Read files
  - [x] Extract inner HTML of body in Spine with option
  - [x] Change base path of Spine, CSS and Inline style with option
  - [x] Customize CSS, Inline Style with options
  - [ ] Truncate inner HTML of body in Spine with options
  - [ ] Minify HTML, CSS, Inline Style with options
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

with [AesCryptor](https://github.com/ridi/content-parser/blob/master/src/cryptor/AesCryptor.js):

```js
import { CryptoProvider, AesCryptor } from '@ridi/epub-parser';
// or const { CryptoProvider, AesCryptor } = require('@ridi/epub-parser');

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
  // const parser = new EpubParser('encrypted.epub', provider);
  // const book = await parser.parse({ unzipPath: ... });
  // const firstSpine = await parser.readItem(book.spines[0]);
  //
  // It will be called as follows:
  // 1. run(data, 'encrypted.epub', Purpose.READ_IN_DIR)
  // 2. run(data, 'META-INF/container.xml', Purpose.READ_IN_ZIP)
  // 3. run(data, 'OEBPS/content.opf', Purpose.READ_IN_ZIP)
  // ...
  // 4. run(data, 'mimetype', Purpose.WRITE)
  // ...
  // 5. run(data, 'OEBPS/Text/Section0001.xhtml', Purpose.READ_IN_DIR)
  //
  run(data, filePath, purpose) {
    const cryptor = this.getAesCryptor(filePath, purpose);
    const padding = Padding.AUTO;
    if (purpose === Purpose.READ_IN_DIR) {
      return cryptor.decrypt(data, padding);
    } else if (purpose === Purpose.WRITE) {
      return cryptor.encrypt(data, padding);
    }
    return data;
  }
}

const cryptoProvider = new ContentCryptoProvider(key);
const parser = new EpubParser('./encrypted.epub' or './unzippedPath', cryptoProvider);
```

Log level setting:

```js
import { LogLevel, ... } from '@ridi/epub-parser';
const parser = new EpubParser(/* path */, /* cryptoProvider */, /* logLevel */)
// or const parser = new EpubParser(/* path */, /* logLevel */)
parser.logger.logLevel = LogLevel.VERBOSE; // SILENT, ERROR, WARN(default), INFO, DEBUG, VERBOSE
```

## API

### parse(parseOptions)

Returns `Promise<EpubBook>` with:

- [EpubBook](#book): Instance with metadata, spine list, table of contents, etc.

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

---

### unzip(unzipPath, overwrite)

Returns `Promise<boolean>` with:

- If result is `true`, unzip is successful or has already been unzipped.

Or throw exception.

#### unzipPath: `string`

#### overwrite: `boolean`

---

### onProgress = callback(step, totalStep, action)

Tells the progress of parser through `callback`.

```js
const { Action } = EpubParser; // PARSE, READ_ITEMS
parser.onProgress = (step, totalStep, action) => {
  console.log(`[${action}] ${step} / ${totalStep}`);
}
```

## Model

<a id="book"></a>

### [EpubBook](./src/model/Book.js)

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
- languages: *string[]*
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
- toRaw(): *object*

<a id="author"></a>

### [Author](./src/model/Author.js)

- name: *?string*
- fileAs: *?string*
- role: *string* (**Default: Author.Roles.UNDEFINED**)
- toRaw(): *object*

#### [Author.Roles](./src/model/Author.js#L4)

Type | Value
---|---
UNDEFINED | undefined
UNKNOWN | unknown
ADAPTER | adp
ANNOTATOR | ann
ARRANGER | arr
ARTIST | art
ASSOCIATEDNAME | asn
AUTHOR | aut
AUTHOR_IN_QUOTATIONS_OR_TEXT_EXTRACTS | aqt
AUTHOR_OF_AFTER_WORD_OR_COLOPHON_OR_ETC | aft
AUTHOR_OF_INTRODUCTIONOR_ETC | aui
BIBLIOGRAPHIC_ANTECEDENT | ant
BOOK_PRODUCER | bkp
COLLABORATOR | clb
COMMENTATOR | cmm
DESIGNER | dsr
EDITOR | edt
ILLUSTRATOR | ill
LYRICIST | lyr
METADATA_CONTACT | mdc
MUSICIAN | mus
NARRATOR | nrt
OTHER | oth
PHOTOGRAPHER | pht
PRINTER | prt
REDACTOR | red
REVIEWER | rev
SPONSOR | spn
THESIS_ADVISOR | ths
TRANSCRIBER | trc
TRANSLATOR | trl

<a id="dateTime"></a>

### [DateTime](./src/model/DateTime.js)

- value: *?string*
- event: *string* (**Default: DateTime.Events.UNDEFINED**)
- toRaw(): *object*

#### [DateTime.Events](./src/model/DateTime.js#L3)

Type | Value
---|---
UNDEFINED | undefined
UNKNOWN | unknown
CREATION | creation
MODIFICATION | modification
PUBLICATION | publication

<a id="identifier"></a>

### [Identifier](./src/model/Identifier.js)

- value: *?string*
- scheme: *string* (**Default: Identifier.Schemes.UNDEFINED**)
- toRaw(): *object*

#### [Identifier.Schemes](./src/model/Identifier.js#L3)

Type | Value
---|---
UNDEFINED | undefined
UNKNOWN | unknown
DOI | doi
ISBN | isbn
ISBN13 | isbn13
ISBN10 | isbn10
ISSN | issn
UUID | uuid
URI | uri

<a id="meta"></a>

### [Meta](./src/model/Meta.js)

- name: *?string*
- content: *?string*
- toRaw(): *object*

<a id="guide"></a>

### [Guide](./src/model/Guide.js)

- title: *?string*
- type: *string* (**Default: Guide.Types.UNDEFINED**)
- href: *?string*
- item: *?[Item](#item)*
- toRaw(): *object*

#### [Guide.Types](./src/model/Guide.js#L3)

Type | Value
---|---
UNDEFINED | undefined
UNKNOWN | unknown
COVER | cover
TITLE_PAGE | title-page
TOC | toc
INDEX | index
GLOSSARY | glossary
ACKNOWLEDGEMENTS | acknowledgements
BIBLIOGRAPHY | bibliography
COLOPHON | colophon
COPYRIGHT_PAGE | copyright-page
DEDICATION | dedication
EPIGRAPH | epigraph
FOREWORD | foreword
LOI | loi
LOT | lot
NOTES | notes
PREFACE | preface
TEXT | text

<a id="itemTypes"></a>

### Item Types

<a id="item"></a>

#### [Item](./src/model/Item.js)

- id: *?string*
- href: *?string*
- mediaType: *?string*
- size: *?number*
- isFileExists: *boolean* (**size !== undefined**)
- toRaw(): *object*

<a id="spineItem"></a>

#### [SpineItem](./src/model/SpineItem.js) (extend [Item](#item))

- index: *number* (**Default: undefined**)
- isLinear: *boolean* (**Default: true**)
- styles: *?[CssItem](#cssItem)[]*
- first: *?[SpineItem](#spineItem)*
- prev: *?[SpineItem](#spineItem)*
- next: *?[SpineItem](#spineItem)*

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

#### [DeadItem.Reason](./src/model/DeadItem.js#L3)

Type | Value
---|---
UNDEFINED | undefined
UNKNOWN | unknown
NOT_EXISTS | not_exists
NOT_SPINE | not_spine
NOT_NCX | not_ncx
NOT_SUPPORT_TYPE | not_support_type

<a id="navPoint"></a>

### [NavPoint](./src/model/NavPoint.js)

- id: *?string*
- label: *?string*
- src: *?string*
- anchor: *?string*
- depth: *number* (**Default: 0**)
- children: *NavPoint[]*
- spine: *?[SpineItem](#spineItem)*
- toRaw(): *object*

<a id="version"></a>

### [Version](../parser-core/src/Version.js)

- major: *number*
- minor: *number*
- patch: *number*
- toString(): *string*

<a id="parseOptions"></a>

## Parse Options

* [validatePackage](#validatePackage)
* [allowNcxFileMissing](#allowNcxFileMissing)
* [unzipPath](#unzipPath)
* [overwrite](#overwrite)
* [parseStyle](#parseStyle)
* [styleNamespacePrefix](#styleNamespacePrefix)
* [additionalInlineStyle](#additionalInlineStyle)

---

<a id="validatePackage"></a>

### validatePackage: *`boolean`*

If true, validation package specifications in [IDPF listed](http://www.idpf.org/doc_library/epub/OCF_2.0.1_draft.doc) below.
> used only if input is EPUB file.

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

If specified, unzip to that path.
> only using if input is EPUB file.

**Default:** `undefined`

---

<a id="overwrite"></a>

### overwrite: *`boolean`*

If true, overwrite to [unzipPath](#unzipPath) when unzip.
> only using if unzipPath specified.

**Default:** `true`

---

<a id="parseStyle"></a>

### parseStyle: *`boolean`*

If true, styles used for spine is described, and one namespace is given per CSS file or inline style.

Otherwise it [CssItem](#cssItem)`.namespace`, [SpineItem](#spineItem)`.styles` is `undefined`.

In any list, [InlineCssItem](#inlineCssItem) is always positioned after [CssItem](#CssItem). ([EpubBook](#book)`.styles`, [EpubBook](#book)`.items`, [SpineItem](#spineItem)`.styles`, ...)

**Default:** `true`

---

<a id="styleNamespacePrefix"></a>

### styleNamespacePrefix: *`string`*

Prepend given string to namespace for identification.
> only available if parseStyle is true.

**Default:** `'ridi_style'`

---

<a id="additionalInlineStyle"></a>

### additionalInlineStyle: *`?string`*

If specified, added inline styles to all spines.
> only available if parseStyle is true.

**Default:** `undefined`

<a id="readOptions"></a>

## Read Options

* [force](#force)
* [basePath](#basePath)
* [extractBody](#extractBody)
* [serializedAnchor](#serializedAnchor)
* [ignoreScript](#ignoreScript)
* [removeAtrules](#removeAtrules)
* [removeTagSelector](#removeTagSelector)
* [removeIdSelector](#removeIdSelector)
* [removeClassSelector](#removeClassSelector)

---

<a id="force"></a>

### force: *boolean*

If true, ignore any exceptions that occur within parser.

**Default:** `false`

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

<a id="ignoreScript"></a>

### ignoreScript: *`boolean`*

Ignore all scripts from within HTML.

**Default:** `false`

---

<a id="removeAtrules"></a>

### removeAtrules: *`string[]`*

Remove at-rules.

**Default:** `[]`

---

<a id="removeTagSelector"></a>

### removeTagSelector: *`string[]`*

Remove selector that point to specified tags.

**Default:** `[]`

---

<a id="removeIdSelector"></a>

### removeIdSelector: *`string[]`*

Remove selector that point to specified ids.

**Default:** `[]`

---

<a id="removeClassSelector"></a>

### removeClassSelector: *`string[]`*

Remove selector that point to specified classes.

**Default:** `[]`

## License

[MIT](https://github.com/ridi/content-parser/packages/epub-parser/LICENSE)
