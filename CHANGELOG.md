# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

* None

## [0.2.0 (2018-11-19)]

### Added

* Add `serializedAnchor` option.
* Add `Author.fileAs` property.
* Add encrypt and decrypt function.

### Changed

* Change `ignoreLinear` option default. (`true` => `false`)
* Change `useStyleNamespace` option default. (`false` => `true`)
* Change `readOptions` structure.
* Remove `usingCssOptions` and `validateXml` option.
* Rename `useStyleNamespace` to `parseStyle`.
* Rename `SpineItem.spineIndex` to `SpineItem.index`.

### Fixed

* Fix an issue where ncx could not be found in opf, and `allowNcxFileMissing` was false, but no exception was thrown.
* Fix an issue where `Book.spines` order does not match spine order of OPF.

## [0.1.1 (2018-10-08)]

### Fixed

* Fix invalid class name for style namespace.

## [0.1.0 (2018-09-12)]

### Added

* Add `overwrite` option.
* Add `spine.uesCssOptions` option.

### Changed

* Remove `spine.extractAdapter` option.
* Remove `createIntermediateDirectories` and `removePreviousFile` options. (replaced by `overwrite` option)
* Change `css.removeAtrules` option default.
* Improve parsing of epub version.
* Simplifies return type of `readitem` or `readItems`.

### Fixed

* Fix an issue where cssParser can not handle URL that are not wrapped in a string.
* Fix an issue where cssParser does not ignore `:not(x)` function.

## [0.0.2 (2018-09-11)]

### Fixed

* Fix broken export/import.

## [0.0.1 (2018-08-30)]

* First release.

[Unreleased]: https://github.com/ridi/epub-parser/compare/0.2.0...HEAD
[0.2.0 (2018-11-19)]: https://github.com/ridi/epub-parser/compare/0.1.1...0.2.0
[0.1.1 (2018-10-08)]: https://github.com/ridi/epub-parser/compare/0.1.0...0.1.1
[0.1.0 (2018-09-12)]: https://github.com/ridi/epub-parser/compare/0.0.2...0.1.0
[0.0.2 (2018-09-11)]: https://github.com/ridi/epub-parser/compare/0.0.1...0.0.2
[0.0.1 (2018-08-30)]: https://github.com/ridi/epub-parser/compare/0e4d3b3...0.0.1
