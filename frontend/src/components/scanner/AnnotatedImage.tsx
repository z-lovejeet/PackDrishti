import React, { useState } from 'react';
import { Scan } from '@phosphor-icons/react';
import { BoundingBox } from '../../types';

interface AnnotatedImageProps {
  imageUrl: string;
  boxes: BoundingBox[];
  activeBoxId?: string;
  onBoxClick?: (boxId: string, fieldId: string) => void;
  title?: string;
  pdpAreaCm2?: number;
}

export const AnnotatedImage: React.FC<AnnotatedImageProps> = ({
  imageUrl,
  boxes,
  activeBoxId,
  onBoxClick,
  title = 'Packaging Label (Principal Display Panel)',
  pdpAreaCm2 = 148,
}) => {
  const [hoveredBoxId, setHoveredBoxId] = useState<string | null>(null);

  const getBoxColors = (status: 'compliant' | 'violation' | 'warning', isSelected: boolean) => {
    if (isSelected) {
      return {
        stroke: '#1B365D', // Navy for active
        strokeWidth: 2.2,
        fill: 'rgba(27, 54, 93, 0.35)',
        textBg: '#1B365D',
        textColor: '#FFFFFF',
      };
    }
    switch (status) {
      case 'violation':
        return {
          stroke: '#DC2626', // Crimson for violation
          strokeWidth: 1.2,
          fill: 'rgba(220, 38, 38, 0.22)',
          textBg: '#DC2626',
          textColor: '#FFFFFF',
        };
      case 'warning':
        return {
          stroke: '#D97706', // Amber for warning
          strokeWidth: 1.2,
          fill: 'rgba(217, 119, 6, 0.22)',
          textBg: '#D97706',
          textColor: '#FFFFFF',
        };
      case 'compliant':
      default:
        return {
          stroke: '#059669', // Emerald for compliant
          strokeWidth: 1.0,
          fill: 'rgba(5, 150, 105, 0.20)',
          textBg: '#059669',
          textColor: '#FFFFFF',
        };
    }
  };

  const compliantCount = boxes.filter((b) => b.status === 'compliant').length;
  const violationCount = boxes.filter((b) => b.status === 'violation').length;
  const warningCount = boxes.filter((b) => b.status === 'warning').length;

  return (
    <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden flex flex-col shadow-xs">
      {/* Visual Header */}
      <div className="px-4 py-3 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between gap-2 text-xs flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <Scan size={16} className="text-navy-800 shrink-0" />
          <span className="font-bold text-neutral-900 font-heading truncate">{title}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-2xs px-2.5 py-0.5 rounded-md bg-neutral-200/90 font-mono font-medium text-neutral-800 border border-neutral-300/70">
            PDP: {pdpAreaCm2} cm²
          </span>
          <span className="text-2xs px-2.5 py-0.5 rounded-md bg-navy-50 text-navy-800 font-mono font-semibold border border-navy-200">
            Scale: 4.8 px/mm
          </span>
        </div>
      </div>

      {/* Main Specimen Surface with SVG Overlay */}
      <div className="relative w-full aspect-[4/3] bg-neutral-950 overflow-hidden flex items-center justify-center select-none group">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover opacity-95 transition-opacity duration-200"
        />

        {/* Interactive Accessible SVG Bounding Boxes */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-auto"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          role="region"
          aria-label="Interactive packaging bounding boxes overlay"
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
                aria-label={`Declaration box: ${box.label}. Statutory Status: ${box.status}. Click or press Enter to inspect details.`}
                className="cursor-pointer outline-hidden transition-all duration-150 focus-visible:outline-2 focus-visible:outline-white"
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
                {/* Bounding Rectangle */}
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

                {/* Box Label Tag Background */}
                <rect
                  x={box.x}
                  y={Math.max(1, box.y - 4.6)}
                  width={Math.min(box.width + 5, 42)}
                  height="4.4"
                  fill={colors.textBg}
                  rx="0.5"
                />
                <text
                  x={box.x + 1}
                  y={Math.max(4.0, box.y - 1.4)}
                  fill={colors.textColor}
                  fontSize="2.4"
                  fontWeight="700"
                  fontFamily="'DM Sans', system-ui, sans-serif"
                >
                  {box.label.length > 24 ? box.label.substring(0, 22) + '...' : box.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Specimen Quick Legend */}
        <div className="absolute bottom-2 left-2 right-2 px-3.5 py-2 rounded-md bg-neutral-950/90 backdrop-blur-md border border-neutral-800 flex items-center justify-between text-2xs text-white shadow-lg">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1.5" title={`${compliantCount} Compliant fields`}>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs ring-1 ring-emerald-300" />
              <span className="text-neutral-200 font-medium">Compliant ({compliantCount})</span>
            </span>
            <span className="flex items-center gap-1.5" title={`${violationCount} Violations detected`}>
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-xs ring-1 ring-rose-300" />
              <span className="text-neutral-200 font-medium">Infraction ({violationCount})</span>
            </span>
            <span className="flex items-center gap-1.5" title={`${warningCount} Warnings`}>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs ring-1 ring-amber-300" />
              <span className="text-neutral-200 font-medium">Caution ({warningCount})</span>
            </span>
            <span className="hidden md:flex items-center gap-1.5" title="Active selection">
              <span className="w-2.5 h-2.5 rounded-full bg-navy-400 ring-1 ring-white" />
              <span className="text-neutral-300 font-medium">Active Box</span>
            </span>
          </div>
          <span className="text-neutral-400 hidden sm:inline font-mono">
            Click any bounding box to inspect clause
          </span>
        </div>
      </div>
    </div>
  );
};
