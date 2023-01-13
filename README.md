# SkyLight

## Features

This extension automatically adjusts the color theme based on light sensor readings.

## Requirements

Currently this extension only supports windows 10 19H1 or later.

You must have a light sensor connected to your computer.

## Extension Settings

The themes used in bright and dark environments will be retrieved from `workbench.preferredLightColorTheme` and `workbench.preferredDarkColorTheme`.

If the reading in Lux of your light sensor is greater than `skylight.upperThreshold`, the theme will be set to `workbench.preferredLightColorTheme`. If the reading in Lux of your light sensor is less than `skylight.lowerThreshold`, the theme will be set to `workbench.preferredDarkColorTheme`.

`skylight.upperThreshold` should be greater than `skylight.lowerThreshold`.

Make sure to turn off `window.autoDetectColorScheme` and `window.autoDetectHighContrast`.

## Known Issues

## Release Notes

### 0.0.1

Just a prototype.
