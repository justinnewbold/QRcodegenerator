# QR Code Generator Browser Extension

Generate QR codes instantly from any webpage with this powerful browser extension.

## Features

- ✨ **Right-Click Generation**: Generate QR codes from any link, selected text, or current page
- ⌨️ **Keyboard Shortcuts**: Quick access with Ctrl+Shift+Q (Cmd+Shift+Q on Mac)
- 📊 **Dynamic QR Codes**: Create trackable QR codes with analytics
- 🎨 **Customization**: Adjust size, error correction, and colors
- 💾 **History**: Automatically saves your recent QR codes
- 📥 **Easy Export**: Download or copy QR codes instantly
- 🔐 **Secure**: API key-based authentication

## Installation

### Chrome/Edge
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `browser-extension` directory

### Firefox
1. Open `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select `manifest.json` from the `browser-extension` directory

## Setup

1. **Get API Key**
   - Visit https://your-domain.com/dashboard
   - Navigate to Settings > API Keys
   - Create a new API key with `qr:create` permission

2. **Configure Extension**
   - Click the extension icon
   - Click "Settings"
   - Enter your API key
   - Adjust default settings (optional)

## Usage

### Generate from Current Page
1. Click the extension icon
2. The current URL will be pre-filled
3. Click "Generate QR Code"

### Generate from Link
1. Right-click any link
2. Select "Generate QR for This Link"
3. QR code appears in overlay

### Generate from Selected Text
1. Select any text on a page
2. Right-click the selection
3. Select "Generate QR from Selection"

### Keyboard Shortcuts
- `Ctrl+Shift+Q` (or `Cmd+Shift+Q`): Open extension popup
- `Ctrl+Shift+G` (or `Cmd+Shift+G`): Generate QR for current URL

## Settings

### Default Customization
- **Size**: 200x200 to 1000x1000 pixels
- **Error Correction**: Low (L), Medium (M), Quartile (Q), High (H)
- **Dynamic QR**: Enable tracking and analytics

### API Configuration
- **API Key**: Your authentication key
- **API Endpoint**: Custom endpoint (for self-hosted instances)

## Features Explained

### Dynamic QR Codes
When enabled, creates a shortened URL that:
- Tracks every scan (location, device, time)
- Can be updated after creation (content changes without reprinting)
- Provides detailed analytics dashboard
- Supports password protection and expiration

### Context Menu Options
- **Generate QR Code**: For current page URL
- **Generate QR for This Link**: For clicked link
- **Generate QR from Selection**: For highlighted text

## Privacy

- All QR generation is done via secure API calls
- No browsing history is collected
- QR codes are stored locally (last 50)
- API key is stored securely in browser sync storage

## Troubleshooting

### "API key not configured"
- Open extension settings
- Enter a valid API key from your dashboard

### "Failed to generate QR code"
- Check your internet connection
- Verify API key is valid
- Check API key permissions include `qr:create`

### Extension not appearing
- Ensure extension is enabled in browser settings
- Try reloading the extension
- Check browser console for errors

## Development

### Build from Source
```bash
cd browser-extension
# No build step required - pure JavaScript
```

### Testing Locally
1. Load extension in developer mode
2. Open browser console
3. Check for any errors
4. Test all features

### File Structure
```
browser-extension/
├── manifest.json          # Extension configuration
├── background/
│   └── service-worker.js  # Background tasks
├── popup/
│   ├── popup.html         # Extension popup UI
│   ├── popup.css          # Popup styles
│   └── popup.js           # Popup logic
├── content/
│   ├── content.js         # Injected page scripts
│   └── content.css        # Injected styles
└── icons/                 # Extension icons
```

## Permissions Explained

- **contextMenus**: Add right-click menu items
- **storage**: Save API key and history
- **activeTab**: Access current page URL
- **tabs**: Read tab information
- **host_permissions**: Make API calls to backend

## Keyboard Shortcuts

### Default Shortcuts
- `Ctrl+Shift+Q` / `Cmd+Shift+Q`: Open extension
- `Ctrl+Shift+G` / `Cmd+Shift+G`: Quick generate

### Customize Shortcuts
**Chrome**: `chrome://extensions/shortcuts`
**Firefox**: Not customizable (use defaults)

## Updates

The extension checks for updates automatically. To manually update:
1. Go to `chrome://extensions/`
2. Click "Update" button
3. Reload extension

## Support

- **Documentation**: https://your-domain.com/docs/extension
- **Issues**: https://github.com/your-repo/issues
- **Email**: support@your-domain.com

## Changelog

### Version 1.0.0
- Initial release
- Right-click QR generation
- Keyboard shortcuts
- Dynamic QR support
- History tracking
- Customization options

## License

See main project LICENSE file

## Credits

Built with ❤️ for the QR Code Generator platform
