# Botium Connector for Voice Apps

[![NPM](https://nodei.co/npm/botium-connector-webdrivervoice.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/botium-connector-webdrivervoice/)

[![Codeship Status for codeforequity-at/botium-connector-webdrivervoice](https://app.codeship.com/projects/fc2102d9-3a6e-4276-b2c0-b613007696c8/status?branch=main)](https://app.codeship.com/projects/447533)
[![npm version](https://badge.fury.io/js/botium-connector-webdrivervoice.svg)](https://badge.fury.io/js/botium-connector-webdrivervoice)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)]()

Uses [Perfecto Audio Functions](https://help.perfecto.io/perfecto-help/content/perfecto/automation-testing/audio_functions.htm) to test voice-controlled smartphone apps and websites.

## Supported Capabilities

Set the capability __CONTAINERMODE__ to __webdrivervoice__ to activate this connector.

### WEBDRIVERVOICE_OPTIONS
The [Webdriver.io](https://webdriver.io/docs/options.html)-Options

### WEBDRIVERVOICE_URL
The url to open in the browser

### WEBDRIVERVOICE_APP
The app to install. See [Appium documentation](http://appium.io/docs/en/writing-running-appium/caps/)

### WEBDRIVERVOICE_APPPACKAGE / WEBDRIVERVOICE_APPACTIVITY
The app package and activity to test. See [Appium documentation](http://appium.io/docs/en/writing-running-appium/caps/)

### WEBDRIVERVOICE_APPNORESET
_Default: false_

Reset app state before testing. See [Appium documentation](http://appium.io/docs/en/writing-running-appium/caps/)

### WEBDRIVERVOICE_LANGUAGE
_Default: us-english_

### WEBDRIVERVOICE_GENDER
_Default: female_

### WEBDRIVERVOICE_INPUT_NAVIGATION_BUTTONS

### WEBDRIVERVOICE_INPUT_STARTRECORD

### WEBDRIVERVOICE_INPUT_STOPRECORD

### WEBDRIVERVOICE_HAS_WELCOME

### WEBDRIVERVOICE_OUTPUT_PLAYTIMEOUT
_Default: 10000_ (10 seconds)

### WEBDRIVERVOICE_OUTPUT_PLAY

### WEBDRIVERVOICE_OUTPUT_PROFILE
_Default: accuracy_

### WEBDRIVERVOICE_OUTPUT_TRANSCRIBE
_Default: true_

### WEBDRIVERVOICE_OUTPUT_LANGUAGE
