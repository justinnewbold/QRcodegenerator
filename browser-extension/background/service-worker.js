// Background service worker for browser extension

const API_URL = 'https://your-domain.com/api/v1/qr'

// Create context menu
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'generateQR',
    title: 'Generate QR Code',
    contexts: ['page', 'link', 'selection']
  })

  chrome.contextMenus.create({
    id: 'generateQRLink',
    title: 'Generate QR for This Link',
    contexts: ['link']
  })

  chrome.contextMenus.create({
    id: 'generateQRSelection',
    title: 'Generate QR from Selection',
    contexts: ['selection']
  })
})

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  let content = ''

  switch (info.menuItemId) {
    case 'generateQR':
      content = tab.url
      break
    case 'generateQRLink':
      content = info.linkUrl
      break
    case 'generateQRSelection':
      content = info.selectionText
      break
  }

  if (content) {
    await generateQRCode(content, tab.id)
  }
})

// Handle keyboard commands
chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

  if (command === 'generate_current_url' && tab) {
    await generateQRCode(tab.url, tab.id)
  }
})

// Generate QR code
async function generateQRCode(content, tabId) {
  try {
    const settings = await chrome.storage.sync.get({
      apiKey: '',
      size: 300,
      foregroundColor: '#000000',
      backgroundColor: '#ffffff',
      errorCorrectionLevel: 'M',
      dynamic: false
    })

    if (!settings.apiKey) {
      showNotification('API key not configured', 'Please set your API key in extension settings')
      return
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': settings.apiKey
      },
      body: JSON.stringify({
        content,
        dynamic: settings.dynamic,
        customization: {
          size: settings.size,
          foregroundColor: settings.foregroundColor,
          backgroundColor: settings.backgroundColor,
          errorCorrectionLevel: settings.errorCorrectionLevel
        }
      })
    })

    if (!response.ok) {
      throw new Error('Failed to generate QR code')
    }

    const data = await response.json()

    // Send QR code to content script to display
    chrome.tabs.sendMessage(tabId, {
      type: 'SHOW_QR',
      data: {
        qrCode: data.qrCode,
        shortUrl: data.shortUrl,
        content
      }
    })
  } catch (error) {
    console.error('QR generation error:', error)
    showNotification('Error', 'Failed to generate QR code')
  }
}

// Show notification
function showNotification(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: '../icons/icon128.png',
    title,
    message
  })
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GENERATE_QR') {
    generateQRCode(request.content, request.tabId)
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }))
    return true // Will respond asynchronously
  }
})
