# @ridi/content-parser

> Content data parser for Ridibooks services

[![npm version](https://badge.fury.io/js/%40ridi%2Fcontent-parser.svg)](https://badge.fury.io/js/%40ridi%2Fcontent-parser)
[![Build Status](https://travis-ci.org/ridi/content-parser.svg?branch=master)](https://travis-ci.org/ridi/content-parser)
[![codecov](https://codecov.io/gh/ridi/content-parser/branch/master/graph/badge.svg)](https://codecov.io/gh/ridi/content-parser)

## Install

```bash
npm install @ridi/content-parser
```

## Usage

```js
import {
  EpubParser,
  ComicParser,
  CryptoProvider,
  Cryptor,
} from '@ridi/content-parser';
// or const {
//   EpubParser,
//   ComicParser,
//   CryptoProvider,
//   Cryptor,
// } = require('@ridi/content-parser');
```

### [epub-parser](packages/epub-parser)

> Common EPUB2 data parser for Ridibooks services

### [comic-parser](packages/comic-parser)

> Common comic data parser for Ridibooks services
