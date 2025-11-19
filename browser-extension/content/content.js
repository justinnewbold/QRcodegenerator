// Content script for displaying QR codes in-page

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'SHOW_QR') {
    showQROverlay(request.data)
  }
})

function showQROverlay(data) {
  // Remove existing overlay if present
  removeQROverlay()

  // Create overlay
  const overlay = document.createElement('div')
  overlay.id = 'qr-generator-overlay'
  overlay.className = 'qr-generator-overlay'

  overlay.innerHTML = `
    <div class="qr-generator-modal">
      <div class="qr-generator-header">
        <h3>QR Code Generated</h3>
        <button class="qr-generator-close">&times;</button>
      </div>
      <div class="qr-generator-body">
        <img src="${data.qrCode}" alt="QR Code" class="qr-generator-image">
        ${data.shortUrl ? `
          <div class="qr-generator-info">
            <p><strong>Short URL:</strong></p>
            <input type="text" value="${data.shortUrl}" readonly class="qr-generator-url-input">
          </div>
        ` : ''}
        <div class="qr-generator-content">
          <p><strong>Content:</strong></p>
          <div class="qr-generator-content-text">${escapeHtml(data.content)}</div>
        </div>
      </div>
      <div class="qr-generator-actions">
        <button class="qr-generator-btn qr-generator-btn-primary" data-action="download">
          Download
        </button>
        <button class="qr-generator-btn qr-generator-btn-secondary" data-action="copy">
          Copy Image
        </button>
        ${data.shortUrl ? `
          <button class="qr-generator-btn qr-generator-btn-secondary" data-action="copyUrl">
            Copy URL
          </button>
        ` : ''}
      </div>
    </div>
  `

  document.body.appendChild(overlay)

  // Add event listeners
  overlay.querySelector('.qr-generator-close').addEventListener('click', removeQROverlay)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      removeQROverlay()
    }
  })

  // Action buttons
  overlay.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const action = e.target.dataset.action

      if (action === 'download') {
        const link = document.createElement('a')
        link.href = data.qrCode
        link.download = `qr-code-${Date.now()}.png`
        link.click()
      } else if (action === 'copy') {
        try {
          const blob = await fetch(data.qrCode).then(r => r.blob())
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ])
          showToast('QR code copied to clipboard!')
        } catch (error) {
          showToast('Failed to copy QR code', 'error')
        }
      } else if (action === 'copyUrl') {
        try {
          await navigator.clipboard.writeText(data.shortUrl)
          showToast('Short URL copied to clipboard!')
        } catch (error) {
          showToast('Failed to copy URL', 'error')
        }
      }
    })
  })
}

function removeQROverlay() {
  const overlay = document.getElementById('qr-generator-overlay')
  if (overlay) {
    overlay.remove()
  }
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div')
  toast.className = `qr-generator-toast qr-generator-toast-${type}`
  toast.textContent = message
  document.body.appendChild(toast)

  setTimeout(() => {
    toast.classList.add('show')
  }, 10)

  setTimeout(() => {
    toast.classList.remove('show')
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}
