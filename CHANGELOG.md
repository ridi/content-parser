# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

* None

## [0.1.1 (2018-10-08)]

### Fixed

* Fix invalid class name for style namespace.

## [0.1.0 (2018-09-12)]

### Added

* Add `overwrite` option.
* Add `uesCssOptions` option.

### Changed

* Remove `extractAdapter` option.
* Remove `createIntermediateDirectories` and `removePreviousFile` options. (replaced by `overwrite` option)
* Change `removeAtrules` option default.
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

[Unreleased]: https://github.com/ridi/epub-parser/compare/0.1.1...HEAD
[0.1.1 (2018-10-08)]: https://github.com/ridi/epub-parser/compare/0.1.0...0.1.1
[0.1.0 (2018-09-12)]: https://github.com/ridi/epub-parser/compare/0.0.2...0.1.0
[0.0.2 (2018-09-11)]: https://github.com/ridi/epub-parser/compare/0.0.1...0.0.2
[0.0.1 (2018-08-30)]: https://github.com/ridi/epub-parser/compare/0e4d3b3...0.0.1
