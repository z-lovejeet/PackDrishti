/**
 * PackDrashiti (SIH26034) Image Processing Utilities
 * Enforces client-side downsampling to keep packaging scans < 2MB while preserving OCR clarity.
 */

export interface DownsampleOptions {
  maxDimension?: number;
  maxSizeBytes?: number;
  quality?: number;
  mimeType?: string;
}

export interface DownsampleResult {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  compressionRatio: number;
}

const DEFAULT_OPTIONS: Required<DownsampleOptions> = {
  maxDimension: 2048,
  maxSizeBytes: 2 * 1024 * 1024, // 2MB statutory maximum
  quality: 0.85,
  mimeType: 'image/jpeg',
};

/**
 * Loads an image File or Blob into an HTMLImageElement asynchronously.
 */
export const loadImage = (file: Blob | File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load image: ${err}`));
    };
    img.src = url;
  });
};

/**
 * Computes scaled dimensions that preserve aspect ratio within maxDimension.
 */
export const calculateScaledDimensions = (
  width: number,
  height: number,
  maxDimension: number
): { width: number; height: number } => {
  if (width <= maxDimension && height <= maxDimension) {
    return { width, height };
  }

  if (width > height) {
    const scaledHeight = Math.round((height * maxDimension) / width);
    return { width: maxDimension, height: scaledHeight };
  } else {
    const scaledWidth = Math.round((width * maxDimension) / height);
    return { width: scaledWidth, height: maxDimension };
  }
};

/**
 * Downsamples and compresses an image File or Blob using HTML5 Canvas.
 * Recursively reduces quality if the output exceeds maxSizeBytes.
 */
export const downsampleImage = async (
  file: File | Blob,
  options: DownsampleOptions = {}
): Promise<DownsampleResult> => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const img = await loadImage(file);
  const originalSizeBytes = file.size;

  const { width, height } = calculateScaledDimensions(
    img.naturalWidth,
    img.naturalHeight,
    opts.maxDimension
  );

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get 2D rendering context from canvas');
  }

  // Draw image with high-quality smoothing for OCR edge preservation
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  let currentQuality = opts.quality;
  let dataUrl = canvas.toDataURL(opts.mimeType, currentQuality);
  let blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error('Canvas toBlob conversion failed'));
      },
      opts.mimeType,
      currentQuality
    );
  });

  // Iterative reduction if size exceeds target limit
  let attempts = 0;
  while (blob.size > opts.maxSizeBytes && attempts < 4 && currentQuality > 0.4) {
    currentQuality -= 0.15;
    attempts++;
    dataUrl = canvas.toDataURL(opts.mimeType, currentQuality);
    blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error('Canvas toBlob conversion failed'));
        },
        opts.mimeType,
        currentQuality
      );
    });
  }

  return {
    blob,
    dataUrl,
    width,
    height,
    originalSizeBytes,
    compressedSizeBytes: blob.size,
    compressionRatio: Number((blob.size / originalSizeBytes).toFixed(3)),
  };
};

/**
 * Converts a Blob to a File object for multipart form uploads.
 */
export const blobToFile = (blob: Blob, filename = 'scan_capture.jpg'): File => {
  return new File([blob], filename, {
    type: blob.type || 'image/jpeg',
    lastModified: Date.now(),
  });
};
