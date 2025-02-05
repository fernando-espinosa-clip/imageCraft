# Changelog

All notable changes to this project will be documented in this file.

## [2.2.1] - 2025-02-05
### Chore
- **release**: 2.2.1

### Other
- Merge pull request #1: Release support for SQLite and PostgreSQL.
- Updated README to reflect changes in version 2.2.0.

## [2.2.0] - 2025-02-05
### Added
- Health check endpoint (`/health`) to verify server status.
- Upsert functionality for image records in SQLite and PostgreSQL.
- Introduced `countUsers` queries for user seeding.

### Changed
- Refactored user permissions parsing logic to improve readability and error handling.
- Refactored SQLite and PostgreSQL table initialization into separate files for modularity.
- Added modular queries for listing and counting images by users or globally.

### Fixed
- Adjusted S3 image upload to remove dependency on `@aws-sdk/lib-storage`.

## [2.1.2] - 2025-02-05
### Other
- Updated README for clarification.

## [Unreleased]
### Added
- Support for multiple database types using strategy patterns (`SQLite` and `PostgreSQL`).
- Seeder module for initializing mock user data.

### Changed
- Centralized database query management using a query factory.
- Refactored database handling to adopt strategy patterns.

### Security
- Added environment-specific SSL configurations for PostgreSQL connections.