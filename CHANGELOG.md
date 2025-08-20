# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-08-20

### Added

- Initial release of postcss-inline-extract
- Extract inline styles from HTML `style` attributes
- Support for multiple selector generation strategies:
  - `class`: Use existing class attributes (`.className`)
  - `id`: Use existing id attributes (`#idName`)
  - `hash`: Generate random hash selectors (`.abc123`)
- Optional extraction from `<style>` tags via `styleTags` option
- Automatic property merging for duplicate selectors
- Configurable CSS indentation via `indent` option
- TypeScript support with full type definitions
- Support for compound selectors from multiple classes
- Comprehensive test suite with 43 test cases using Vitest
- PostCSS Plugin Guidelines compliance
- Proper error handling with PostCSS error reporting

### Technical Details

- Built with TypeScript targeting ES2018
- Uses `node-html-parser` for HTML parsing
- PostCSS as peer dependency
- Rollup + esbuild for bundling
- ESLint with strict TypeScript configuration
- Vitest for testing with coverage reporting
- GitHub Actions CI workflow for automated testing

[Unreleased]: https://github.com/KNOWLEDGECODE/postcss-inline-extract/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/KNOWLEDGECODE/postcss-inline-extract/releases/tag/v0.1.0
