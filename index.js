const BotiumConnectorWebdriverVoice = require('./src/connector')

module.exports = {
  PluginVersion: 1,
  PluginClass: BotiumConnectorWebdriverVoice,
  PluginDesc: {
    name: 'Voice (Selenium or Appium)',
    provider: 'Botium',
    features: {
      audioInput: true,
      supportedFileExtensions: ['.wav']
    },
    capabilities: [
      {
        name: 'WEBDRIVERVOICE_OPTIONS',
        label: 'Webdriver.io Options',
        type: 'json',
        required: true
      }
    ]
  }
}
