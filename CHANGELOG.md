# Change Log

All notable changes to JSONPath Notebook will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.4.0] - 2025-01-18

### Upgrades
- Upgraded underlying JSONPath engine `json-p3` to the latest version `2.0`. This upgrade includes various bug fixes and improvements. See https://github.com/jg-rp/json-p3/releases for more details.

## [2.3.0] - 2024-06-09

### Added
- Added a walkthrough page which explains the extension's most important features. The walkthrough is opened automatically when the extension is installed for the first time. It can be opened again using the `JSONPath Notebook: Get Started` command.
- Updated JSONPath engine (JSON P3) to version 1.3.3. See https://github.com/jg-rp/json-p3/releases for more information.

### Fixed
Fixed an issue where the extension would not cancel the execution of a query when the input file could not be found and the user chose to cancel the file selection dialog.

## [2.2.0] - 2024-04-04

### Added
Switch between standard and non-standard syntax for [additional functionality](https://github.com/mesarth/JSONPath-Notebook#extended-syntax-mode)

## [2.1.0] - 2024-03-24

### Changed
The result of a query is now always an array, even if the query returns a single node. The JSONPath standard does not specify how this should be represented. This change makes the behavior more predictable and consistent with other JSONPath tools.

## [2.0.0] - 2024-03-21

### Breaking Changes

JSONPath Notebook is now fully compliant with the [JSONPath proposed standard](https://www.rfc-editor.org/rfc/rfc9535.html).


Most existing queries should work without any changes. However, some queries which are not valid according to the standard may need to be adjusted.

### Added
- Ignore whitespace characters and line terminators before and after the JSONPath expression


## [1.2.1] - 2024-01-15

### Added

- Automatically close single and double quotes when typing in a query
- Tags for marketplace listing

### Fixed

## [1.1.1] - 2024-01-03

### Fixed

- Better error handling for invalid queries (should not produce infinite execution loops anymore)
- Do not show file chooser on markdown cells

## [1.1.0] - 2023-11-07

### Added

- Display button to select input file (context) on newly created cells. Previously, this was only shown when a cell already had a file context.

### Fixed

- Uninterruptible query execution when the file chooser is canceled without selecting anything.

## [1.0.0] - 2023-10-17

### Added

- option to use relative paths for input files (new default). The behavior can be changed via settings. (#6)

## [0.0.6] - 2023-09-06

### Fixed

- context switch on Windows (#4)

## [0.0.5] - 2023-09-05

### Fixed

- README cutoff

## [0.0.4] - 2023-08-31

### Fixed

- Infinite execution loop when input file is not valid JSON (#1)

### Changed

- Extension icon

## [0.0.3] - 2023-08-30

- no extension changes
- marketplace listing update

## [0.0.2] - 2023-08-30

- no extension changes
- marketplace listing update and CI improvements

## [0.0.1] - 2023-08-30

- Initial release
