'use client';

/**
 * Lazy Loaded Components
 * Heavy components loaded on-demand to improve initial page load
 */

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Loading skeleton component
function LoadingSkeleton({ height = 400 }: { height?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-lg border border-border bg-muted/30"
      style={{ height }}
    >
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="text-sm">Loading...</span>
      </div>
    </div>
  );
}

// Components with DEFAULT exports
export const LazyAnimatedQRGenerator = dynamic(
  () => import('./animated-qr-generator'),
  { loading: () => <LoadingSkeleton height={500} />, ssr: false }
);

export const LazyPrintTemplateDesigner = dynamic(
  () => import('./print-template-designer'),
  { loading: () => <LoadingSkeleton height={500} />, ssr: false }
);

export const LazyBrandKitManager = dynamic(
  () => import('./brand-kit-manager'),
  { loading: () => <LoadingSkeleton height={450} />, ssr: false }
);

export const LazyDynamicQRManager = dynamic(
  () => import('./dynamic-qr-manager'),
  { loading: () => <LoadingSkeleton height={450} />, ssr: false }
);

export const LazyQRComparison = dynamic(
  () => import('./qr-comparison'),
  { loading: () => <LoadingSkeleton height={500} />, ssr: false }
);

// Components with NAMED exports
export const LazyThemeCreator = dynamic(
  () => import('./theme-creator').then(mod => ({ default: mod.ThemeCreator })),
  { loading: () => <LoadingSkeleton height={600} />, ssr: false }
);

export const LazyStatsDashboard = dynamic(
  () => import('./stats-dashboard').then(mod => ({ default: mod.StatsDashboard })),
  { loading: () => <LoadingSkeleton height={400} />, ssr: false }
);

export const LazyVersionHistory = dynamic(
  () => import('./version-history').then(mod => ({ default: mod.VersionHistory })),
  { loading: () => <LoadingSkeleton height={400} />, ssr: false }
);

export const LazyContentScheduler = dynamic(
  () => import('./content-scheduler').then(mod => ({ default: mod.ContentScheduler })),
  { loading: () => <LoadingSkeleton height={450} />, ssr: false }
);

export const LazyQRChainsManager = dynamic(
  () => import('./qr-chains-manager').then(mod => ({ default: mod.QRChainsManager })),
  { loading: () => <LoadingSkeleton height={500} />, ssr: false }
);

export const LazyWebhooksManager = dynamic(
  () => import('./webhooks-manager').then(mod => ({ default: mod.WebhooksManager })),
  { loading: () => <LoadingSkeleton height={400} />, ssr: false }
);

export const LazyExpiringQRSettings = dynamic(
  () => import('./expiring-qr-settings').then(mod => ({ default: mod.ExpiringQRSettings })),
  { loading: () => <LoadingSkeleton height={400} />, ssr: false }
);

export const LazySecuritySettings = dynamic(
  () => import('./security-settings').then(mod => ({ default: mod.SecuritySettings })),
  { loading: () => <LoadingSkeleton height={500} />, ssr: false }
);

export const LazySocialExport = dynamic(
  () => import('./social-export').then(mod => ({ default: mod.SocialExport })),
  { loading: () => <LoadingSkeleton height={450} />, ssr: false }
);

export const LazyQRValidatorPanel = dynamic(
  () => import('./qr-validator-panel').then(mod => ({ default: mod.QRValidatorPanel })),
  { loading: () => <LoadingSkeleton height={400} />, ssr: false }
);

// Re-export for convenience
export { LoadingSkeleton };
