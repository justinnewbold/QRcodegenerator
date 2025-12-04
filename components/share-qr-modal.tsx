'use client';

import { useState, useEffect } from 'react';
import {
  ShareableQRConfig,
  generateShareableUrl,
  copyShareableUrl,
  generateConfigHash,
} from '@/lib/shareable-links';
import { Share2, Link, Copy, Check, X, QrCode, ExternalLink, Mail, MessageCircle } from 'lucide-react';

interface ShareQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ShareableQRConfig;
}

export function ShareQRModal({ isOpen, onClose, config }: ShareQRModalProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  // Generate URL on open
  useEffect(() => {
    if (isOpen) {
      setShareUrl(generateShareableUrl(config));
      setCopied(false);
    }
  }, [isOpen, config]);

  // Handle copy
  const handleCopy = async () => {
    const success = await copyShareableUrl(config);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Share via Web Share API
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: config.name || 'QR Code',
          text: 'Check out this QR code I created!',
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled or error - ignore
        if ((error as Error).name !== 'AbortError') {
          console.error('Share failed:', error);
        }
      }
    }
  };

  // Share via email
  const handleEmailShare = () => {
    const subject = encodeURIComponent(config.name || 'QR Code');
    const body = encodeURIComponent(`Check out this QR code I created:\n\n${shareUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  // Share via WhatsApp
  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`Check out this QR code I created: ${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`);
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const configHash = generateConfigHash(config);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-card shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-title"
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Share2 className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h2 id="share-title" className="text-lg font-semibold">Share QR Code</h2>
            <p className="text-sm text-muted-foreground">
              Share your QR code with others
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Preview */}
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <QrCode className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">
                {config.name || `${config.type} QR Code`}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {config.content.slice(0, 50)}{config.content.length > 50 ? '...' : ''}
              </p>
            </div>
            <span className="shrink-0 rounded bg-muted px-2 py-1 text-xs font-mono text-muted-foreground">
              #{configHash}
            </span>
          </div>

          {/* Shareable Link */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Shareable Link
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="w-full truncate rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm"
                />
              </div>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Share Options */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Share via
            </label>
            <div className="grid grid-cols-3 gap-2">
              {/* Native Share (if available) */}
              {'share' in navigator && (
                <button
                  onClick={handleNativeShare}
                  className="flex flex-col items-center gap-2 rounded-lg border border-border p-3 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <ExternalLink className="h-5 w-5" />
                  <span className="text-xs">Share</span>
                </button>
              )}

              {/* Email */}
              <button
                onClick={handleEmailShare}
                className="flex flex-col items-center gap-2 rounded-lg border border-border p-3 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Mail className="h-5 w-5" />
                <span className="text-xs">Email</span>
              </button>

              {/* WhatsApp */}
              <button
                onClick={handleWhatsAppShare}
                className="flex flex-col items-center gap-2 rounded-lg border border-border p-3 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <MessageCircle className="h-5 w-5" />
                <span className="text-xs">WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">
              Anyone with this link can view and recreate your QR code with the same settings.
              The link contains all styling options but no sensitive data is stored on any server.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-border p-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-muted px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/80"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// Share Button Component for easy integration
interface ShareQRButtonProps {
  config: ShareableQRConfig;
  variant?: 'default' | 'icon';
}

export function ShareQRButton({ config, variant = 'default' }: ShareQRButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (variant === 'icon') {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Share QR code"
          title="Share QR code"
        >
          <Share2 className="h-4 w-4" />
        </button>
        <ShareQRModal isOpen={isOpen} onClose={() => setIsOpen(false)} config={config} />
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <Share2 className="h-4 w-4" />
        <span>Share</span>
      </button>
      <ShareQRModal isOpen={isOpen} onClose={() => setIsOpen(false)} config={config} />
    </>
  );
}
