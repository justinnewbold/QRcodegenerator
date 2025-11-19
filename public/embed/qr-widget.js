// Embeddable QR Code Generator Widget
// Usage: <script src="https://your-domain.com/embed/qr-widget.js"></script>
//        <div class="qr-generator-embed" data-api-key="your-api-key"></div>

(function() {
  'use strict'

  const API_URL = 'https://your-domain.com/api/v1/qr'

  class QRGeneratorWidget {
    constructor(container, apiKey) {
      this.container = container
      this.apiKey = apiKey
      this.render()
      this.attachEvents()
    }

    render() {
      this.container.innerHTML = `
        <div class="qr-widget">
          <style>
            .qr-widget {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              max-width: 500px;
              padding: 20px;
              border: 1px solid #e0e0e0;
              border-radius: 8px;
              background: #fff;
            }
            .qr-widget-title {
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 15px;
              color: #333;
            }
            .qr-widget-input {
              width: 100%;
              padding: 10px;
              border: 1px solid #ddd;
              border-radius: 6px;
              font-size: 14px;
              margin-bottom: 10px;
            }
            .qr-widget-btn {
              width: 100%;
              padding: 12px;
              background: #4CAF50;
              color: white;
              border: none;
              border-radius: 6px;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
              transition: background 0.2s;
            }
            .qr-widget-btn:hover {
              background: #45a049;
            }
            .qr-widget-btn:disabled {
              background: #ccc;
              cursor: not-allowed;
            }
            .qr-widget-result {
              margin-top: 20px;
              text-align: center;
              display: none;
            }
            .qr-widget-result.show {
              display: block;
            }
            .qr-widget-result img {
              max-width: 100%;
              height: auto;
              border-radius: 8px;
              margin-bottom: 10px;
            }
            .qr-widget-download {
              display: inline-block;
              padding: 8px 16px;
              background: #fff;
              border: 1px solid #ddd;
              border-radius: 4px;
              color: #333;
              text-decoration: none;
              font-size: 14px;
              cursor: pointer;
            }
            .qr-widget-download:hover {
              background: #f5f5f5;
            }
            .qr-widget-error {
              padding: 10px;
              background: #ffebee;
              color: #c62828;
              border-radius: 6px;
              font-size: 14px;
              margin-top: 10px;
              display: none;
            }
            .qr-widget-error.show {
              display: block;
            }
          </style>
          <div class="qr-widget-title">Generate QR Code</div>
          <input
            type="text"
            class="qr-widget-input"
            placeholder="Enter URL or text"
            id="qr-content"
          >
          <button class="qr-widget-btn" id="qr-generate">
            Generate QR Code
          </button>
          <div class="qr-widget-error" id="qr-error"></div>
          <div class="qr-widget-result" id="qr-result">
            <img id="qr-image" alt="QR Code">
            <br>
            <a href="#" class="qr-widget-download" id="qr-download" download="qr-code.png">
              Download QR Code
            </a>
          </div>
        </div>
      `
    }

    attachEvents() {
      const contentInput = this.container.querySelector('#qr-content')
      const generateBtn = this.container.querySelector('#qr-generate')
      const resultDiv = this.container.querySelector('#qr-result')
      const qrImage = this.container.querySelector('#qr-image')
      const downloadBtn = this.container.querySelector('#qr-download')
      const errorDiv = this.container.querySelector('#qr-error')

      generateBtn.addEventListener('click', async () => {
        const content = contentInput.value.trim()

        if (!content) {
          this.showError('Please enter content')
          return
        }

        this.hideError()
        generateBtn.disabled = true
        generateBtn.textContent = 'Generating...'

        try {
          const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': this.apiKey
            },
            body: JSON.stringify({
              content,
              customization: {
                size: 300,
                errorCorrectionLevel: 'M'
              }
            })
          })

          if (!response.ok) {
            throw new Error('Failed to generate QR code')
          }

          const data = await response.json()

          qrImage.src = data.qrCode
          downloadBtn.href = data.qrCode
          resultDiv.classList.add('show')
        } catch (error) {
          this.showError(error.message || 'Failed to generate QR code')
        } finally {
          generateBtn.disabled = false
          generateBtn.textContent = 'Generate QR Code'
        }
      })
    }

    showError(message) {
      const errorDiv = this.container.querySelector('#qr-error')
      errorDiv.textContent = message
      errorDiv.classList.add('show')
    }

    hideError() {
      const errorDiv = this.container.querySelector('#qr-error')
      errorDiv.classList.remove('show')
    }
  }

  // Auto-initialize all widgets on page load
  function initWidgets() {
    const widgets = document.querySelectorAll('.qr-generator-embed')

    widgets.forEach(widget => {
      const apiKey = widget.getAttribute('data-api-key')

      if (apiKey) {
        new QRGeneratorWidget(widget, apiKey)
      } else {
        console.error('QR Generator Widget: API key is required')
      }
    })
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidgets)
  } else {
    initWidgets()
  }

  // Expose for manual initialization
  window.QRGeneratorWidget = QRGeneratorWidget
})()
