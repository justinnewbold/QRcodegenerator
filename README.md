# QR Code Generator - Modern & Free

A beautiful, feature-rich QR code generator built with Next.js 14, React, and TypeScript. Generate QR codes for URLs, WiFi, vCards, emails, SMS, phone numbers, and plain text - all completely free and privacy-focused.

## Features

### QR Code Generation
- **Multiple Types**: URL, Plain Text, WiFi, vCard (Contact), Email, SMS, Phone
- **Customizable Appearance**:
  - Custom foreground and background colors
  - Adjustable size (200px - 1000px)
  - Configurable margin
  - Logo/image embedding support
- **Error Correction Levels**: Low (7%), Medium (15%), Quartile (25%), High (30%)
- **Export Formats**: PNG and SVG

### QR Code Scanner
- Upload image files to scan
- Use device camera for real-time scanning
- Works entirely in your browser (no server uploads)
- Automatic link detection and opening

### User Experience
- Dark/Light mode support
- Fully responsive design
- Modern, clean UI with shadcn/ui components
- Real-time preview
- No registration required
- No tracking or analytics
- 100% client-side processing

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components based on shadcn/ui
- **QR Generation**: qrcode library
- **QR Scanning**: jsQR library
- **Theme**: next-themes
- **Icons**: lucide-react

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/justinnewbold/IDK_MYBFFJILL.git
cd IDK_MYBFFJILL
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Deployment

This application is optimized for Vercel deployment:

1. Push your code to GitHub
2. Import the project in Vercel
3. Deploy with one click

The application is configured to work seamlessly with Vercel's infrastructure.

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with theme provider
│   ├── page.tsx            # Home page (QR generator)
│   ├── scan/
│   │   └── page.tsx        # QR scanner page
│   └── globals.css         # Global styles and theme variables
├── components/
│   ├── qr-code-generator.tsx  # Main QR generator component
│   ├── qr-scanner.tsx         # QR scanner component
│   ├── theme-provider.tsx     # Theme context provider
│   ├── theme-toggle.tsx       # Dark/light mode toggle
│   └── ui/                    # Reusable UI components
├── lib/
│   ├── qr-generator.ts     # QR generation utilities
│   └── utils.ts            # Helper functions
└── public/                 # Static assets
```

## Privacy & Security

- **No Server Uploads**: All QR code generation and scanning happens in your browser
- **No Tracking**: No analytics, cookies, or tracking scripts
- **No Registration**: Use all features without creating an account
- **Open Source**: Transparent codebase you can audit

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is free to use for personal and commercial purposes.

## Author

**Justin Newbold**
- Website: [newbold.cloud](https://newbold.cloud)

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components inspired by [shadcn/ui](https://ui.shadcn.com/)
- QR generation powered by [node-qrcode](https://github.com/soldair/node-qrcode)
- QR scanning powered by [jsQR](https://github.com/cozmo/jsQR)
