[![Build Status](https://travis-ci.com/ridi/content-parser.svg?branch=master)](https://travis-ci.com/ridi/content-parser)
[![codecov](https://codecov.io/gh/ridi/content-parser/branch/master/graph/badge.svg)](https://codecov.io/gh/ridi/content-parser)

# Packages

## [@ridi/parser-core](../parser-core/index.html)

> Utilities for parsers

[![NPM version](https://badge.fury.io/js/%40ridi%2Fparser-core.svg)](https://badge.fury.io/js/%40ridi%2Fparser-core)
[![NPM total downloads](https://img.shields.io/npm/dt/%40ridi%2Fparser-core.svg)](https://npm.im/%40ridi%2Fparser-core)

## [@ridi/content-parser](../content-parser/index.html)

> Content data parser for Ridibooks services (epub-parser + comic-parser + pdf-parser)

[![NPM version](https://badge.fury.io/js/%40ridi%2Fcontent-parser.svg)](https://badge.fury.io/js/%40ridi%2Fcontent-parser)
[![NPM total downloads](https://img.shields.io/npm/dt/%40ridi%2Fcontent-parser.svg)](https://npm.im/%40ridi%2Fcontent-parser)

## [@ridi/epub-parser](../epub-parser/index.html)

> Common EPUB2 data parser for Ridibooks services

[![NPM version](https://badge.fury.io/js/%40ridi%2Fepub-parser.svg)](https://badge.fury.io/js/%40ridi%2Fepub-parser)
[![NPM total downloads](https://img.shields.io/npm/dt/%40ridi%2Fepub-parser.svg)](https://npm.im/%40ridi%2Fepub-parser)

## [@ridi/comic-parser](../comic-parser/index.html)

> Common comic data parser for Ridibooks services

[![NPM version](https://badge.fury.io/js/%40ridi%2Fcomic-parser.svg)](https://badge.fury.io/js/%40ridi%2Fcomic-parser)
[![NPM total downloads](https://img.shields.io/npm/dt/%40ridi%2Fcomic-parser.svg)](https://npm.im/%40ridi%2Fcomic-parser)

## [@ridi/pdf-parser](../pdf-parser/index.html)

> Common PDF data parser for Ridibooks services

[![NPM version](https://badge.fury.io/js/%40ridi%2Fpdf-parser.svg)](https://badge.fury.io/js/%40ridi%2Fpdf-parser)
[![NPM total downloads](https://img.shields.io/npm/dt/%40ridi%2Fpdf-parser.svg)](https://npm.im/%40ridi%2Fpdf-parser)

# Development

## Setup

```
$ git clone git@github.com:ridi/content-parser.git
$ yarn
```
> [yarn](https://yarnpkg.com) required.

## Commands

If you want install the development environment or add a new dependency to the package or add a new package, run the following command:

```
$ yarn
```

If you want only build, the following command:

```
$ yarn build
```
> `yarn clean` are preceded.

If you want only lint, the following command:

```
$ yarn lint
```

To test each package, use the following command:

```
$ yarn test
```
> `yarn build` and `yarn lint` are preceded.

To deploy the new version, use the following command:

```
$ yarn bump
```
> Version names must conform to [SemVer](https://semver.org).
