const BotiumConnectorWebdriverVoice = require('./src/connector')

module.exports = {
  PluginVersion: 1,
  PluginClass: BotiumConnectorWebdriverVoice,
  PluginDesc: {
    name: 'Voice (Website or Smartphone)',
    provider: 'Botium',
    features: {
      audioInput: true,
      supportedFileExtensions: ['.wav']
    },
    capabilities: [
      {
        name: 'WEBDRIVERVOICE_GENDER',
        label: 'Input Voice Gender',
        type: 'choice',
        required: false,
        default: 'female',
        choices: [
          { name: 'female', key: 'female' },
          { name: 'male', key: 'male' }
        ]
      },
      {
        name: 'WEBDRIVERVOICE_LANGUAGE',
        label: 'Input Voice Language',
        type: 'choice',
        required: false,
        default: 'us-english',
        choices: [
          { name: 'US English', key: 'us-english' },
          { name: 'UK English', key: 'uk-english' },
          { name: 'Spanish', key: 'es-spanish' },
          { name: 'Japanese', key: 'japanese' },
          { name: 'French', key: 'french' },
          { name: 'German', key: 'german' },
          { name: 'Portuguese', key: 'portuguese' },
          { name: 'Italian', key: 'italian' }
        ]
      },
      {
        name: 'WEBDRIVERVOICE_OUTPUT_LANGUAGE',
        label: 'Chatbot Voice Language',
        type: 'choice',
        required: false,
        default: 'us-english',
        choices: [
          { name: 'US English', key: 'us-english' },
          { name: 'UK English', key: 'uk-english' },
          { name: 'Spanish', key: 'es-spanish' },
          { name: 'Japanese', key: 'japanese' },
          { name: 'French', key: 'french' },
          { name: 'Chinese', key: 'chinese' },
          { name: 'Portuguese', key: 'portuguese' },
          { name: 'Arabic', key: 'arabic' },
          { name: 'Hebrew-Israel', key: 'hebrew' }
        ]
      }
    ]
  }
}
