import React, { useState } from 'react';
import { Scan } from '@phosphor-icons/react';
import { BoundingBox } from '../../types';

interface AnnotatedImageProps {
  imageUrl: string;
  boxes?: BoundingBox[];
  activeBoxId?: string;
  onBoxClick?: (boxId: string, fieldId: string) => void;
  title?: string;
  badge?: string;
  pdpAreaCm2?: number;
  showOverlay?: boolean;
}

export const AnnotatedImage: React.FC<AnnotatedImageProps> = ({
  imageUrl,
  boxes = [],
  activeBoxId,
  onBoxClick,
  title = 'Packaging Specimen',
  badge,
  pdpAreaCm2,
  showOverlay = false,
}) => {
  const [hoveredBoxId, setHoveredBoxId] = useState<string | null>(null);

  const getBoxColors = (status: 'compliant' | 'violation' | 'warning', isSelected: boolean) => {
    if (isSelected) {
      return {
        stroke: '#1B365D',
        strokeWidth: 2.2,
        fill: 'rgba(27, 54, 93, 0.25)',
      };
    }
    switch (status) {
      case 'violation':
        return {
          stroke: '#DC2626',
          strokeWidth: 1.2,
          fill: 'rgba(220, 38, 38, 0.15)',
        };
      case 'warning':
        return {
          stroke: '#D97706',
          strokeWidth: 1.2,
          fill: 'rgba(217, 119, 6, 0.15)',
        };
      case 'compliant':
      default:
        return {
          stroke: '#059669',
          strokeWidth: 1.0,
          fill: 'rgba(5, 150, 105, 0.15)',
        };
    }
  };

  const compliantCount = boxes.filter((b) => b.status === 'compliant').length;
  const violationCount = boxes.filter((b) => b.status === 'violation').length;
  const warningCount = boxes.filter((b) => b.status === 'warning').length;

  return (
    <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden flex flex-col shadow-xs">
      {/* Clean Specimen Header */}
      <div className="px-3.5 py-2.5 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between gap-2 text-xs flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <Scan size={16} className="text-navy-800 shrink-0" weight="bold" />
          <span className="font-bold text-neutral-900 font-heading truncate">{title}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {badge && (
            <span className="text-2xs px-2 py-0.5 rounded font-mono font-semibold bg-navy-100/90 text-navy-900 border border-navy-200">
              {badge}
            </span>
          )}
          {pdpAreaCm2 !== undefined && (
            <span className="text-2xs px-2 py-0.5 rounded bg-neutral-200/80 font-mono font-medium text-neutral-700 border border-neutral-300/70">
              PDP: {pdpAreaCm2} cm²
            </span>
          )}
        </div>
      </div>

      {/* Main Specimen Surface - Clean packaging view with zero text labeling */}
      <div className="relative w-full aspect-[4/3] bg-neutral-900 overflow-hidden flex items-center justify-center select-none group">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-contain transition-opacity duration-200"
        />

        {/* Optional Clean Outlines (Only rendered if showOverlay is explicitly true; NO text labels are ever rendered) */}
        {showOverlay && boxes.length > 0 && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-auto"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            role="region"
            aria-label="Packaging bounding outlines overlay"
          >
            {boxes.map((box) => {
              const isSelected = activeBoxId === box.id || hoveredBoxId === box.id;
              const colors = getBoxColors(box.status, isSelected);

              return (
                <g
                  key={box.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  aria-label={`Region: ${box.label}. Status: ${box.status}`}
                  className="cursor-pointer outline-hidden transition-all duration-150"
                  onClick={() => onBoxClick?.(box.id, box.fieldId)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onBoxClick?.(box.id, box.fieldId);
                    }
                  }}
                  onMouseEnter={() => setHoveredBoxId(box.id)}
                  onMouseLeave={() => setHoveredBoxId(null)}
                >
                  <rect
                    x={box.x}
                    y={box.y}
                    width={box.width}
                    height={box.height}
                    fill={colors.fill}
                    stroke={colors.stroke}
                    strokeWidth={colors.strokeWidth}
                    rx="0.8"
                  />
                </g>
              );
            })}
          </svg>
        )}

        {/* Quick Legend only if overlay is enabled */}
        {showOverlay && boxes.length > 0 && (
          <div className="absolute bottom-2 left-2 right-2 px-3 py-1.5 rounded-md bg-neutral-950/90 backdrop-blur-md border border-neutral-800 flex items-center justify-between text-2xs text-white shadow-lg">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-neutral-200">Compliant ({compliantCount})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="text-neutral-200">Infraction ({violationCount})</span>
              </span>
              {warningCount > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-neutral-200">Caution ({warningCount})</span>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
