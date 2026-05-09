# Changelog

All notable changes to this project will be documented in this file.

## [2.3.0] - 2026-05-08

### Added
- User authentication: registration with bcrypt password hashing, login by credentials and API key, token renewal endpoint.
- Custom JWT format: user-specific secret (`JWT_SECRET + apiKey`), `loginMode` in payload, token format `<jwt>.<encrypted_apiKey>`, auto-refresh via `X-New-Token` header when <5 min remaining.
- `POST /auth/register` with input validation (email format, password min 8 chars, username allowlist).
- `POST /auth/login/apikey` — API key-based authentication.
- `POST /auth/renew-token` — renew a valid JWT.
- `utils/passwordUtils.js` — bcrypt hash/compare helpers.
- `utils/databaseErrors.js` — `UniqueConstraintError` with SQLite and PostgreSQL constraint mapping.
- `helmet` — HTTP security headers on all responses.
- `express-rate-limit` — 10 req/15 min on `/auth/*`, 50 req/hr on `/images/upload`.
- `safeJoin()` path traversal guard in `LocalStorageStrategy`.
- `limitInputPixels: 25M` in sharp to prevent decompression bombs.
- ESLint v9 flat config (`eslint.config.js`), replacing legacy `.eslintrc.json`.

### Changed
- `GET /images/:key` now requires authentication.
- `DELETE /images/:key` and `GET /images` always scope by `req.user.userId`.
- CORS: fixed `allowedHeaders` key (was `headers`), rejects requests without `Origin`, removed `http://example.com` default.
- Global error handler hides internal `error.message` in production.
- Database seeder disabled when `NODE_ENV=production`.
- PostgreSQL TLS `rejectUnauthorized` enabled in production.
- Redis cache invalidation uses `SCAN` cursor instead of blocking `KEYS`.
- `multer` config: fixed `fileFilter` key (was `fileName`), removed SVG from allowed types.
- JSON body size capped at 100kb (`express.json({ limit: "100kb" })`).
- `verifyToken` now returns `{ ...payload, apiKey }` enabling correct token renewal.
- `generateToken` uses `config.jwtExpirationTime` (respects `JWT_EXPIRATION_TIME` env var).
- OpenAPI spec updated to v2.3.0 with full auth endpoint documentation.

### Removed
- `services/database-old.js` dead code.
- `save-dev` accidental production dependency.
- SVG (`image/svg+xml`) from upload allowed MIME types.

### Fixed
- Auto-refresh token in `middleware/auth.js` was generating broken tokens (`userId: undefined`).
- `renewToken` endpoint was using `req.user.id` (undefined) instead of `req.user.userId`.
- `register` was returning hashed password in response.
- `register` token generation used wrong field names.
- `multer` `fileFilter` was never applied due to typo.

### Security
- Removed real AWS/Postgres/JWT credentials from git tracking.
- `npm audit fix` applied: reduced from 46 to 9 vulnerabilities (remaining 7 are build-time only via `tar`/`node-gyp`, not runtime).

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