# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## 1.2.0

### Changed

- Redacted `encoded_activation_code`, `uninstall_code`

## 1.1.0

### Changed

- Redacted `activation_code`

## 1.0.2 - 2020-06-16

### Fixed

- Alerts could be skipped because the last job may have failed, so that when the
  current job runs, it did not search alerts to the last successful ingestion.

## 1.0.1 - 2020-06-16

### Added

- Alert `Finding.description` is set from the `reason` to improve display in
  JupiterOne alerts views.

### Changed

- Alert `Finding.name` is now the alert `id` value.
- Alert `Finding.displayName` includes a few properties combined to make a more
  descriptive value, falling back on the alert `id` instead of a short version
  of the `threat_id`.

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
