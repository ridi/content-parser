# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

* None.

## [0.6.7 (2019-11-12)]

### Changed

* Revert "Dependencies and babel updates".
* Fixed specify cross-dependency version numbers exactly.

## [0.6.6 (2019-11-05)]

## [0.6.5 (2019-11-04)]

### Changed

* Dependencies and babel updates.

## [0.6.4 (2019-10-04)]

### Fixed

* Fix an issue where the hash function cannot be used externally.

## [0.6.3 (2019-10-03)]

### Added

* Add hash function.

### Fixed

* Fix an issue where parser error with an outline that cannot be inferred page.

## [0.6.2 (2019-09-10)]

### Added

* Add `PdfParser.parseOptions.fakeWorker` option. (default: `false`)

## [0.6.1 (2019-08-09)]

### Changed

* Replace `html` and `body` styles with namespace when If use `EpubParser.parseOptions.parseStyle` and `EpubParser.readOptions.extractBody` together.

### Fixed

* Fix an issue where encrypted zip file could not be opened.
* Fix an issue where unzipping process terminates if `CryptorProvider.bufferSize` is larger than file size to be unzip.

## [0.6.0 (2019-08-04)]

### Added

* Add `pdf-parser` package.
* Add `EpubParser.parseOptions.additionalInlineStyle` option. (default: `undefined`)
* Add `CryptoProvider.bufferSize` property.

### Changed

* Remove `Version.isValid` property.
* Improve cryption performance.

## [0.5.8 (2019-07-03)]

### Added

* Add `Parser.unzip(unzipPath, overwrite)` method.

### Changed

* Implement `Parser.parseOptions.overwrite` option.

## [0.5.7 (2019-07-03)]

### Added

* Add `EpubParser.readOptions.ignoreScript` option. (default: `false`)

### Changed

* Rename `EpubParser.readOptions.removeTags` to `.removeTagSelector`.
* Rename `EpubParser.readOptions.removeIds` to `.removeIdSelector`.
* Rename `EpubParser.readOptions.removeClasses` to `.removeClassSelector`.

## [0.5.6 (2019-06-12)]

### Fixed

* Fix an issue where invalid path generated when URI contains unusable characters.

## [0.5.5 (2019-05-15)]

### Fixed

* Fix a malfunction when parsing corrupted CSS.
* Fix an issue where `EpubParser.parseOptions.basePath` option is not reflected in image for svg.

## [0.5.4 (2019-05-14)]

### Changed

* Rename `Cryptor` to `AesCryptor`.

## [0.5.3 (2019-04-01)]

### Changed

* Change the `language` field to accept multiple values.

### Fixed

* Fix an issue where intermittently EBADF error occurred when unzipping.

## [0.5.2 (2019-02-18)]

### Fixed

* Fix an issue where directroy cache file is not overwritten.

## [0.5.1 (2019-02-14)]

### Fixed

* Fix an issue where broken cache values if that save out of ascii range.

## [0.5.0 (2019-02-13)]

### Added

* Add `LogLevel.DEBUG` and debug log in `Parser`.
* Add logLevel parameter for `Parser.constructor`.
* Add error code for `Cryptor` internal error.

### Changed

* Change `Logger.logLevel` default. (`error` => `warning`)
* Rename `LogLevel.WARNING` to `LogLevel.WARN`.

### Fixed

* Fix an issue where subpath sort was not natural.

## [0.4.1 (2019-02-12)]

### Changed

* Improve performance of parsing.

## [0.4.0 (2019-02-12)]

### Added

* Add `ComicParser.parseOptions.parseImageSize` option.
* Add `ComicBook.Item.width` and `ComicBook.Item.height`.

### Changed

* Rename `ComicBook.Item.size` to `ComicBook.Item.fileSize`.

## [0.3.1 (2019-01-31)]

### Fixed

* Fix an issue where JSON parsing errors in directory cache data when attempting to read items from same Book on multiple processes.

## [0.3.0 (2019-01-27)]

### Added

* Add `comic-parser`, `parser-core` and `content-parser`.
* Add `Logger` that can control all console logs and log execution time for each method in `Parser`.
* Add `Parser.onProgress` property.
* Add `Parser.readOptions.force` option.

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

[Unreleased]: https://github.com/ridi/content-parser/compare/0.6.7...HEAD
[0.6.7 (2019-11-12)]: https://github.com/ridi/content-parser/compare/0.6.6...0.6.7
[0.6.6 (2019-11-05)]: https://github.com/ridi/content-parser/compare/0.6.5...0.6.6
[0.6.5 (2019-11-04)]: https://github.com/ridi/content-parser/compare/0.6.4...0.6.5
[0.6.4 (2019-10-04)]: https://github.com/ridi/content-parser/compare/0.6.3...0.6.4
[0.6.3 (2019-10-03)]: https://github.com/ridi/content-parser/compare/0.6.2...0.6.3
[0.6.2 (2019-09-10)]: https://github.com/ridi/content-parser/compare/0.6.1...0.6.2
[0.6.1 (2019-08-09)]: https://github.com/ridi/content-parser/compare/0.6.0...0.6.1
[0.6.0 (2019-08-04)]: https://github.com/ridi/content-parser/compare/0.5.8...0.6.0
[0.5.8 (2019-07-03)]: https://github.com/ridi/content-parser/compare/0.5.7...0.5.8
[0.5.7 (2019-07-03)]: https://github.com/ridi/content-parser/compare/0.5.6...0.5.7
[0.5.6 (2019-06-12)]: https://github.com/ridi/content-parser/compare/0.5.5...0.5.6
[0.5.5 (2019-05-15)]: https://github.com/ridi/content-parser/compare/0.5.4...0.5.5
[0.5.4 (2019-05-14)]: https://github.com/ridi/content-parser/compare/0.5.3...0.5.4
[0.5.3 (2019-04-01)]: https://github.com/ridi/content-parser/compare/0.5.2...0.5.3
[0.5.2 (2019-02-18)]: https://github.com/ridi/content-parser/compare/0.5.1...0.5.2
[0.5.1 (2019-02-14)]: https://github.com/ridi/content-parser/compare/0.5.0...0.5.1
[0.5.0 (2019-02-13)]: https://github.com/ridi/content-parser/compare/0.4.1...0.5.0
[0.4.1 (2019-02-12)]: https://github.com/ridi/content-parser/compare/0.4.0...0.4.1
[0.4.0 (2019-02-12)]: https://github.com/ridi/content-parser/compare/0.3.1...0.4.0
[0.3.1 (2019-01-31)]: https://github.com/ridi/content-parser/compare/0.3.0...0.3.1
[0.3.0 (2019-01-27)]: https://github.com/ridi/content-parser/compare/0.2.0...0.3.0
[0.2.0 (2018-11-19)]: https://github.com/ridi/content-parser/compare/0.1.1...0.2.0
[0.1.1 (2018-10-08)]: https://github.com/ridi/content-parser/compare/0.1.0...0.1.1
[0.1.0 (2018-09-12)]: https://github.com/ridi/content-parser/compare/0.0.2...0.1.0
[0.0.2 (2018-09-11)]: https://github.com/ridi/content-parser/compare/0.0.1...0.0.2
[0.0.1 (2018-08-30)]: https://github.com/ridi/content-parser/compare/0e4d3b3...0.0.1
