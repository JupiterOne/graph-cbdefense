# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## 1.0.0 - 2020-06-15

### Added

- Alerts are ingested as `Finding` entities, the last 5 days or since last
  successful execution.

### Changed

- Now using Devices API V6 and Alerts API V6. This led to the loss of `Policy`
  ingestion for this release.
- Authentication must be reconfigured in the Carbon Black Cloud Console to
  provide an API Key and API ID (formerly Connector ID), associated with a
  custom read-only Access Level.
- `orgKey` is now a required instance config field to support the use of the
  latest platform APIs.
