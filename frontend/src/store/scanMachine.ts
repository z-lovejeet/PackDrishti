import { create } from 'zustand';
import { downsampleImage, blobToFile } from '../utils/imageProc';
import { apiClient } from '../utils/apiClient';

export type ScanStatus =
  | 'idle'
  | 'capturing'
  | 'compressing'
  | 'uploading'
  | 'processing'
  | 'complete'
  | 'rate_limited'
  | 'error';

export interface VisualTokenBBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface VisualToken {
  text: string;
  declaration_type: string;
  bbox: VisualTokenBBox;
  confidence: number;
}

export interface ScanViolation {
  violation_id: string;
  rule_code: string;
  rule_name: string;
  severity: 'critical' | 'major' | 'minor' | 'high' | 'medium' | 'low';
  description: string;
  expected_value: string;
  actual_value: string;
  statutory_reference: string;
  compounding_amount: number;
}

export interface ScanAnalysisResult {
  scan_id: string;
  brand_name: string | null;
  product_name: string | null;
  category: string | null;
  mrp: number | null;
  net_quantity_value: number | null;
  net_quantity_unit: string | null;
  is_compliant: boolean;
  compliance_score: number;
  pdp_area_cm2: number;
  calculated_usp: number | null;
  calculated_usp_unit: string | null;
  violations: ScanViolation[];
  tokens: VisualToken[];
  consumer_advisory: string;
  form_lm_insp_2011_notice_draft: string | null;
  execution_time_ms: number;
}

export interface CompressionMetrics {
  originalSizeBytes: number;
  compressedSizeBytes: number;
  compressionRatio: number;
}

interface ScanMachineState {
  status: ScanStatus;
  imageSrc: string | null;
  fileName: string;
  result: ScanAnalysisResult | null;
  compression: CompressionMetrics | null;
  errorMessage: string | null;
  cooldownRemainingSeconds: number;
  activeTokenIndex: number | null;

  // Actions
  startCapture: () => void;
  stopCapture: () => void;
  processFile: (fileOrBlob: File | Blob, filename?: string) => Promise<void>;
  selectToken: (index: number | null) => void;
  reset: () => void;
  setRateLimited: (seconds: number) => void;
  decrementCooldown: () => void;
}

export const useScanMachine = create<ScanMachineState>((set, get) => ({
  status: 'idle',
  imageSrc: null,
  fileName: '',
  result: null,
  compression: null,
  errorMessage: null,
  cooldownRemainingSeconds: 0,
  activeTokenIndex: null,

  startCapture: () => {
    set({ status: 'capturing', errorMessage: null });
  },

  stopCapture: () => {
    if (get().status === 'capturing') {
      set({ status: 'idle' });
    }
  },

  processFile: async (fileOrBlob: File | Blob, filename = 'packaging_scan.jpg') => {
    try {
      // Step 1: Compressing
      set({
        status: 'compressing',
        fileName: filename,
        errorMessage: null,
      });

      const downsample = await downsampleImage(fileOrBlob, {
        maxDimension: 2048,
        maxSizeBytes: 2 * 1024 * 1024, // 2MB
        quality: 0.85,
      });

      const compressedFile = blobToFile(downsample.blob, filename);

      set({
        imageSrc: downsample.dataUrl,
        compression: {
          originalSizeBytes: downsample.originalSizeBytes,
          compressedSizeBytes: downsample.compressedSizeBytes,
          compressionRatio: downsample.compressionRatio,
        },
        status: 'processing',
      });

      // Step 2: Live API Execution
      const formData = new FormData();
      formData.append('file', compressedFile);

      const response = await apiClient.post<ScanAnalysisResult>(
        '/api/v1/scan/analyze',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      set({
        status: 'complete',
        result: response.data,
        activeTokenIndex: response.data.tokens.length > 0 ? 0 : null,
      });
    } catch (err: unknown) {
      const axiosError = err as { response?: { status?: number; data?: { detail?: string } }; message?: string };
      if (axiosError.response?.status === 429) {
        set({
          status: 'rate_limited',
          cooldownRemainingSeconds: 30,
          errorMessage: 'Request quota exceeded. Rate limiting cooldown activated.',
        });
      } else {
        const detailMsg = axiosError.response?.data?.detail || axiosError.message || 'Scan analysis failed.';
        set({
          status: 'error',
          errorMessage: detailMsg,
        });
      }
    }
  },

  selectToken: (index: number | null) => {
    set({ activeTokenIndex: index });
  },

  reset: () => {
    set({
      status: 'idle',
      imageSrc: null,
      fileName: '',
      result: null,
      compression: null,
      errorMessage: null,
      activeTokenIndex: null,
    });
  },

  setRateLimited: (seconds: number) => {
    set({
      status: 'rate_limited',
      cooldownRemainingSeconds: seconds,
      errorMessage: `Rate limit active. Please wait ${seconds} seconds before next scan.`,
    });
  },

  decrementCooldown: () => {
    const current = get().cooldownRemainingSeconds;
    if (current <= 1) {
      set({ cooldownRemainingSeconds: 0, status: 'idle', errorMessage: null });
    } else {
      set({ cooldownRemainingSeconds: current - 1 });
    }
  },
}));
