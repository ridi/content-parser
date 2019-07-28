# Packages

## [@ridi/parser-core](packages/parser-core) 

> Utilities for parsers

[![NPM version](https://badge.fury.io/js/%40ridi%2Fparser-core.svg)](https://badge.fury.io/js/%40ridi%2Fparser-core)
[![Build Status](https://travis-ci.org/ridi/content-parser.svg?branch=master)](https://travis-ci.org/ridi/content-parser)
[![codecov](https://codecov.io/gh/ridi/content-parser/branch/master/graph/badge.svg)](https://codecov.io/gh/ridi/content-parser)
[![NPM total downloads](https://img.shields.io/npm/dt/%40ridi%2Fparser-core.svg)](https://npm.im/%40ridi%2Fparser-core)
[![Greenkeeper badge](https://badges.greenkeeper.io/ridi/content-parser.svg)](https://greenkeeper.io/)

## [@ridi/content-parser](packages/content-parser)

> Content data parser for Ridibooks services (epub-parser + comic-parser + pdf-parser)

[![NPM version](https://badge.fury.io/js/%40ridi%2Fcontent-parser.svg)](https://badge.fury.io/js/%40ridi%2Fcontent-parser)
[![Build Status](https://travis-ci.org/ridi/content-parser.svg?branch=master)](https://travis-ci.org/ridi/content-parser)
[![codecov](https://codecov.io/gh/ridi/content-parser/branch/master/graph/badge.svg)](https://codecov.io/gh/ridi/content-parser)
[![NPM total downloads](https://img.shields.io/npm/dt/%40ridi%2Fcontent-parser.svg)](https://npm.im/%40ridi%2Fcontent-parser)
[![Greenkeeper badge](https://badges.greenkeeper.io/ridi/content-parser.svg)](https://greenkeeper.io/)

## [@ridi/epub-parser](packages/epub-parser)

> Common EPUB2 data parser for Ridibooks services

[![NPM version](https://badge.fury.io/js/%40ridi%2Fepub-parser.svg)](https://badge.fury.io/js/%40ridi%2Fepub-parser)
[![Build Status](https://travis-ci.org/ridi/content-parser.svg?branch=master)](https://travis-ci.org/ridi/content-parser)
[![codecov](https://codecov.io/gh/ridi/content-parser/branch/master/graph/badge.svg)](https://codecov.io/gh/ridi/content-parser)
[![NPM total downloads](https://img.shields.io/npm/dt/%40ridi%2Fepub-parser.svg)](https://npm.im/%40ridi%2Fepub-parser)
[![Greenkeeper badge](https://badges.greenkeeper.io/ridi/content-parser.svg)](https://greenkeeper.io/)

## [@ridi/comic-parser](packages/comic-parser)

> Common comic data parser for Ridibooks services

[![NPM version](https://badge.fury.io/js/%40ridi%2Fcomic-parser.svg)](https://badge.fury.io/js/%40ridi%2Fcomic-parser)
[![Build Status](https://travis-ci.org/ridi/content-parser.svg?branch=master)](https://travis-ci.org/ridi/content-parser)
[![codecov](https://codecov.io/gh/ridi/content-parser/branch/master/graph/badge.svg)](https://codecov.io/gh/ridi/content-parser)
[![NPM total downloads](https://img.shields.io/npm/dt/%40ridi%2Fcomic-parser.svg)](https://npm.im/%40ridi%2Fcomic-parser)
[![Greenkeeper badge](https://badges.greenkeeper.io/ridi/content-parser.svg)](https://greenkeeper.io/)

## [@ridi/pdf-parser](packages/pdf-parser)

> Common PDF data parser for Ridibooks services

[![NPM version](https://badge.fury.io/js/%40ridi%2Fpdf-parser.svg)](https://badge.fury.io/js/%40ridi%2Fpdf-parser)
[![Build Status](https://travis-ci.org/ridi/content-parser.svg?branch=master)](https://travis-ci.org/ridi/content-parser)
[![codecov](https://codecov.io/gh/ridi/content-parser/branch/master/graph/badge.svg)](https://codecov.io/gh/ridi/content-parser)
[![NPM total downloads](https://img.shields.io/npm/dt/%40ridi%2Fpdf-parser.svg)](https://npm.im/%40ridi%2Fpdf-parser)
[![Greenkeeper badge](https://badges.greenkeeper.io/ridi/content-parser.svg)](https://greenkeeper.io/)

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
