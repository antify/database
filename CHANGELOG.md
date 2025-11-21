# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [3.3.0](https://github.com/antify/database/compare/v3.2.0...v3.3.0) (2025-11-21)


### Features

* Add vercel connection pooler ([f66fa98](https://github.com/antify/database/commit/f66fa984fe5951b09c563b3685b68e00539935f0))

## [3.2.0](https://github.com/antify/database/compare/v3.1.0...v3.2.0) (2025-11-21)


### Features

* Set minPoolSize and maxPoolSize to improve amount of connections ([a640551](https://github.com/antify/database/commit/a640551fea1e6064ae3a425bac915c31f6146cab))

## [3.1.0](https://github.com/antify/database/compare/v3.0.0...v3.1.0) (2025-11-05)


### Features

* Add serverless support to keep amount of connections low as possible ([72cd328](https://github.com/antify/database/commit/72cd328b3974502682b588303e37ca8fa26df6d2))

## [3.0.0](https://github.com/antify/database/compare/v2.0.0...v3.0.0) (2025-08-12)


### ⚠ BREAKING CHANGES

* You have to load your fixtures by yourself

### Features

* Expect loaded fixtures instead of projectRootDir for loading fixtures ([bc6dcac](https://github.com/antify/database/commit/bc6dcac1fb385b4eafc70fa606f7250b91344921))

## [2.0.0](https://github.com/antify/database/compare/v1.3.0...v2.0.0) (2025-05-06)


### ⚠ BREAKING CHANGES

* Change schema structure to keep type safety and auto transpile

### Features

* Add strict mode for MultiConnectionClients ([3238e52](https://github.com/antify/database/commit/3238e524b00ad394108342760f50d8b467db4b60))
* Change schema structure to keep type safety and auto transpile ([82fd226](https://github.com/antify/database/commit/82fd2265eb0eaa3fe597b4507902fdf9d415e48f))

## [1.3.0](https://github.com/antify/database/compare/v1.2.0...v1.3.0) (2025-03-12)


### Features

* Bump mongoose to ^8.12.1 and node to 22.14 ([37a2204](https://github.com/antify/database/commit/37a2204493cf4f52c672bb2be4be18c0bd2eba2e))

## [1.2.0](https://github.com/antify/database/compare/v1.1.0...v1.2.0) (2024-03-13)


### Features

* [#6](https://github.com/antify/database/issues/6) outsource getFilename functions into one ([4b15561](https://github.com/antify/database/commit/4b155613492f27fb72bb03f8d14c26c6a6a41172))

## 1.1.0 (2024-03-06)


### Features

* add automatic schema extension ([a8b818b](https://github.com/antify/database/commit/a8b818b9da1cfbc39c6579783e6b95a2f1936a7e))
* add repository section ([b4577f7](https://github.com/antify/database/commit/b4577f7e57923c3245ad16cd1f8c660f3351e39b))
* add specific error types ([4ea712a](https://github.com/antify/database/commit/4ea712affaa67955f12a7d061ccb7f12c85a4af9))
* add truncateCollections utility ([3ed9ab9](https://github.com/antify/database/commit/3ed9ab96ed35ed1b369c2116b752d57842e57d3c))


### Bug Fixes

* remove error types ([72a0f2b](https://github.com/antify/database/commit/72a0f2b506845f3b2b363d2b203e62797f09c728))
