# QR Code Generator API Documentation

This document describes the API endpoints available for programmatic QR code generation.

## Base URL

When running locally: `http://localhost:3000/api`

## Endpoints

### 1. Generate Single QR Code

Generate a single QR code with custom options.

#### POST `/api/generate`

**Request Body:**

```json
{
  "content": "https://example.com",
  "options": {
    "size": 300,
    "errorLevel": "M",
    "fgColor": "#000000",
    "bgColor": "#ffffff",
    "margin": 4
  }
}
```

**Response:**

```json
{
  "success": true,
  "qrCode": "data:image/png;base64,...",
  "timestamp": "2025-11-19T04:50:00.000Z"
}
```

**Error Response:**

```json
{
  "error": "Content is required"
}
```

#### GET `/api/generate`

Simple URL-based QR generation.

**Query Parameters:**
- `content` (required): The content to encode
- `size` (optional): QR code size in pixels (default: 300)
- `errorLevel` (optional): Error correction level: L, M, Q, H (default: M)

**Example:**
```
GET /api/generate?content=https://example.com&size=400&errorLevel=H
```

---

### 2. Generate Batch QR Codes

Generate multiple QR codes in a single request.

#### POST `/api/batch`

**Request Body:**

```json
{
  "items": [
    {
      "content": "https://example1.com",
      "options": {
        "size": 300,
        "errorLevel": "M"
      },
      "metadata": {
        "name": "Website Link"
      }
    },
    {
      "content": "WIFI:S:MyNetwork;T:WPA;P:password123;;",
      "options": {
        "size": 400
      },
      "metadata": {
        "name": "WiFi QR"
      }
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "total": 2,
  "successful": 2,
  "failed": 0,
  "results": [
    {
      "content": "https://example1.com",
      "qrCode": "data:image/png;base64,...",
      "metadata": {
        "name": "Website Link"
      },
      "success": true
    },
    ...
  ]
}
```

**Limits:**
- Maximum 100 items per batch request

---

## Error Correction Levels

| Level | Error Correction | Best Use Case |
|-------|------------------|---------------|
| L     | ~7% correction   | Clean environments |
| M     | ~15% correction  | General use (default) |
| Q     | ~25% correction  | Moderate damage tolerance |
| H     | ~30% correction  | QR codes with logos/images |

---

## QR Code Options

All generation endpoints accept these optional parameters:

```typescript
{
  size?: number              // Size in pixels (100-2000)
  errorLevel?: 'L'|'M'|'Q'|'H'  // Error correction level
  fgColor?: string           // Foreground color (hex)
  bgColor?: string           // Background color (hex)
  margin?: number            // Margin size (0-10)
  style?: 'squares'|'dots'   // QR code style
  logoUrl?: string           // Center logo image URL
  transparentBg?: boolean    // Transparent background
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. For production use, consider implementing rate limiting on your API routes.

---

## Examples

### JavaScript/TypeScript

```typescript
// Generate single QR code
const response = await fetch('/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: 'https://example.com',
    options: { size: 400, errorLevel: 'H' }
  })
})

const data = await response.json()
console.log(data.qrCode) // Base64 data URL
```

### cURL

```bash
# Generate QR code
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"content":"https://example.com","options":{"size":300}}'

# Simple GET request
curl "http://localhost:3000/api/generate?content=Hello%20World&size=400"
```

### Python

```python
import requests

# Generate QR code
response = requests.post('http://localhost:3000/api/generate', json={
    'content': 'https://example.com',
    'options': {
        'size': 400,
        'errorLevel': 'H'
    }
})

data = response.json()
qr_code = data['qrCode']  # Base64 data URL
```

---

## Integration Examples

### Zapier Webhook

Use the POST endpoint with Zapier webhooks to generate QR codes automatically from other apps.

### WordPress

Create a WordPress plugin that calls the API to generate QR codes for posts/pages.

### Mobile Apps

Call the API from React Native, Flutter, or native iOS/Android apps.

---

## Need Help?

For issues or questions, please open an issue on the GitHub repository.
