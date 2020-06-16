# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Alerts are ingested as `Finding` entities, the last 5 days or since last
  successful execution.

### Changed

- Using V6 platform API and RBAC API tokens to support Alert ingestion. This led
  to the loss of `Policy` ingestion for this release.

- `orgKey` is now a required instance config field for the V6 platform API.
