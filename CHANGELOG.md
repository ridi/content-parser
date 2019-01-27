# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

* None

## [0.3.0 (2018-01-27)]

### Added

* Add `comic-parser`, `parser-core` and `content-parser`.
* Add `Logger` that can control all console logs and log execution time for each method in `Parser`.
* Add `Parser.onProgress` property.
* Add `Parser.readOptions.force` option.
* Add cache to readEntries.fromDirectory.

### Changed

* Configure multi-packages environment using Lerna.
* `CryptoProvider` refactoring.
* Remove `EpubParser.parseOptions.ignoreLinear` option.
* Cache to subdirectory parsing result.

### Fixed

* Fix an issue where spine is always `undefined` for `NavPoint` with anchor exists or two depths.
* Fix an issue where string is broken at 16,384 byte intervals when en/decrypting.
* Fix an issue where can not be unzip under certain conditions.
* Fix bad file descriptor error on unzipping.

## [0.2.0 (2018-11-19)]

### Added

* Add `EpubParser.readOptions.serializedAnchor` option.
* Add `Author.fileAs` property.
* Add encrypt and decrypt function.

### Changed

* Change `EpubParser.parseOptions.ignoreLinear` option default. (`true` => `false`)
* Change `EpubParser.parseOptions.useStyleNamespace` option default. (`false` => `true`)
* Change `EpubParser.readOptions` structure.
* Remove `EpubParser.readOptions.usingCssOptions` and `EpubParser.parseOptions.validateXml` option.
* Rename `useStyleNamespace` to `parseStyle` in `EpubParser.parseOptions`.
* Rename `SpineItem.spineIndex` to `SpineItem.index`.

### Fixed

* Fix an issue where ncx could not be found in opf, and `EpubParser.parseOptions.allowNcxFileMissing` was false, but no exception was thrown.
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

[Unreleased]: https://github.com/ridi/content-parser/compare/0.3.0...HEAD
[0.3.0 (2019-01-27)]: https://github.com/ridi/content-parser/compare/0.2.0...0.3.0
[0.2.0 (2018-11-19)]: https://github.com/ridi/content-parser/compare/0.1.1...0.2.0
[0.1.1 (2018-10-08)]: https://github.com/ridi/content-parser/compare/0.1.0...0.1.1
[0.1.0 (2018-09-12)]: https://github.com/ridi/content-parser/compare/0.0.2...0.1.0
[0.0.2 (2018-09-11)]: https://github.com/ridi/content-parser/compare/0.0.1...0.0.2
[0.0.1 (2018-08-30)]: https://github.com/ridi/content-parser/compare/0e4d3b3...0.0.1
