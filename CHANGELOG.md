# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.0] - 2021-02-13

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