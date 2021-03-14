# MagicMirror-Modules-Thingiverse Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [1.1.1] - Released

### Bug Fixes

- Fixed issue where the `page` variable would be set to `0` and sent in the API request, resulting in no data.
- Added validation ensuring that `things` are only set to an array, not data.

## [1.1.0] - Released

### Features

- Added a `category` property, allowing users to display things based on a specific category.
- Added a `isFeatured` property, allowing users to display things that were / are featured on Thingiverse.
- Added a `numThingsDisplayed` property, allowing users to display 1, 3, or 5 things at any given time.
- Added a `searchBy` property, allowing users to display either newest things, or popular things.
- Added safety checking and fallback, such that if there is an error pulling things for a category, it will revert to displaying popular / newest things, whatever your config is set to.
- Added alt image text in the event the thumbnail image could not be displayed.

### Bug Fixes

- Removed the QR Code display from the module, QR Code generation was not properly working.
- Fixed issue where, when all things had been displayed and the next things were getting ready, the screen would be blank.

## [1.0.0] - Released

First public release
