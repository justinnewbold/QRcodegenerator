'use client';

import { useState, useMemo } from 'react';
import {
  SOCIAL_MEDIA_SIZES,
  BUSINESS_CARD_TEMPLATES,
  getSizesByPlatform,
  getAllPlatforms,
  generateEmailSignatureHTML,
  calculateQRPosition,
  SocialMediaSize,
  BusinessCardLayout,
  EmailSignatureConfig,
} from '@/lib/social-export';
import {
  Share2,
  X,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Printer,
  Mail,
  CreditCard,
  Copy,
  Check,
  Download,
  ChevronRight,
} from 'lucide-react';

interface SocialExportProps {
  isOpen: boolean;
  onClose: () => void;
  qrDataUrl?: string;
  qrSvg?: string;
  onExport?: (width: number, height: number, format: string) => void;
}

export function SocialExport({
  isOpen,
  onClose,
  qrDataUrl,
  qrSvg,
  onExport,
}: SocialExportProps) {
  const [activeTab, setActiveTab] = useState<'social' | 'email' | 'business'>('social');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('Instagram');
  const [selectedSize, setSelectedSize] = useState<SocialMediaSize | null>(null);
  const [copied, setCopied] = useState(false);

  // Email signature config
  const [emailConfig, setEmailConfig] = useState<EmailSignatureConfig>({
    qrSize: 100,
    alignment: 'left',
    includeText: true,
    text: 'Scan to connect',
    textPosition: 'below',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    padding: 8,
  });

  // Business card config
  const [selectedCardTemplate, setSelectedCardTemplate] = useState<BusinessCardLayout | null>(
    BUSINESS_CARD_TEMPLATES[0]
  );
  const [cardFields, setCardFields] = useState<Record<string, string>>({
    name: '',
    title: '',
    company: '',
    email: '',
    phone: '',
    website: '',
  });

  // Get platforms
  const platforms = useMemo(() => getAllPlatforms(), []);

  // Get sizes for selected platform
  const platformSizes = useMemo(
    () => getSizesByPlatform(selectedPlatform),
    [selectedPlatform]
  );

  // Platform icons
  const platformIcons: Record<string, typeof Instagram> = {
    Instagram: Instagram,
    Facebook: Facebook,
    Twitter: Twitter,
    LinkedIn: Linkedin,
    YouTube: Youtube,
    Pinterest: Share2,
    TikTok: Share2,
    Print: Printer,
  };

  // Handle export
  const handleExport = (size: SocialMediaSize) => {
    if (onExport) {
      onExport(size.width, size.height, 'png');
    }
  };

  // Generate and copy email signature
  const handleCopyEmailSignature = () => {
    if (!qrDataUrl) return;

    const html = generateEmailSignatureHTML(qrDataUrl, emailConfig);
    navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-500/10">
              <Share2 className="h-5 w-5 text-pink-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Social Media Export</h2>
              <p className="text-sm text-muted-foreground">
                Optimized exports for every platform
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('social')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'social'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <Share2 className="h-4 w-4" />
              Social Media
            </span>
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'email'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <Mail className="h-4 w-4" />
              Email Signature
            </span>
          </button>
          <button
            onClick={() => setActiveTab('business')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'business'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <CreditCard className="h-4 w-4" />
              Business Card
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'social' && (
            <div className="space-y-4">
              {/* Platform selector */}
              <div className="flex flex-wrap gap-2">
                {platforms.map((platform) => {
                  const Icon = platformIcons[platform] || Share2;
                  return (
                    <button
                      key={platform}
                      onClick={() => setSelectedPlatform(platform)}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                        selectedPlatform === platform
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {platform}
                    </button>
                  );
                })}
              </div>

              {/* Size cards */}
              <div className="grid gap-3 sm:grid-cols-2">
                {platformSizes.map((size) => {
                  const aspectRatio = size.width / size.height;
                  const previewHeight = 100;
                  const previewWidth = previewHeight * aspectRatio;

                  return (
                    <div
                      key={size.id}
                      className="group flex items-center gap-4 rounded-lg border border-border p-4 hover:border-primary"
                    >
                      {/* Preview */}
                      <div
                        className="shrink-0 rounded border border-border bg-muted"
                        style={{
                          width: Math.min(previewWidth, 120),
                          height: Math.min(previewHeight, 100),
                        }}
                      >
                        <div className="flex h-full items-center justify-center">
                          <div
                            className="bg-primary/20 rounded"
                            style={{
                              width: (size.qrSize / size.width) * Math.min(previewWidth, 120),
                              height: (size.qrSize / size.height) * Math.min(previewHeight, 100),
                            }}
                          />
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium">{size.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {size.width} x {size.height}px
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {size.description}
                        </p>
                      </div>

                      {/* Export button */}
                      <button
                        onClick={() => handleExport(size)}
                        className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-sm text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-primary/90"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-6">
              {/* Preview */}
              <div className="rounded-lg border border-border p-6">
                <h4 className="mb-4 text-sm font-medium text-muted-foreground">Preview</h4>
                <div
                  style={{ textAlign: emailConfig.alignment }}
                  className="border-t border-border pt-4"
                >
                  {emailConfig.includeText && emailConfig.textPosition === 'above' && (
                    <p className="mb-2 text-sm text-muted-foreground">{emailConfig.text}</p>
                  )}
                  <div
                    className="inline-block"
                    style={{
                      width: emailConfig.qrSize,
                      height: emailConfig.qrSize,
                      borderRadius: emailConfig.borderRadius,
                      backgroundColor: emailConfig.backgroundColor,
                      padding: emailConfig.padding,
                    }}
                  >
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt="QR Code"
                        className="w-full h-full"
                        style={{ borderRadius: Math.max(0, emailConfig.borderRadius - emailConfig.padding) }}
                      />
                    ) : (
                      <div className="w-full h-full bg-muted rounded" />
                    )}
                  </div>
                  {emailConfig.includeText && emailConfig.textPosition === 'below' && (
                    <p className="mt-2 text-sm text-muted-foreground">{emailConfig.text}</p>
                  )}
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">QR Code Size</label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="range"
                      min="50"
                      max="200"
                      value={emailConfig.qrSize}
                      onChange={(e) =>
                        setEmailConfig({ ...emailConfig, qrSize: parseInt(e.target.value) })
                      }
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground w-12">{emailConfig.qrSize}px</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Alignment</label>
                  <div className="mt-1 flex gap-2">
                    {(['left', 'center', 'right'] as const).map((align) => (
                      <button
                        key={align}
                        onClick={() => setEmailConfig({ ...emailConfig, alignment: align })}
                        className={`flex-1 rounded-lg px-3 py-2 text-sm capitalize ${
                          emailConfig.alignment === align
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        {align}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Include Text</label>
                  <input
                    type="checkbox"
                    checked={emailConfig.includeText}
                    onChange={(e) =>
                      setEmailConfig({ ...emailConfig, includeText: e.target.checked })
                    }
                    className="h-4 w-4 rounded"
                  />
                </div>

                {emailConfig.includeText && (
                  <>
                    <div>
                      <label className="text-sm font-medium">Text</label>
                      <input
                        type="text"
                        value={emailConfig.text}
                        onChange={(e) => setEmailConfig({ ...emailConfig, text: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Text Position</label>
                      <div className="mt-1 flex gap-2">
                        {(['above', 'below'] as const).map((pos) => (
                          <button
                            key={pos}
                            onClick={() => setEmailConfig({ ...emailConfig, textPosition: pos })}
                            className={`flex-1 rounded-lg px-3 py-2 text-sm capitalize ${
                              emailConfig.textPosition === pos
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted hover:bg-muted/80'
                            }`}
                          >
                            {pos}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="text-sm font-medium">Border Radius</label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={emailConfig.borderRadius}
                      onChange={(e) =>
                        setEmailConfig({ ...emailConfig, borderRadius: parseInt(e.target.value) })
                      }
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground w-12">{emailConfig.borderRadius}px</span>
                  </div>
                </div>
              </div>

              {/* Copy button */}
              <button
                onClick={handleCopyEmailSignature}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy HTML for Email Signature
                  </>
                )}
              </button>
            </div>
          )}

          {activeTab === 'business' && (
            <div className="space-y-6">
              {/* Template selector */}
              <div>
                <h4 className="mb-3 text-sm font-medium">Choose Template</h4>
                <div className="grid grid-cols-2 gap-3">
                  {BUSINESS_CARD_TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedCardTemplate(template)}
                      className={`rounded-lg border p-4 text-left ${
                        selectedCardTemplate?.id === template.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div
                        className="mb-2 rounded border"
                        style={{
                          backgroundColor: template.style.backgroundColor,
                          aspectRatio: `${template.width} / ${template.height}`,
                          maxHeight: 60,
                        }}
                      />
                      <span className="text-sm font-medium">{template.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {template.width} x {template.height}mm
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Card fields */}
              {selectedCardTemplate && (
                <div>
                  <h4 className="mb-3 text-sm font-medium">Your Information</h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs text-muted-foreground">Name</label>
                      <input
                        type="text"
                        value={cardFields.name}
                        onChange={(e) => setCardFields({ ...cardFields, name: e.target.value })}
                        placeholder="John Doe"
                        className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Title</label>
                      <input
                        type="text"
                        value={cardFields.title}
                        onChange={(e) => setCardFields({ ...cardFields, title: e.target.value })}
                        placeholder="Software Engineer"
                        className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Company</label>
                      <input
                        type="text"
                        value={cardFields.company}
                        onChange={(e) => setCardFields({ ...cardFields, company: e.target.value })}
                        placeholder="Acme Inc."
                        className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Email</label>
                      <input
                        type="email"
                        value={cardFields.email}
                        onChange={(e) => setCardFields({ ...cardFields, email: e.target.value })}
                        placeholder="john@example.com"
                        className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Phone</label>
                      <input
                        type="tel"
                        value={cardFields.phone}
                        onChange={(e) => setCardFields({ ...cardFields, phone: e.target.value })}
                        placeholder="+1 234 567 8900"
                        className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Website</label>
                      <input
                        type="url"
                        value={cardFields.website}
                        onChange={(e) => setCardFields({ ...cardFields, website: e.target.value })}
                        placeholder="www.example.com"
                        className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Preview placeholder */}
              {selectedCardTemplate && (
                <div className="rounded-lg border border-border p-4">
                  <h4 className="mb-3 text-sm font-medium text-muted-foreground">Preview</h4>
                  <div
                    className="mx-auto rounded-lg border shadow-lg"
                    style={{
                      backgroundColor: selectedCardTemplate.style.backgroundColor,
                      aspectRatio: `${selectedCardTemplate.width} / ${selectedCardTemplate.height}`,
                      maxWidth: selectedCardTemplate.orientation === 'landscape' ? 400 : 250,
                      padding: 16,
                    }}
                  >
                    <div className="flex h-full flex-col justify-between text-xs">
                      <div>
                        {cardFields.name && (
                          <div className="font-bold" style={{ color: selectedCardTemplate.style.primaryColor }}>
                            {cardFields.name}
                          </div>
                        )}
                        {cardFields.title && (
                          <div style={{ color: selectedCardTemplate.style.secondaryColor }}>
                            {cardFields.title}
                          </div>
                        )}
                        {cardFields.company && (
                          <div className="mt-1" style={{ color: selectedCardTemplate.style.primaryColor }}>
                            {cardFields.company}
                          </div>
                        )}
                      </div>
                      <div className="flex items-end justify-between">
                        <div style={{ color: selectedCardTemplate.style.secondaryColor }}>
                          {cardFields.email && <div>{cardFields.email}</div>}
                          {cardFields.phone && <div>{cardFields.phone}</div>}
                        </div>
                        <div className="h-12 w-12 rounded bg-gray-200" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Download button */}
              <button
                onClick={() => {
                  if (onExport && selectedCardTemplate) {
                    // Export at 300 DPI
                    const dpi = 300;
                    const width = Math.round((selectedCardTemplate.width * dpi) / 25.4);
                    const height = Math.round((selectedCardTemplate.height * dpi) / 25.4);
                    onExport(width, height, 'png');
                  }
                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Download className="h-4 w-4" />
                Download Business Card (300 DPI)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
