import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Camera as CameraIcon,
  CameraRotate,
  X,
  Lightning,
  WarningCircle,
  UploadSimple,
} from '@phosphor-icons/react';
import { Button } from '../common/Button';

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

      // Check for torch/flashlight support on track
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
          : 'Unable to access camera. Please verify device permissions.';
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

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const toggleTorch = async () => {
    if (!streamRef.current || !hasTorch) return;
    const track = streamRef.current.getVideoTracks()[0];
    try {
      const newTorchState = !torchOn;
      // Advanced constraints for torch
      await (track as unknown as { applyConstraints: (c: unknown) => Promise<void> }).applyConstraints({
        advanced: [{ torch: newTorchState }],
      });
      setTorchOn(newTorchState);
    } catch {
      setHasTorch(false);
    }
  };

  const handleCapture = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          stopStream();
          onCapture(blob);
        }
      },
      'image/jpeg',
      0.9
    );
  };

  const handleFallbackFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      stopStream();
      onCapture(e.target.files[0]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-gray-800 bg-gray-950 shadow-2xl">
        {/* Header Controls */}
        <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3 text-white">
          <div className="flex items-center gap-2">
            <CameraIcon className="h-5 w-5 text-indigo-400" />
            <span className="text-sm font-semibold tracking-wide">
              Principal Display Panel Scanner
            </span>
          </div>
          <button
            onClick={() => {
              stopStream();
              onClose();
            }}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
            title="Close camera"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Viewport */}
        <div className="relative aspect-video w-full overflow-hidden bg-black flex items-center justify-center">
          {cameraError ? (
            <div className="flex flex-col items-center gap-3 p-6 text-center text-gray-300">
              <WarningCircle className="h-10 w-10 text-amber-500" />
              <p className="text-sm">{cameraError}</p>
              <label className="mt-2 inline-flex items-center gap-2 cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors">
                <UploadSimple className="h-4 w-4" />
                Upload Photo Instead
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

              {/* Viewfinder Target Overlay */}
              <div className="pointer-events-none absolute inset-8 rounded-xl border-2 border-dashed border-indigo-400/60 flex flex-col justify-between p-4">
                <div className="flex justify-between text-[11px] font-mono text-indigo-300/80 uppercase">
                  <span>Align Label Within Frame</span>
                  <span>Rule 7 Compliance</span>
                </div>
                <div className="flex justify-between text-[11px] font-mono text-indigo-300/80">
                  <span>Automatic Lighting</span>
                  <span>SI Units Metric</span>
                </div>
              </div>

              {isInitializing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm text-gray-300 font-medium">
                  Initializing camera feed...
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Controls */}
        {!cameraError && (
          <div className="flex items-center justify-around border-t border-gray-800 bg-gray-950 px-6 py-4">
            {hasTorch ? (
              <button
                type="button"
                onClick={toggleTorch}
                className={`rounded-full p-3 transition-colors ${
                  torchOn ? 'bg-amber-500 text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
                title={torchOn ? 'Turn flash off' : 'Turn flash on'}
              >
                <Lightning className="h-5 w-5" />
              </button>
            ) : (
              <div className="w-11" />
            )}

            {/* Shutter Button */}
            <button
              type="button"
              disabled={isInitializing}
              onClick={handleCapture}
              className="group relative flex h-16 w-16 items-center justify-center rounded-full border-4 border-indigo-500 bg-white shadow-lg transition-transform active:scale-95 disabled:opacity-50"
              title="Capture packaging image"
            >
              <div className="h-11 w-11 rounded-full bg-indigo-600 transition-transform group-hover:scale-105" />
            </button>

            {/* Flip Camera Button */}
            <button
              type="button"
              onClick={toggleCamera}
              className="rounded-full bg-gray-800 p-3 text-gray-300 hover:bg-gray-700 transition-colors"
              title="Switch camera"
            >
              <CameraRotate className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
