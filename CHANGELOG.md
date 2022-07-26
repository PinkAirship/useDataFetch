# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [3.2.7] - 2022-07-26

### Added

### Changed

- useFetchOnMount, useFetched, and useFetchedArray now cancels axios requests when `cancelRequestOnUnmount` is passed
- updated several outdated packages

### Removed

## [3.2.6] - 2021-05-10

### Added

### Changed

- Fixed useFetchedArray at the method level to properly override values

### Removed

## [3.2.5] - 2021-03-31

### Added

### Changed

- Fixed useCache to run callbacks if cache found

### Removed

## [3.2.5] - 2021-03-31

### Added

- Added the window.dataFetchCaches option to DataFetchProvider to see what the cache holds

### Changed

- Fixed useCache to only run on a GET request

### Removed

## [3.2.4] - 2021-03-31

### Added

### Changed

- Fixed memoization issue that broke useDataFetch method stability for useEffect

### Removed

## [3.2.3] - 2021-03-31

### Added

### Changed

- Changed a bad reference to alertScreenreaderWith

### Removed

## [3.2.2] - 2021-03-31

### Added

### Changed

- Changed useFetchedArray to fix where the default values of the opts were not being populated
- Changed useFetched to fix where the default values of the opts were not being populated

### Removed

## [3.2.1] - 2021-03-31

### Added

### Changed

- Changed useFetchedArray to allow for more intelligence in adding data to array from a fetch

### Removed

## [3.2.0] - 2021-03-31

### Added

- Added useFetchOnMount
- Added useFetchedArray
- Added useFetched

### Changed

### Removed

## [3.1.1] - 2021-02-13

### Added

- Added esm, cjs exports

### Changed

### Removed

## [3.1.0] - 2021-02-13

### Added

- Add query function

### Changed

### Removed

## [3.0.0] - 2021-02-13

### Added

- Update state hook on data provider
- Request lifecycle state hook
- Explanation in documentation of the three main levels of the hook's configuration
- Changelog

### Changed

- get|post|put|patch|destroy|request api changed to allow a single opts hash
- request now accepts configuration of url and method at the request level
- `addData` changed to `updateStateHook` to more clearly state its purpose

### Removed
