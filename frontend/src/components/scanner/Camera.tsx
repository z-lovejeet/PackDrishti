import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Camera as CameraIcon,
  CameraRotate,
  X,
  Lightning,
  WarningCircle,
  UploadSimple,
  Scan,
} from '@phosphor-icons/react';

interface CameraProps {
  onCapture: (blob: Blob) => void;
  onClose: () => void;
  isOpen: boolean;
}

export const Camera: React.FC<CameraProps> = ({ onCapture, onClose, isOpen }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startStream = useCallback(async () => {
    stopStream();
    setIsInitializing(true);
    setCameraError(null);

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Check for torch/flashlight capability
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities ? track.getCapabilities() : null;
      if (capabilities && 'torch' in capabilities) {
        setHasTorch(true);
      } else {
        setHasTorch(false);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unable to access video capture device. Please verify camera permissions in browser settings.';
      setCameraError(message);
    } finally {
      setIsInitializing(false);
    }
  }, [facingMode, stopStream]);

  useEffect(() => {
    if (isOpen) {
      startStream();
    } else {
      stopStream();
    }

    return () => {
      stopStream();
    };
  }, [isOpen, startStream, stopStream]);

  const handleCapture = useCallback(() => {
    if (!videoRef.current || isCapturing) return;

    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1920;
    canvas.height = video.videoHeight || 1080;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsCapturing(false);
      return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Brief visual shutter flash before closing
    setTimeout(() => {
      canvas.toBlob(
        (blob) => {
          setIsCapturing(false);
          if (blob) {
            stopStream();
            onCapture(blob);
          }
        },
        'image/jpeg',
        0.92
      );
    }, 150);
  }, [isCapturing, onCapture, stopStream]);

  // Keyboard shortcut for closing or capturing
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        stopStream();
        onClose();
      } else if ((e.key === ' ' || e.key === 'Enter') && !cameraError && !isInitializing && !isCapturing) {
        e.preventDefault();
        handleCapture();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, cameraError, isInitializing, isCapturing, stopStream, onClose, handleCapture]);

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const toggleTorch = async () => {
    if (!streamRef.current || !hasTorch) return;
    const track = streamRef.current.getVideoTracks()[0];
    try {
      const newTorchState = !torchOn;
      await (track as unknown as { applyConstraints: (c: unknown) => Promise<void> }).applyConstraints({
        advanced: [{ torch: newTorchState }],
      });
      setTorchOn(newTorchState);
    } catch {
      setHasTorch(false);
    }
  };

  const handleFallbackFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      stopStream();
      onCapture(e.target.files[0]);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/90 p-4 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label="Camera packaging scanner"
    >
      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl flex flex-col">
        {/* Header Controls */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-3.5 text-white bg-neutral-900/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-800 text-white border border-navy-700">
              <CameraIcon size={18} weight="bold" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-wide font-heading block">
                Principal Display Panel Specimen Scanner
              </span>
              <span className="text-2xs text-neutral-400 font-mono">
                Legal Metrology Rule 7 Frame Alignment
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              stopStream();
              onClose();
            }}
            className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-white"
            title="Close camera (Escape)"
            aria-label="Close camera"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Viewport Surface with HUD & Corner Brackets */}
        <div className="relative aspect-video w-full overflow-hidden bg-black flex items-center justify-center select-none">
          {cameraError ? (
            <div className="flex flex-col items-center gap-3 p-8 text-center text-neutral-300 max-w-md">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
                <WarningCircle size={28} weight="fill" />
              </div>
              <h4 className="text-sm font-bold text-white font-heading">
                Camera Feed Unavailable
              </h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {cameraError}
              </p>
              <label className="mt-2 inline-flex items-center gap-2 cursor-pointer rounded-lg bg-navy-800 hover:bg-navy-900 px-4 py-2.5 text-xs font-semibold text-white border border-navy-700 shadow-xs transition-colors">
                <UploadSimple size={16} weight="bold" />
                <span>Upload Packaging Specimen Instead</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFallbackFileSelect}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                className="h-full w-full object-cover"
              />

              {/* Shutter Flash Overlay */}
              {isCapturing && (
                <div className="absolute inset-0 bg-white z-20 animate-fadeIn" />
              )}

              {/* Viewfinder Target HUD with 4 Corner Brackets */}
              <div className="pointer-events-none absolute inset-6 sm:inset-10 flex flex-col justify-between p-2">
                {/* Top Brackets & Header HUD */}
                <div className="flex items-start justify-between">
                  {/* Top-Left Bracket */}
                  <div className="w-8 h-8 sm:w-12 sm:h-12 border-t-3 border-l-3 border-saffron-400 rounded-tl-md shadow-sm" />

                  {/* Top Center Status Pill */}
                  <div className="flex items-center gap-2 bg-neutral-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-neutral-700/80 text-2xs font-mono text-neutral-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Optical Alignment HUD</span>
                  </div>

                  {/* Top-Right Bracket */}
                  <div className="w-8 h-8 sm:w-12 sm:h-12 border-t-3 border-r-3 border-saffron-400 rounded-tr-md shadow-sm" />
                </div>

                {/* Center Crosshair Reticle */}
                <div className="self-center flex items-center justify-center relative">
                  <div className="w-12 h-12 border border-dashed border-white/40 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-saffron-400 rounded-full" />
                  </div>
                  <div className="absolute w-16 h-px bg-white/30" />
                  <div className="absolute h-16 w-px bg-white/30" />
                </div>

                {/* Bottom Brackets & Footer HUD */}
                <div className="flex items-end justify-between">
                  {/* Bottom-Left Bracket */}
                  <div className="w-8 h-8 sm:w-12 sm:h-12 border-b-3 border-l-3 border-saffron-400 rounded-bl-md shadow-sm" />

                  {/* Bottom Center Guidance */}
                  <div className="flex items-center gap-2 bg-neutral-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-neutral-700/80 text-2xs font-medium text-neutral-300">
                    <Scan size={14} className="text-saffron-400" />
                    <span>Center Front or Back Label within Frame</span>
                  </div>

                  {/* Bottom-Right Bracket */}
                  <div className="w-8 h-8 sm:w-12 sm:h-12 border-b-3 border-r-3 border-saffron-400 rounded-br-md shadow-sm" />
                </div>
              </div>

              {isInitializing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 text-xs text-neutral-300 font-medium gap-2">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span>Initializing WebRTC camera stream...</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Controls Toolbar */}
        {!cameraError && (
          <div className="flex items-center justify-between border-t border-neutral-800 bg-neutral-950 px-8 py-4">
            {/* Flashlight / Torch Button */}
            <div className="w-16 flex justify-start">
              {hasTorch ? (
                <button
                  type="button"
                  onClick={toggleTorch}
                  className={`rounded-full p-3 transition-all ${
                    torchOn
                      ? 'bg-amber-500 text-neutral-950 shadow-md ring-2 ring-amber-300'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                  title={torchOn ? 'Turn flashlight off' : 'Turn flashlight on'}
                  aria-label={torchOn ? 'Flashlight enabled' : 'Flashlight disabled'}
                >
                  <Lightning size={20} weight={torchOn ? 'fill' : 'bold'} />
                </button>
              ) : (
                <div className="w-10" />
              )}
            </div>

            {/* Shutter Button with Pulse Feedback */}
            <div className="flex flex-col items-center gap-1">
              <button
                type="button"
                disabled={isInitializing || isCapturing}
                onClick={handleCapture}
                className="group relative flex h-18 w-18 items-center justify-center rounded-full border-4 border-white/80 bg-neutral-900 shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 focus:outline-hidden focus-visible:ring-4 focus-visible:ring-saffron-400"
                title="Capture specimen photo (Spacebar)"
                aria-label="Capture packaging photo"
              >
                {/* Animated pulse halo on idle */}
                <div className="absolute inset-0 rounded-full border-2 border-saffron-400/50 animate-ping opacity-75" />
                {/* Inner Shutter Surface */}
                <div className="h-12 w-12 rounded-full bg-saffron-500 transition-all group-hover:scale-105 group-active:scale-90 group-hover:bg-saffron-400" />
              </button>
              <span className="text-2xs text-neutral-400 font-mono">Press Shutter or Space</span>
            </div>

            {/* Flip Camera Button */}
            <div className="w-16 flex justify-end">
              <button
                type="button"
                onClick={toggleCamera}
                className="rounded-full bg-neutral-800 p-3 text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-white"
                title="Switch camera sensor"
                aria-label="Switch between environment and user camera"
              >
                <CameraRotate size={20} weight="bold" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
