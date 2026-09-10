import React, { useState } from 'react';
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
        stroke: '#1B5E7B',
        fill: 'rgba(27, 94, 123, 0.25)',
        textBg: '#1B5E7B',
        textColor: '#FFFFFF',
      };
    }
    switch (status) {
      case 'violation':
        return {
          stroke: '#C0392B',
          fill: 'rgba(192, 57, 43, 0.18)',
          textBg: '#C0392B',
          textColor: '#FFFFFF',
        };
      case 'warning':
        return {
          stroke: '#F39C12',
          fill: 'rgba(243, 156, 18, 0.20)',
          textBg: '#F39C12',
          textColor: '#FFFFFF',
        };
      case 'compliant':
      default:
        return {
          stroke: '#27AE60',
          fill: 'rgba(39, 174, 96, 0.15)',
          textBg: '#27AE60',
          textColor: '#FFFFFF',
        };
    }
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-[8px] overflow-hidden flex flex-col">
      {/* Visual Header */}
      <div className="px-4 py-3 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between text-xs">
        <div className="font-semibold text-neutral-800 font-heading truncate">{title}</div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] px-2 py-0.5 rounded bg-neutral-200/80 font-mono text-neutral-700">
            PDP: {pdpAreaCm2} cm²
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded bg-primary-light text-primary font-mono font-medium">
            Scale: 4.8 px/mm
          </span>
        </div>
      </div>

      {/* Main Image Surface with SVG Overlay */}
      <div className="relative w-full aspect-[4/3] bg-neutral-900/90 overflow-hidden flex items-center justify-center select-none">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover opacity-90"
        />

        {/* Interactive SVG Bounding Boxes */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-auto"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {boxes.map((box) => {
            const isSelected = activeBoxId === box.id || hoveredBoxId === box.id;
            const colors = getBoxColors(box.status, isSelected);

            return (
              <g 
                key={box.id} 
                className="cursor-pointer transition-all duration-150"
                onClick={() => onBoxClick && onBoxClick(box.id, box.fieldId)}
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
                  strokeWidth={isSelected ? 1.5 : 0.8}
                  rx="1"
                  className="transition-all"
                />

                {/* Box Label Tag */}
                <rect
                  x={box.x}
                  y={Math.max(1, box.y - 4.5)}
                  width={Math.min(box.width + 4, 38)}
                  height="4.2"
                  fill={colors.textBg}
                  rx="0.5"
                />
                <text
                  x={box.x + 1}
                  y={Math.max(3.8, box.y - 1.5)}
                  fill={colors.textColor}
                  fontSize="2.4"
                  fontWeight="600"
                  fontFamily="'DM Sans', sans-serif"
                >
                  {box.label.length > 24 ? box.label.substring(0, 22) + '...' : box.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend Overlay at Bottom */}
        <div className="absolute bottom-2 left-2 right-2 px-3 py-1.5 rounded-[6px] bg-neutral-900/85 backdrop-blur-none border border-neutral-700/80 flex items-center justify-between text-[11px] text-white">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-success"></span>
              <span className="text-neutral-300">Compliant</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-violation"></span>
              <span className="text-neutral-300">Violation</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-warning"></span>
              <span className="text-neutral-300">Warning</span>
            </span>
          </div>
          <span className="text-neutral-400 hidden sm:inline">Click box to inspect declaration</span>
        </div>
      </div>
    </div>
  );
};
