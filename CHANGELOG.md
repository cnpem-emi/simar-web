# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2022-08-25
### Added
- Unavailable sensors show as greyed out

### Changed
- Ported to Typescript
- Fixes number of available pages

## [0.5.0] - 2022-05-25
### Added
- Support for custom outlet names
- Button to plot all PVs

### Changed
- Opens power data in new tab

## [0.4.0] - 2022-02-11
### Added
- User can now unlink devices or their Telegram ID from notifications
- Leak sensor state

### Changed
- Fixes subscriptions not getting updated when user logs in or unsubscribes to all

## [0.3.0] - 2021-12-14
### Added
- Pressure limit range
- Uses skeleton loaders to indicate loading
- Limit is automatically updated

### Changed
- Multiple fixes to accomodate mobile browsers
- Moves to definitive API
- Uses API for remote actuation instead
- No longer uses CDN for icons
- Improved compiled size

## [0.2.0] - 2021-10-28
### Added
- Support for push notifications on selected events

### Changed
- Configuration file is less of a mess
- Automatic fill-in templates
- Restructure PV objects

## [0.1.0] - 2021-09-23
### Added
- Displays ambient temperature separately
- Monitors power factor, voltage "glitches"
- Limits get pushed to Redis DB

### Changed
- Page size reduced by 18%
- Fixed Git link
- Several performance, size changes

## [0.0.2] - 2021-08-31
### Added
- Microsoft Authentication
- User can now edit alarm limits on a per-rack basis
- User can actuate outlets remotely and securely
- Adds voltage/current data
- Displays SIMAR BBB data (connection status, type of connection)

## [0.0.1] - 2021-07-23
### Added
- First version of the SIMAR GUI, displays humidity, door, pressure and temperature information