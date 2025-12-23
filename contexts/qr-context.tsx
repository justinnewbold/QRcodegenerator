'use client';

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
  useMemo,
} from 'react';
import type { ErrorCorrectionLevel, QRStyle, FinderPattern } from '@/lib/qr-generator';

// ============================================
// Types
// ============================================

export type QRType =
  | 'url'
  | 'wifi'
  | 'vcard'
  | 'email'
  | 'sms'
  | 'phone'
  | 'calendar'
  | 'crypto'
  | 'appstore'
  | 'social'
  | 'location'
  | 'whatsapp'
  | 'meeting'
  | 'paypal'
  | 'media';

export interface QRStyleSettings {
  size: number;
  errorCorrection: ErrorCorrectionLevel;
  margin: number;
  foregroundColor: string;
  backgroundColor: string;
  dotStyle: QRStyle;
  cornerStyle: FinderPattern;
  transparentBackground: boolean;
}

export interface QRGradientSettings {
  enabled: boolean;
  type: 'linear' | 'radial';
  colorStart: string;
  colorEnd: string;
  rotation: number;
}

export interface QREyeColorSettings {
  enabled: boolean;
  topLeft: string;
  topRight: string;
  bottomLeft: string;
}

export interface QRLogoSettings {
  enabled: boolean;
  url: string;
  size: number;
  padding: number;
}

export interface QRFrameSettings {
  style: string;
  text: string;
  color: string;
  backgroundColor: string;
}

export interface QRState {
  // Content
  type: QRType;
  content: string;

  // Style
  style: QRStyleSettings;
  gradient: QRGradientSettings;
  eyeColors: QREyeColorSettings;
  logo: QRLogoSettings;
  frame: QRFrameSettings;

  // Generated
  qrDataUrl: string;
  qrSvg: string;
  isGenerating: boolean;

  // Type-specific content (for complex types)
  typeSpecificData: Record<string, unknown>;
}

type QRAction =
  | { type: 'SET_TYPE'; payload: QRType }
  | { type: 'SET_CONTENT'; payload: string }
  | { type: 'SET_STYLE'; payload: Partial<QRStyleSettings> }
  | { type: 'SET_GRADIENT'; payload: Partial<QRGradientSettings> }
  | { type: 'SET_EYE_COLORS'; payload: Partial<QREyeColorSettings> }
  | { type: 'SET_LOGO'; payload: Partial<QRLogoSettings> }
  | { type: 'SET_FRAME'; payload: Partial<QRFrameSettings> }
  | { type: 'SET_QR_DATA'; payload: { dataUrl: string; svg: string } }
  | { type: 'SET_GENERATING'; payload: boolean }
  | { type: 'SET_TYPE_SPECIFIC_DATA'; payload: { key: string; value: unknown } }
  | { type: 'RESET_TO_DEFAULTS' }
  | { type: 'LOAD_PRESET'; payload: Partial<QRState> };

// ============================================
// Default State
// ============================================

const defaultStyle: QRStyleSettings = {
  size: 300,
  errorCorrection: 'M',
  margin: 4,
  foregroundColor: '#000000',
  backgroundColor: '#ffffff',
  dotStyle: 'squares',
  cornerStyle: 'square',
  transparentBackground: false,
};

const defaultGradient: QRGradientSettings = {
  enabled: false,
  type: 'linear',
  colorStart: '#3b82f6',
  colorEnd: '#8b5cf6',
  rotation: 45,
};

const defaultEyeColors: QREyeColorSettings = {
  enabled: false,
  topLeft: '#000000',
  topRight: '#000000',
  bottomLeft: '#000000',
};

const defaultLogo: QRLogoSettings = {
  enabled: false,
  url: '',
  size: 60,
  padding: 5,
};

const defaultFrame: QRFrameSettings = {
  style: 'none',
  text: 'SCAN ME',
  color: '#000000',
  backgroundColor: '#ffffff',
};

const initialState: QRState = {
  type: 'url',
  content: '',
  style: defaultStyle,
  gradient: defaultGradient,
  eyeColors: defaultEyeColors,
  logo: defaultLogo,
  frame: defaultFrame,
  qrDataUrl: '',
  qrSvg: '',
  isGenerating: false,
  typeSpecificData: {},
};

// ============================================
// Reducer
// ============================================

function qrReducer(state: QRState, action: QRAction): QRState {
  switch (action.type) {
    case 'SET_TYPE':
      return {
        ...state,
        type: action.payload,
        content: '', // Reset content when type changes
        typeSpecificData: {},
      };

    case 'SET_CONTENT':
      return {
        ...state,
        content: action.payload,
      };

    case 'SET_STYLE':
      return {
        ...state,
        style: { ...state.style, ...action.payload },
      };

    case 'SET_GRADIENT':
      return {
        ...state,
        gradient: { ...state.gradient, ...action.payload },
      };

    case 'SET_EYE_COLORS':
      return {
        ...state,
        eyeColors: { ...state.eyeColors, ...action.payload },
      };

    case 'SET_LOGO':
      return {
        ...state,
        logo: { ...state.logo, ...action.payload },
      };

    case 'SET_FRAME':
      return {
        ...state,
        frame: { ...state.frame, ...action.payload },
      };

    case 'SET_QR_DATA':
      return {
        ...state,
        qrDataUrl: action.payload.dataUrl,
        qrSvg: action.payload.svg,
        isGenerating: false,
      };

    case 'SET_GENERATING':
      return {
        ...state,
        isGenerating: action.payload,
      };

    case 'SET_TYPE_SPECIFIC_DATA':
      return {
        ...state,
        typeSpecificData: {
          ...state.typeSpecificData,
          [action.payload.key]: action.payload.value,
        },
      };

    case 'RESET_TO_DEFAULTS':
      return {
        ...initialState,
        type: state.type, // Keep current type
      };

    case 'LOAD_PRESET':
      return {
        ...state,
        ...action.payload,
        style: { ...state.style, ...(action.payload.style || {}) },
        gradient: { ...state.gradient, ...(action.payload.gradient || {}) },
        eyeColors: { ...state.eyeColors, ...(action.payload.eyeColors || {}) },
        logo: { ...state.logo, ...(action.payload.logo || {}) },
        frame: { ...state.frame, ...(action.payload.frame || {}) },
      };

    default:
      return state;
  }
}

// ============================================
// Context
// ============================================

interface QRContextValue {
  state: QRState;
  dispatch: React.Dispatch<QRAction>;

  // Convenience methods
  setType: (type: QRType) => void;
  setContent: (content: string) => void;
  updateStyle: (style: Partial<QRStyleSettings>) => void;
  updateGradient: (gradient: Partial<QRGradientSettings>) => void;
  updateEyeColors: (eyeColors: Partial<QREyeColorSettings>) => void;
  updateLogo: (logo: Partial<QRLogoSettings>) => void;
  updateFrame: (frame: Partial<QRFrameSettings>) => void;
  setQRData: (dataUrl: string, svg: string) => void;
  setGenerating: (isGenerating: boolean) => void;
  setTypeSpecificData: (key: string, value: unknown) => void;
  resetToDefaults: () => void;
  loadPreset: (preset: Partial<QRState>) => void;

  // Computed values
  hasContent: boolean;
  canGenerate: boolean;
}

const QRContext = createContext<QRContextValue | null>(null);

// ============================================
// Provider
// ============================================

interface QRProviderProps {
  children: ReactNode;
  initialState?: Partial<QRState>;
}

export function QRProvider({ children, initialState: customInitialState }: QRProviderProps) {
  const [state, dispatch] = useReducer(
    qrReducer,
    customInitialState
      ? { ...initialState, ...customInitialState }
      : initialState
  );

  // Convenience methods
  const setType = useCallback((type: QRType) => {
    dispatch({ type: 'SET_TYPE', payload: type });
  }, []);

  const setContent = useCallback((content: string) => {
    dispatch({ type: 'SET_CONTENT', payload: content });
  }, []);

  const updateStyle = useCallback((style: Partial<QRStyleSettings>) => {
    dispatch({ type: 'SET_STYLE', payload: style });
  }, []);

  const updateGradient = useCallback((gradient: Partial<QRGradientSettings>) => {
    dispatch({ type: 'SET_GRADIENT', payload: gradient });
  }, []);

  const updateEyeColors = useCallback((eyeColors: Partial<QREyeColorSettings>) => {
    dispatch({ type: 'SET_EYE_COLORS', payload: eyeColors });
  }, []);

  const updateLogo = useCallback((logo: Partial<QRLogoSettings>) => {
    dispatch({ type: 'SET_LOGO', payload: logo });
  }, []);

  const updateFrame = useCallback((frame: Partial<QRFrameSettings>) => {
    dispatch({ type: 'SET_FRAME', payload: frame });
  }, []);

  const setQRData = useCallback((dataUrl: string, svg: string) => {
    dispatch({ type: 'SET_QR_DATA', payload: { dataUrl, svg } });
  }, []);

  const setGenerating = useCallback((isGenerating: boolean) => {
    dispatch({ type: 'SET_GENERATING', payload: isGenerating });
  }, []);

  const setTypeSpecificData = useCallback((key: string, value: unknown) => {
    dispatch({ type: 'SET_TYPE_SPECIFIC_DATA', payload: { key, value } });
  }, []);

  const resetToDefaults = useCallback(() => {
    dispatch({ type: 'RESET_TO_DEFAULTS' });
  }, []);

  const loadPreset = useCallback((preset: Partial<QRState>) => {
    dispatch({ type: 'LOAD_PRESET', payload: preset });
  }, []);

  // Computed values
  const hasContent = state.content.trim().length > 0;
  const canGenerate = hasContent && !state.isGenerating;

  const value = useMemo(
    () => ({
      state,
      dispatch,
      setType,
      setContent,
      updateStyle,
      updateGradient,
      updateEyeColors,
      updateLogo,
      updateFrame,
      setQRData,
      setGenerating,
      setTypeSpecificData,
      resetToDefaults,
      loadPreset,
      hasContent,
      canGenerate,
    }),
    [
      state,
      setType,
      setContent,
      updateStyle,
      updateGradient,
      updateEyeColors,
      updateLogo,
      updateFrame,
      setQRData,
      setGenerating,
      setTypeSpecificData,
      resetToDefaults,
      loadPreset,
      hasContent,
      canGenerate,
    ]
  );

  return <QRContext.Provider value={value}>{children}</QRContext.Provider>;
}

// ============================================
// Hook
// ============================================

export function useQR(): QRContextValue {
  const context = useContext(QRContext);
  if (!context) {
    throw new Error('useQR must be used within a QRProvider');
  }
  return context;
}

// ============================================
// Selectors (for optimized re-renders)
// ============================================

export function useQRStyle(): QRStyleSettings {
  const { state } = useQR();
  return state.style;
}

export function useQRGradient(): QRGradientSettings {
  const { state } = useQR();
  return state.gradient;
}

export function useQRLogo(): QRLogoSettings {
  const { state } = useQR();
  return state.logo;
}

export function useQRFrame(): QRFrameSettings {
  const { state } = useQR();
  return state.frame;
}

export function useQRContent(): { content: string; type: QRType } {
  const { state } = useQR();
  return { content: state.content, type: state.type };
}

export function useQROutput(): { dataUrl: string; svg: string; isGenerating: boolean } {
  const { state } = useQR();
  return {
    dataUrl: state.qrDataUrl,
    svg: state.qrSvg,
    isGenerating: state.isGenerating,
  };
}

export default QRContext;
