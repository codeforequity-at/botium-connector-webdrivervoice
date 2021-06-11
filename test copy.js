const fs = require('fs')
const webdriverio = require('webdriverio')
const FormData = require('form-data')
const axios = require('axios')

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJhMzY3MTc2My05NmQwLTRmMzktYjcwZS0yNjFlNjlmZjM1NzYifQ.eyJqdGkiOiI4ZmY0ZmMyOC00YWY4LTQyYWMtOTkxNi00Y2Q2NzYxYTQxYjQiLCJleHAiOjAsIm5iZiI6MCwiaWF0IjoxNTg1MjM5MTc4LCJpc3MiOiJodHRwczovL2F1dGgucGVyZmVjdG9tb2JpbGUuY29tL2F1dGgvcmVhbG1zL3BhcnRuZXJzLXBlcmZlY3RvbW9iaWxlLWNvbSIsImF1ZCI6Imh0dHBzOi8vYXV0aC5wZXJmZWN0b21vYmlsZS5jb20vYXV0aC9yZWFsbXMvcGFydG5lcnMtcGVyZmVjdG9tb2JpbGUtY29tIiwic3ViIjoiMWFjYmI0YmItYTZhYy00NGQ0LTlmNGMtYjJhMWNlNzQ4ZWE3IiwidHlwIjoiT2ZmbGluZSIsImF6cCI6Im9mZmxpbmUtdG9rZW4tZ2VuZXJhdG9yIiwibm9uY2UiOiI0ZTlhOWNjZS00Yzk4LTQxZTgtYTlkNy00MGNmNDU2OTliODYiLCJhdXRoX3RpbWUiOjAsInNlc3Npb25fc3RhdGUiOiJhM2E4NzNiYS1hZDdjLTRkMGEtYjBjZS04Nzk2ODk1MzY3ZTQiLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoib3BlbmlkIG9mZmxpbmVfYWNjZXNzIn0.K7RhmIXIOyncs4KhBVd2_YcYxgkvvnQ5FJ3hGKeYI64'

const WEBDRIVERIO_OPTIONS = {	
  "capabilities": {
    //"model": "iPhone-8",
    "model": "Galaxy S10",
    //"browserName": "chrome",
    "securityToken": token
  },
  "protocol": "https",
  "hostname": "partners.perfectomobile.com",
  "port": 443,
  "path": "/nexperience/perfectomobile/wd/hub"
}

const main = async () => {
  const formData = new FormData()
  formData.append('requestPart', JSON.stringify({
    //artifactLocator: 'PRIVATE:book_stay_in_london.wav',
    //artifactLocator: 'PRIVATE:hallo.wav',
    artifactLocator: 'PRIVATE:output.wav',
    artifactType: 'AUDIO',
    override: true
  }), { contentType: 'application/json' })
  //formData.append('inputStream', fs.createReadStream('./book_stay_in_london.wav'))
  //formData.append('inputStream', fs.createReadStream('./hallo.wav'))
  formData.append('inputStream', fs.createReadStream('./output.wav'))

  await axios.post('https://partners.app.perfectomobile.com/repository/api/v1/artifacts',
    formData,
    {
      headers: {
        'Perfecto-Authorization': token,
        ...(formData.getHeaders())
      }
    }
  )
  const browser = await webdriverio.remote(WEBDRIVERIO_OPTIONS)
  try {
    await browser.url('https://microsoft.github.io/BotFramework-WebChat/01.getting-started/d.es5-direct-line-speech/')
    //await browser.url('https://microsoft.github.io/BotFramework-WebChat/03.speech/a.direct-line-speech/')
    //const title = await browser.getTitle()
    //console.log('Browser Title', title)
    //await browser.saveScreenshot('./screenshot-before-click.png')
    const micButton = await browser.$('.webchat__microphone-button__icon')
    await micButton.click()
    await browser.pause(7000)
    //await browser.saveScreenshot('./screenshot-after-click.png')

    //await browser.executeScript('mobile:audio:inject', [{ key: 'PRIVATE:book_stay_in_london.wav', wait: 'wait' }])
    //await browser.executeScript('mobile:audio:inject', [{ key: 'PRIVATE:hallo.wav', wait: 'wait' }])
    await browser.executeScript('mobile:audio:inject', [{ key: 'PRIVATE:output.wav', wait: 'wait' }])
    await browser.pause(10000)
    await browser.saveScreenshot('./screenshot-after-response.png')
  } catch (err) {
    console.log(err)
  } finally {
    if (browser) await browser.deleteSession()
  }
}

main()