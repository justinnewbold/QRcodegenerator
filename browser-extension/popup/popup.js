// Popup script for QR Code Generator extension

document.addEventListener('DOMContentLoaded', async () => {
  const contentInput = document.getElementById('content')
  const sizeSelect = document.getElementById('size')
  const errorLevelSelect = document.getElementById('errorLevel')
  const dynamicCheckbox = document.getElementById('dynamic')
  const generateBtn = document.getElementById('generate')
  const useCurrentUrlBtn = document.getElementById('useCurrentUrl')
  const useSelectionBtn = document.getElementById('useSelection')
  const resultDiv = document.getElementById('result')
  const qrImage = document.getElementById('qrImage')
  const downloadBtn = document.getElementById('download')
  const copyBtn = document.getElementById('copy')
  const viewAnalyticsBtn = document.getElementById('viewAnalytics')
  const errorDiv = document.getElementById('error')

  let currentQRData = null

  // Load settings
  const settings = await chrome.storage.sync.get({
    apiKey: '',
    size: '300',
    errorLevel: 'M',
    dynamic: false
  })

  sizeSelect.value = settings.size
  errorLevelSelect.value = settings.errorLevel
  dynamicCheckbox.checked = settings.dynamic

  // Get current tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

  // Use current URL button
  useCurrentUrlBtn.addEventListener('click', () => {
    contentInput.value = tab.url
  })

  // Use selection button
  useSelectionBtn.addEventListener('click', async () => {
    try {
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => window.getSelection().toString()
      })

      if (result.result) {
        contentInput.value = result.result
      }
    } catch (error) {
      showError('Failed to get selected text')
    }
  })

  // Generate QR code
  generateBtn.addEventListener('click', async () => {
    const content = contentInput.value.trim()

    if (!content) {
      showError('Please enter content')
      return
    }

    if (!settings.apiKey) {
      showError('API key not configured. Please visit Settings.')
      return
    }

    hideError()
    generateBtn.disabled = true
    generateBtn.textContent = 'Generating...'

    try {
      const response = await fetch('https://your-domain.com/api/v1/qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': settings.apiKey
        },
        body: JSON.stringify({
          content,
          dynamic: dynamicCheckbox.checked,
          customization: {
            size: parseInt(sizeSelect.value),
            errorCorrectionLevel: errorLevelSelect.value
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate QR code')
      }

      const data = await response.json()

      currentQRData = data
      qrImage.src = data.qrCode
      resultDiv.classList.remove('hidden')

      if (data.shortUrl) {
        viewAnalyticsBtn.classList.remove('hidden')
      }

      // Save to history
      await saveToHistory(content, data.qrCode)
    } catch (error) {
      showError(error.message)
    } finally {
      generateBtn.disabled = false
      generateBtn.textContent = 'Generate QR Code'
    }
  })

  // Download QR code
  downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a')
    link.href = qrImage.src
    link.download = `qr-code-${Date.now()}.png`
    link.click()
  })

  // Copy QR code
  copyBtn.addEventListener('click', async () => {
    try {
      const blob = await fetch(qrImage.src).then(r => r.blob())
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
      copyBtn.textContent = 'Copied!'
      setTimeout(() => {
        copyBtn.textContent = 'Copy'
      }, 2000)
    } catch (error) {
      showError('Failed to copy QR code')
    }
  })

  // View analytics
  viewAnalyticsBtn.addEventListener('click', () => {
    if (currentQRData?.shortUrl) {
      chrome.tabs.create({
        url: `https://your-domain.com/analytics?shortUrl=${encodeURIComponent(currentQRData.shortUrl)}`
      })
    }
  })

  // Settings link
  document.getElementById('settings').addEventListener('click', (e) => {
    e.preventDefault()
    chrome.runtime.openOptionsPage()
  })

  function showError(message) {
    errorDiv.textContent = message
    errorDiv.classList.remove('hidden')
  }

  function hideError() {
    errorDiv.classList.add('hidden')
  }

  async function saveToHistory(content, qrCode) {
    const history = await chrome.storage.local.get({ history: [] })
    history.history.unshift({
      content,
      qrCode,
      timestamp: Date.now()
    })

    // Keep only last 50 items
    if (history.history.length > 50) {
      history.history = history.history.slice(0, 50)
    }

    await chrome.storage.local.set({ history: history.history })
  }
})
