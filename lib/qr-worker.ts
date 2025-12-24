/**
 * QR Code Generation Web Worker
 * Offloads heavy QR code rendering to a background thread
 */

import QRCode from 'qrcode';

export interface QRWorkerMessage {
  id: string;
  type: 'generate' | 'generateBatch';
  payload: QRGeneratePayload | QRBatchPayload;
}

export interface QRGeneratePayload {
  content: string;
  options: {
    width: number;
    margin: number;
    errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
    color: {
      dark: string;
      light: string;
    };
  };
}

export interface QRBatchPayload {
  items: Array<{
    id: string;
    content: string;
  }>;
  options: QRGeneratePayload['options'];
}

export interface QRWorkerResponse {
  id: string;
  type: 'success' | 'error' | 'progress';
  data?: string | Array<{ id: string; dataUrl: string }>;
  error?: string;
  progress?: number;
}

// Worker context check
const isWorker = typeof self !== 'undefined' && typeof window === 'undefined';

if (isWorker) {
  self.onmessage = async (event: MessageEvent<QRWorkerMessage>) => {
    const { id, type, payload } = event.data;

    try {
      if (type === 'generate') {
        const result = await generateSingleQR(payload as QRGeneratePayload);
        self.postMessage({ id, type: 'success', data: result } as QRWorkerResponse);
      } else if (type === 'generateBatch') {
        const batchPayload = payload as QRBatchPayload;
        const results: Array<{ id: string; dataUrl: string }> = [];

        for (let i = 0; i < batchPayload.items.length; i++) {
          const item = batchPayload.items[i];
          const dataUrl = await QRCode.toDataURL(item.content, batchPayload.options);
          results.push({ id: item.id, dataUrl });

          // Report progress
          self.postMessage({
            id,
            type: 'progress',
            progress: ((i + 1) / batchPayload.items.length) * 100,
          } as QRWorkerResponse);
        }

        self.postMessage({ id, type: 'success', data: results } as QRWorkerResponse);
      }
    } catch (error) {
      self.postMessage({
        id,
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      } as QRWorkerResponse);
    }
  };
}

async function generateSingleQR(payload: QRGeneratePayload): Promise<string> {
  return QRCode.toDataURL(payload.content, payload.options);
}

/**
 * QR Worker Manager - use this in the main thread
 */
export class QRWorkerManager {
  private worker: Worker | null = null;
  private pendingRequests: Map<string, {
    resolve: (value: unknown) => void;
    reject: (error: Error) => void;
    onProgress?: (progress: number) => void;
  }> = new Map();

  constructor() {
    if (typeof window !== 'undefined' && typeof Worker !== 'undefined') {
      try {
        // Create worker from blob to avoid separate file
        const workerCode = `
          importScripts('https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js');

          self.onmessage = async (event) => {
            const { id, type, payload } = event.data;

            try {
              if (type === 'generate') {
                const result = await QRCode.toDataURL(payload.content, payload.options);
                self.postMessage({ id, type: 'success', data: result });
              } else if (type === 'generateBatch') {
                const results = [];
                for (let i = 0; i < payload.items.length; i++) {
                  const item = payload.items[i];
                  const dataUrl = await QRCode.toDataURL(item.content, payload.options);
                  results.push({ id: item.id, dataUrl });
                  self.postMessage({
                    id,
                    type: 'progress',
                    progress: ((i + 1) / payload.items.length) * 100,
                  });
                }
                self.postMessage({ id, type: 'success', data: results });
              }
            } catch (error) {
              self.postMessage({
                id,
                type: 'error',
                error: error.message || 'Unknown error',
              });
            }
          };
        `;
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        this.worker = new Worker(URL.createObjectURL(blob));

        this.worker.onmessage = (event: MessageEvent<QRWorkerResponse>) => {
          const { id, type, data, error, progress } = event.data;
          const pending = this.pendingRequests.get(id);

          if (!pending) return;

          if (type === 'progress' && pending.onProgress) {
            pending.onProgress(progress!);
          } else if (type === 'success') {
            pending.resolve(data);
            this.pendingRequests.delete(id);
          } else if (type === 'error') {
            pending.reject(new Error(error));
            this.pendingRequests.delete(id);
          }
        };

        this.worker.onerror = (error) => {
          console.error('QR Worker error:', error);
        };
      } catch (e) {
        console.warn('Web Worker not available, falling back to main thread');
        this.worker = null;
      }
    }
  }

  async generate(payload: QRGeneratePayload): Promise<string> {
    if (!this.worker) {
      // Fallback to main thread
      return QRCode.toDataURL(payload.content, payload.options);
    }

    const id = `qr-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve: resolve as (value: unknown) => void, reject });
      this.worker!.postMessage({ id, type: 'generate', payload });
    });
  }

  async generateBatch(
    payload: QRBatchPayload,
    onProgress?: (progress: number) => void
  ): Promise<Array<{ id: string; dataUrl: string }>> {
    if (!this.worker) {
      // Fallback to main thread
      const results: Array<{ id: string; dataUrl: string }> = [];
      for (let i = 0; i < payload.items.length; i++) {
        const item = payload.items[i];
        const dataUrl = await QRCode.toDataURL(item.content, payload.options);
        results.push({ id: item.id, dataUrl });
        if (onProgress) {
          onProgress(((i + 1) / payload.items.length) * 100);
        }
      }
      return results;
    }

    const id = `batch-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, {
        resolve: resolve as (value: unknown) => void,
        reject,
        onProgress,
      });
      this.worker!.postMessage({ id, type: 'generateBatch', payload });
    });
  }

  terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.pendingRequests.clear();
  }
}

// Singleton instance
let workerManager: QRWorkerManager | null = null;

export function getQRWorkerManager(): QRWorkerManager {
  if (!workerManager) {
    workerManager = new QRWorkerManager();
  }
  return workerManager;
}
