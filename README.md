# epub-parser

> Common EPUB2 data parser for Ridibooks services written in ES6

[![Build Status](https://travis-ci.org/ridi/epub-parser.svg?branch=master)](https://travis-ci.org/ridi/epub-parser)

## Features

- Detailed parsing for EPUB2
- Supports package validation, decompression and style extraction with various parsing options
- Extract files within EPUB with various reading options

## TODO

- [ ] Add encryption and decryption function
- [ ] Add `readOptions.spine.truncate` and `readOption.spine.truncateMaxLength` options
- [ ] Add `readOptions.spine.minify` and `readOptions.css.minify` options
- [ ] Support for EPUB3
- [ ] Support for CLI
- [ ] Support for other [OCF](http://www.idpf.org/doc_library/epub/OCF_2.0.1_draft.doc) spec (manifest.xml, metadata.xml, signatures.xml, encryption.xml, etc)

## Install

```bash
npm install @ridi/epub-parser
```

## Usage

Basic:

```js
import EpubParser from '@ridi/epub-parser';

const parser = new EpubParser('./foo/bar.epub');
parser.parse().then((book) => {
  const results = parser.read(book.spines);
  ...
});
```

Various inputs:

```js
import fs from 'fs';
import EpubParser from '@ridi/epub-parser';

// Unzipped path of EPUB file.
new EpubParser('./foo/bar');

// EPUB file buffer.
const buffer = fs.readFileSync('./foo/bar.epub');
new EpubParser(buffer);
```

Book to Object, Object to Book:

```js
import EpubParser from '@ridi/epub-parser';

const parser = new EpubParser('./foo/bar.epub');
parser.parse().then((book) => {
  const rawBook = book.toRaw();
  const newBook = new Book(rawBook);
  ...
});
```

## API

### parse(parseOptions)

Returns `Promise<Book>` with:

- [Book](#book): Instance with metadata, spine list, table of contents, etc.

Or throw exception.

#### [parseOptions](#parseOptions): `Object`

### read(target(s), readOptions)

Returns `string` or `Object` or `string[]` or `Object[]` with:

- `string` ([readOptions.spine.extractBody](#spine_extractBody) is `false`)

- `Object` ([readOptions.spine.extractAdapter](#spine_extractAdapter) is `undefined`):
  - `body`: Same reuslt as `document.body.innerHTML`
  - `attrs`: Attributes in body tag.

- `Object` ([readOptions.spine.extractAdapter](#spine_extractAdapter) is [defaultExtractAdapter](#defaultExtractAdapter)):
  - `content`: `extractBody` output transformed by adapter.

Or throw exception.

#### target(s): `Item`, `Item[]` (see: [Item Types](#itemTypes))

#### [readOptions](#readOptions): `Object`

## Model

<a id="book"></a>

### [Book](./src/model/Book.js)

- titles: *string[]*
- creators: *[Author](#author)[]*
- subjects: *string[]*
- description: *string?*
- publisher: *string?*
- contributors: *[Author](#author)[]*
- dates: *[DateTime](#dateTime)[]*
- type: *string?*
- format: *string?*
- identifiers: *[Identifier](#identifier)[]*
- source: *string?*
- language: *string?*
- relation: *string?*
- rights: *string?*
- epubVersion: *number?*
- metas: *[Meta](meta)[]*
- items: *[Item](#item)[]*
- ncx: *[NcxItem](#ncxItem)?*
- spines: *[SpintItem](#spineItem)[]*
- fonts: *[FontItem](#fontItem)[]*
- cover: *[ImageItem](#imageItem)?*
- images: *[ImageItem](#imageItem)[]*
- styles: *[CssItem](#cssItem)[]*
- guide: *[Guide](#Guide)[]*
- deadItems: *[DeadItem](#deadItem)[]*

<a id="author"></a>

### [Author](./src/model/Author.js)

- name: *string?*
- role: *string* (**Default: Author.Roles.UNDEFINED**)

<a id="dateTime"></a>

### [DateTime](./src/model/DateTime.js)

- value: *strung?*
- event: *string* (**Default: DateTime.Events.UNDEFINED**)

<a id="identifier"></a>

### [Identifier](./src/model/Identifier.js)

- value: *string?*
- scheme: *string?* (**Default: Identifier.Schemes.UNDEFINED**)

<a id="meta"></a>

### [Meta](./src/model/Meta.js)

- name: *string?*
- content: *string?*

<a id="guide"></a>

### [Guide](./src/model/Guide.js)

- title: *string?*
- type: *string* (**Default: Guide.Types.UNDEFINED**)
- href: *string?*
- item: *[Item](#item)?*

<a id="itemTypes"></a>

### Item Types

<a id="item"></a>

#### [Item](./src/model/Item.js)

- id: *id?*
- href: *string?*
- mediaType: *string?*
- size: *number?*
- isFileExists: *boolean* (**size !== undefined**)
- defaultEncoding: *string?* (**Default: undefined**)

<a id="ncxItem"></a>

#### [NcxItem](./src/model/NcxItem.js) (extend [Item](#item))

- navPoints: *[NavPoint](#navPoint)[]*

<a id="spineItem"></a>

#### [SpineItem](./src/model/SpineItem.js) (extend [Item](#item))

- spineIndex: *number* (**Default: -1**)
- isLinear: *boolean* (**Default: true**)
- styles: *[CssItem](#cssItem)[]?*

<a id="cssItem"></a>

#### [CssItem](./src/model/CssItem.js) (extend [Item](#item))
- namespace: *string?*

<a id="inlineCssItem"></a>

#### [InlineCssItem](./src/model/InlineCssItem.js) (extend [CssItem](#cssItem))
- text: *string?*

<a id="imageItem"></a>

#### [ImageItem](./src/model/ImageItem.js) (extend [Item](#item))
- isCover: *boolean* (**Default: false**)

<a id="fontItem"></a>

#### [FontItem](./src/model/FontItem.js) (extend [Item](#item))

<a id="deadItem"></a>

#### [DeadItem](./src/model/DeadItem.js) (extend [Item](#item))
- reason: *string* (**Default: DeadItem.Reason.UNDEFINED**)

<a id="navPoint"></a>

### [NavPoint](./src/model/NavPoint.js)

- id: *string?*
- label: *string?*
- src: *string?*
- anchor: *string?*
- depth: *number* (**Default: 0**)
- children: *NavPoint[]*
- spine: *[SpineItem](#spineItem)?*

<a id="parseOptions"></a>

## Parse Options

* [validatePackage](#validatePackage)
* [validateXml](#validateXml)
* [allowNcxFileMissing](#allowNcxFileMissing)
* [unzipPath](#unzipPath)
* [createIntermediateDirectories](#createIntermediateDirectories)
* [removePreviousFile](#removePreviousFile)
* [ignoreLinear](#ignoreLinear)
* [useStyleNamespace](#useStyleNamespace)
* [styleNamespacePrefix](#styleNamespacePrefix)

---

<a id="validatePackage"></a>

### validatePackage: *`boolean`*

If true, validation package specifications in [IDPF listed](http://www.idpf.org/doc_library/epub/OCF_2.0.1_draft.doc) below.
- Zip header should not corrupt.
- `mimetype` file must be first file in archive.
- `mimetype` file should not compressed.
- `mimetype` file should only contain string `application/epub+zip`.
- Should not use extra field feature of ZIP format for mimetype file.

**Default:** `false`

---

<a id="validateXml"></a>

### validateXml: *`boolean`*

If true, stop parsing when XML parsing errors occur.

**Default:** `false`

---

<a id="allowNcxFileMissing"></a>

### allowNcxFileMissing: *`boolean`*

If false, stop parsing when NCX file not exists.

**Default:** `true`

---

<a id="unzipPath"></a>

### unzipPath: *`string?`*

If specified, uncompress to that path.
> Only if input is buffer or file path of EPUB file.

**Default:** `undefined`

---

<a id="createIntermediateDirectories"></a>

### createIntermediateDirectories: *`boolean`*

If true, creates intermediate directories for unzipPath.

**Default:** `true`

---

<a id="removePreviousFile"></a>

### removePreviousFile: *`boolean`*

If true, removes a previous file from unzipPath.

**Default:** `true`

---

<a id="ignoreLinear"></a>

### ignoreLinear: *`boolean`*

If true, ignore `spineIndex` difference caused by `isLinear` property of [SpineItem](#spineItem).

```js
// e.g. If left is false, right is true.
[{ spineIndex: 0, isLinear: true, ... },       [{ spineIndex: 0, isLinear: true, ... },
{ spineIndex: 1, isLinear: true, ... },        { spineIndex: 1, isLinear: true, ... },
{ spineIndex: -1, isLinear: false, ... },      { spineIndex: 2, isLinear: false, ... },
{ spineIndex: 2, isLinear: true, ... }]        { spineIndex: 3, isLinear: true, ... }]
```

**Default:** `true`

---

<a id="useStyleNamespace"></a>

### useStyleNamespace: *`boolean`*

If true, One namespace is given per CSS file or inline style, and styles used for spine is described.

Otherwise it [CssItem](#cssItem)`.namespace`, [SpineItem](#spineItem)`.styles` is `undefined`.

In any list, [InlineCssItem](#inlineCssItem) is always positioned after [CssItem](#CssItem). ([Book](#book)`.styles`, [Book](#book)`.items`, [SpineItem](#spineItem)`.styles`, ...)

**Default:** `false`

---

<a id="styleNamespacePrefix"></a>

### styleNamespacePrefix: *`string`*

Prepend given string to namespace for identification.

**Default:** `'ridi_style'`

---

<a id="readOptions"></a>

## Read Options

* [encoding](#encoding)
* [ignoreEntryNotFoundError](#ignoreEntryNotFoundError)
* [basePath](#basePath)
* [spine.extractBody](#spine_extractBody)
* [spine.extractAdapter](#spine_extractAdapter)
* [css.removeAtrules](#css_removeAtrules)
* [css.removeTags](#css_removeTags)
* [css.removeIds](#css_removeIds)
* [css.removeClasses](#css_removeClasses)

---

<a id="encoding"></a>

### encoding: *`string?`*

If specified then returns a string. Otherwise it returns a buffer.

If specify `default`, use [Item](#item)`.defaultEncoding`.

```js
Item.defaultEncoding // undefined (=buffer)
SpineItem.defaultEncoding // 'utf8'
CssItem.defaultEncoding // 'utf8'
InlineCssItem.defaultEncoding // 'utf8'
ImageItem.defaultEncoding // undefined (=buffer)
```

**Default:** `'default'`

---

<a id="encodignoreEntryNotFoundErroring"></a>

### ignoreEntryNotFoundError: *`boolean`*

If false, throw Errors.ITEM_NOT_FOUND.

**Default:** `true`

---

<a id="basePath"></a>

### basePath: *`string?`*

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

<a id="spine_extractBody"></a>

### spine.extractBody: *`boolean`*

If true, extract body. Otherwise it returns a full string.

true:

```js
{
  body: '\n  <p>Extract style</p>\n  <img src=\"../Images/api-map.jpg\"/>\n',
  attrs: [
    {
      key: 'style',
      value: 'background-color: #000000;',
    },
    { // Only added if useStyleNamespace is true.
      key: 'class',
      value: '.ridi_style2, .ridi_style3, .ridi_style4, .ridi_style0, .ridi_style1',
    },
  ],
}
```

false:

```js
'<!doctype><html>\n<head>\n</head>\n<body style="background-color: #000000;">\n  <p>Extract style</p>\n  <img src=\"../Images/api-map.jpg\"/>\n</body>\n</html>'
```

**Default:** `false`

---

<a id="spine_extractAdapter"></a>

### spine.extractAdapter: *`function`*

If specified, transforms output of extractBody.

<a id="defaultExtractAdapter"></a>

Define adapter:

```js
const extractAdapter = (body, attrs) => {
  let string = '';
  attrs.forEach((attr) => {
    string += ` ${attr.key}=\"${attr.value}\"`;
  });
  return {
    content: `<article${string}>${body}</article>`,
  };
};
```

Result:

```js
{
  content: '<article style=\"background-color: #000000;\" class=\".ridi_style2, .ridi_style3, .ridi_style4, .ridi_style0, .ridi_style1\">\n  <p>Extract style</p>\n  <img src=\"../Images/api-map.jpg\"/>\n</article>',
}
```

**Default:** `defaultExtractAdapter`

---

<a id="css_removeAtrules"></a>

### css.removeAtrules: *`string[]`*

Remove at-rules.

**Default:** `['charset', 'import', 'keyframes', 'media', 'namespace', 'supports']`

---

<a id="css_removeTags"></a>

### css.removeTags: *`string[]`*

Remove selector that point to specified tags.

**Default:** `[]`

---

<a id="css_removeIds"></a>

### css.removeIds: *`string[]`*

Remove selector that point to specified ids.

**Default:** `[]`

---

<a id="css_removeClasses"></a>

### css.removeClasses: *`string[]`*

Remove selector that point to specified classes.

**Default:** `[]`

---
