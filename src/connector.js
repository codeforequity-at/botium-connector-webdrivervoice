const { v1: uuidV1 } = require('uuid')
const _ = require('lodash')
const axios = require('axios')
const FormData = require('form-data')
const { PluginClass: BotiumConnectorWebdriverIO } = require('botium-connector-webdriverio')
const debug = require('debug')('botium-connector-webdrivervoice')

const Capabilities = {
  WEBDRIVERVOICE_OPTIONS: 'WEBDRIVERVOICE_OPTIONS',
  WEBDRIVERVOICE_URL: 'WEBDRIVERVOICE_URL',
  WEBDRIVERVOICE_APP: 'WEBDRIVERVOICE_APP',
  WEBDRIVERVOICE_APPPACKAGE: 'WEBDRIVERVOICE_APPPACKAGE',
  WEBDRIVERVOICE_APPACTIVITY: 'WEBDRIVERVOICE_APPACTIVITY',
  WEBDRIVERVOICE_APPNORESET: 'WEBDRIVERVOICE_APPNORESET',
  WEBDRIVERVOICE_LANGUAGE: 'WEBDRIVERVOICE_LANGUAGE',
  WEBDRIVERVOICE_GENDER: 'WEBDRIVERVOICE_GENDER',
  WEBDRIVERVOICE_SKIP_WAITFORCLICKABLE: 'WEBDRIVERVOICE_SKIP_WAITFORCLICKABLE',
  WEBDRIVERVOICE_INPUT_NAVIGATION_BUTTONS: 'WEBDRIVERVOICE_INPUT_NAVIGATION_BUTTONS',
  WEBDRIVERVOICE_INPUT_STARTRECORD: 'WEBDRIVERVOICE_INPUT_STARTRECORD',
  WEBDRIVERVOICE_INPUT_STOPRECORD: 'WEBDRIVERVOICE_INPUT_STOPRECORD',
  WEBDRIVERVOICE_HAS_WELCOME: 'WEBDRIVERVOICE_HAS_WELCOME',
  WEBDRIVERVOICE_OUTPUT_PLAYTIMEOUT: 'WEBDRIVERVOICE_OUTPUT_PLAYTIMEOUT',
  WEBDRIVERVOICE_OUTPUT_PLAY: 'WEBDRIVERVOICE_OUTPUT_PLAY',
  WEBDRIVERVOICE_OUTPUT_PROFILE: 'WEBDRIVERVOICE_OUTPUT_PROFILE',
  WEBDRIVERVOICE_OUTPUT_TRANSCRIBE: 'WEBDRIVERVOICE_OUTPUT_TRANSCRIBE',
  WEBDRIVERVOICE_OUTPUT_LANGUAGE: 'WEBDRIVERVOICE_OUTPUT_LANGUAGE'
}

const Defaults = {
  [Capabilities.WEBDRIVERVOICE_APPNORESET]: false,
  [Capabilities.WEBDRIVERVOICE_LANGUAGE]: 'us-english',
  [Capabilities.WEBDRIVERVOICE_GENDER]: 'female',
  [Capabilities.WEBDRIVERVOICE_OUTPUT_PLAYTIMEOUT]: 10000,
  [Capabilities.WEBDRIVERVOICE_OUTPUT_PROFILE]: 'performance',
  [Capabilities.WEBDRIVERVOICE_OUTPUT_TRANSCRIBE]: true,
  [Capabilities.WEBDRIVERVOICE_SKIP_WAITFORCLICKABLE]: true
}

const recordAudioOutput = async (container, browser) => {
  const recordingUrl = await browser.executeScript('mobile:audio.recording:start', [{}])
  debug(`recordAudioOutput - starting recording to ${recordingUrl}`)

  if (container.caps[Capabilities.WEBDRIVERVOICE_OUTPUT_PLAY]) {
    await container.clickSeries(container.caps[Capabilities.WEBDRIVERVOICE_OUTPUT_PLAY])
  }
  await browser.pause(container.caps[Capabilities.WEBDRIVERVOICE_OUTPUT_PLAYTIMEOUT])
  await browser.executeScript('mobile:audio.recording:stop', [{}])
  debug(`recordAudioOutput - stopping recording to ${recordingUrl}`)

  const botMsg = {
    sender: 'bot',
    attachments: []
  }
  try {
    const screenshot = await container.delegateContainer._takeScreenshot('onbotsays')
    if (screenshot) {
      botMsg.attachments.push(screenshot)
    }
  } catch (err) {
    debug(`Failed to take screenshot, skipping: ${err.message}`)
  }
  try {
    debug(`recordAudioOutput - downloading recording from ${recordingUrl}`)
    const recordingUrlResponse = await axios({
      method: 'GET',
      url: recordingUrl,
      responseType: 'arraybuffer'
    })
    const buffer = Buffer.from(recordingUrlResponse.data)
    botMsg.attachments.push({
      name: 'output.wav',
      mimeType: 'audio/wav',
      base64: buffer.toString('base64')
    })
    botMsg.media = [{
      mediaUri: recordingUrl,
      mimeType: 'audio/wav'
    }]
  } catch (err) {
    debug(`Failed to download audio response from ${recordingUrl}: ${err.message}`)
    return container.queueBotSays(new Error(`Failed to download audio response: ${err.message}`))
  }

  if (container.caps[Capabilities.WEBDRIVERVOICE_OUTPUT_TRANSCRIBE]) {
    try {
      debug(`recordAudioOutput - transcribing recording from ${recordingUrl}`)
      const textResult = await browser.executeScript('mobile:audio:text', [{
        deviceAudio: recordingUrl,
        language: container.caps[Capabilities.WEBDRIVERVOICE_OUTPUT_LANGUAGE] || container.caps[Capabilities.WEBDRIVERVOICE_LANGUAGE],
        profile: container.caps[Capabilities.WEBDRIVERVOICE_OUTPUT_PROFILE]
      }])
      debug(`recordAudioOutput - transcribing recording from ${recordingUrl} ready: ${textResult}`)
      botMsg.messageText = (textResult && textResult.trim()) || ''
    } catch (err) {
      debug(`Failed to transcribe audio response from ${recordingUrl}: ${err.message}`)
      botMsg.attachments.push({
        name: 'transcribefailure.txt',
        mimeType: 'text/plain',
        base64: Buffer.from(`Failed to transcribe audio response from ${recordingUrl}: ${err.message}`).toString('base64')
      })
      botMsg.messageText = ''
    }
  }
  container.queueBotSays(botMsg)
}

class BotiumConnectorWebdriverVoice {
  constructor ({ container, queueBotSays, caps }) {
    this.container = container
    this.queueBotSays = queueBotSays
    this.caps = caps
  }

  async Validate () {
    debug('Validate called')
    this.caps = Object.assign({}, Defaults, this.caps)

    if (!this.caps[Capabilities.WEBDRIVERVOICE_OPTIONS]) throw new Error('WEBDRIVERVOICE_OPTIONS is required')
    if (_.isString(this.caps[Capabilities.WEBDRIVERVOICE_OPTIONS])) this.caps[Capabilities.WEBDRIVERVOICE_OPTIONS] = JSON.parse(this.caps[Capabilities.WEBDRIVERVOICE_OPTIONS])
    if (!this.caps[Capabilities.WEBDRIVERVOICE_OPTIONS].hostname) throw new Error('WEBDRIVERVOICE_OPTIONS.hostname is required')
    if (!this.caps[Capabilities.WEBDRIVERVOICE_OPTIONS].hostname.endsWith('.perfectomobile.com')) throw new Error('Only supported for Perfecto cloud')
    if (!this.caps[Capabilities.WEBDRIVERVOICE_OPTIONS].capabilities) throw new Error('WEBDRIVERVOICE_OPTIONS.capabilities is required')
    if (!this.caps[Capabilities.WEBDRIVERVOICE_OPTIONS].capabilities.securityToken) throw new Error('WEBDRIVERVOICE_OPTIONS.capabilities.securityToken is required')

    if (!this.delegateContainer) {
      this.delegateCaps = {
        WEBDRIVERIO_OPTIONS: this.caps[Capabilities.WEBDRIVERVOICE_OPTIONS],
        WEBDRIVERIO_URL: this.caps[Capabilities.WEBDRIVERVOICE_URL],
        WEBDRIVERIO_APP: this.caps[Capabilities.WEBDRIVERVOICE_APP],
        WEBDRIVERIO_APPPACKAGE: this.caps[Capabilities.WEBDRIVERVOICE_APPPACKAGE],
        WEBDRIVERIO_APPACTIVITY: this.caps[Capabilities.WEBDRIVERVOICE_APPACTIVITY],
        WEBDRIVERIO_APPNORESET: this.caps[Capabilities.WEBDRIVERVOICE_APPNORESET],
        WEBDRIVERIO_INPUT_NAVIGATION_BUTTONS: this.caps[Capabilities.WEBDRIVERVOICE_INPUT_NAVIGATION_BUTTONS],
        WEBDRIVERIO_SKIP_WAITFORCLICKABLE: this.caps[Capabilities.WEBDRIVERVOICE_SKIP_WAITFORCLICKABLE]
      }
      this.perfectoCloudName = this.caps[Capabilities.WEBDRIVERVOICE_OPTIONS].hostname.split('.')[0]
      this.perfectoSecurityToken = this.caps[Capabilities.WEBDRIVERVOICE_OPTIONS].capabilities.securityToken

      this.delegateCaps = Object.assign({}, this.caps, this.delegateCaps)
      this.delegateContainer = new BotiumConnectorWebdriverIO({ container: this.container, queueBotSays: this.queueBotSays, caps: this.delegateCaps })
      await this.delegateContainer.Validate()
    }
  }

  async Build () {
    await this.delegateContainer.Build()

    this.isAppium = (...args) => this.delegateContainer.isAppium(...args)
    this.clickSeries = (...args) => this.delegateContainer.clickSeries(...args)
    this.findElement = (...args) => this.delegateContainer.findElement(...args)
    this.findElements = (...args) => this.delegateContainer.findElements(...args)
    this._runInQueue = (...args) => this.delegateContainer._runInQueue(...args)
  }

  async Start () {
    await this.delegateContainer.Start()
    this.browser = this.delegateContainer.browser
    if (this.caps[Capabilities.WEBDRIVERVOICE_HAS_WELCOME]) {
      await this.delegateContainer._runInQueue(() => recordAudioOutput(this, this.delegateContainer.browser))
    }
  }

  async UserSays (msg) {
    const artifactKey = `PRIVATE:botium_input_${uuidV1()}.wav`
    if (msg.media && msg.media.length > 0) {
      const media = msg.media[0]
      if (!media.buffer) {
        throw new Error(`Media attachment ${media.mediaUri} not downloaded`)
      }
      if (!media.mimeType || !media.mimeType.startsWith('audio')) {
        throw new Error(`Media attachment ${media.mediaUri} mime type ${media.mimeType || '<empty>'} not supported (audio only)`)
      }

      const formData = new FormData()
      formData.append('requestPart', JSON.stringify({
        artifactLocator: artifactKey,
        artifactType: 'AUDIO',
        override: true
      }), { contentType: 'application/json' })
      formData.append('inputStream', media.buffer)

      try {
        debug(`UserSays - Uploading media file to perfecto cloud ${this.perfectoCloudName}, artifact: ${artifactKey}`)
        await axios.post(`https://${this.perfectoCloudName}.app.perfectomobile.com/repository/api/v1/artifacts`, formData, {
          headers: {
            'Perfecto-Authorization': this.perfectoSecurityToken,
            ...(formData.getHeaders())
          }
        })
      } catch (err) {
        debug(`UserSays - Uploading media file to perfecto cloud ${this.perfectoCloudName}, artifact: ${artifactKey} FAILED: ${err.message}`)
        throw new Error(`Uploading audio file failed: ${err.message}`)
      }
      msg.attachments = msg.attachments || []
      msg.attachments.push({
        name: media.mediaUri,
        mimeType: media.mimeType,
        base64: media.buffer.toString('base64')
      })
    } else if (msg.messageText) {
      try {
        debug(`UserSays - Generating audio from text to artifact: ${artifactKey}`)
        await this.delegateContainer._runInQueue(() => this.delegateContainer.browser.executeScript('mobile:text:audio', [{
          repositoryFile: artifactKey,
          text: msg.messageText,
          language: this.caps[Capabilities.WEBDRIVERVOICE_LANGUAGE],
          gender: this.caps[Capabilities.WEBDRIVERVOICE_GENDER]
        }]))
        debug(`UserSays - Downloading audio from text to artifact: ${artifactKey}`)
        const generatedAudioResponse = await axios({
          method: 'GET',
          url: `https://${this.perfectoCloudName}.app.perfectomobile.com/repository/api/v1/artifacts/artifact?artifactLocator=${artifactKey}`,
          headers: {
            'Perfecto-Authorization': this.perfectoSecurityToken
          },
          responseType: 'arraybuffer'
        })
        msg.attachments = msg.attachments || []
        msg.attachments.push({
          name: artifactKey,
          mimeType: 'audio/wav',
          base64: generatedAudioResponse.data.toString('base64')
        })
      } catch (err) {
        debug(`Failed to generate audio from text to artifact ${artifactKey}: ${err.message}`)
        throw new Error(`Failed to generate audio: ${err.message}`)
      }
    } else {
      throw new Error('No audio and no text input given')
    }

    if (this.caps[Capabilities.WEBDRIVERVOICE_INPUT_STARTRECORD]) await this.delegateContainer._runInQueue(() => this.clickSeries(this.caps[Capabilities.WEBDRIVERVOICE_INPUT_STARTRECORD]))
    await this.delegateContainer._runInQueue(() => {
      debug(`UserSays - Injecting audio artifact ${artifactKey} ...`)
      return this.delegateContainer.browser.executeScript('mobile:audio:inject', [{ key: artifactKey, wait: 'wait' }])
    })
    if (this.caps[Capabilities.WEBDRIVERVOICE_INPUT_STOPRECORD]) await this.delegateContainer._runInQueue(() => this.clickSeries(this.caps[Capabilities.WEBDRIVERVOICE_INPUT_STOPRECORD]))

    this.delegateContainer._runInQueue(() => recordAudioOutput(this, this.delegateContainer.browser))
      .catch(err => debug(`recordAudioOutput failed: ${err.message}`))

    debug(`UserSays - Deleting audio artifact ${artifactKey}`)
    axios({
      method: 'DELETE',
      url: `https://${this.perfectoCloudName}.app.perfectomobile.com/repository/api/v1/artifacts?artifactLocator=${artifactKey}`,
      headers: {
        'Perfecto-Authorization': this.perfectoSecurityToken
      }
    })
      .then(() => debug(`UserSays - Deleted audio artifact ${artifactKey}`))
      .catch(err => debug(`Failed to delete audio artifact ${artifactKey}: ${err.message}`))
  }

  async Stop () {
    await this.delegateContainer.Stop()
    this.browser = null
  }

  async Clean () {
    await this.delegateContainer.Clean()
  }
}

module.exports = BotiumConnectorWebdriverVoice
