import { useRef, useCallback, useState } from 'react';
import { BatteryProps } from '@/types';
import { getBatteryColor } from '@/constants/activities';

/**
 * Battery Visualization Component (Spec 1.1)
 *
 * - 10 discrete segments (no partial fills)
 * - Clickable: clicking segment N fills segments 1-N
 * - Draggable: touch/mouse drag across segments updates in real-time
 * - Controlled component with value/onChange props
 * - Interactive prop controls whether user can click/drag to change
 */
export function Battery({ value, onChange, interactive = true }: BatteryProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const segmentRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const displayValue = dragValue ?? value;

  const getSegmentFromPoint = useCallback((clientX: number): number | null => {
    for (let i = 0; i < segmentRefs.current.length; i++) {
      const el = segmentRefs.current[i];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (clientX >= rect.left && clientX <= rect.right) {
        return i + 1;
      }
    }
    // If past the edges, clamp to nearest end
    const container = containerRef.current;
    if (!container) return null;
    const containerRect = container.getBoundingClientRect();
    if (clientX < containerRect.left) return 1;
    if (clientX > containerRect.right) return 10;
    return null;
  }, []);

  const handleSegmentClick = (segmentNumber: number) => {
    if (interactive && onChange && !isDragging) {
      onChange(segmentNumber);
    }
  };

  // --- Mouse handlers ---
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!interactive || !onChange) return;
    e.preventDefault();
    setIsDragging(true);
    const seg = getSegmentFromPoint(e.clientX);
    if (seg !== null) {
      setDragValue(seg);
    }
  }, [interactive, onChange, getSegmentFromPoint]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !interactive) return;
    const seg = getSegmentFromPoint(e.clientX);
    if (seg !== null) {
      setDragValue(seg);
    }
  }, [isDragging, interactive, getSegmentFromPoint]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    if (dragValue !== null && onChange) {
      onChange(dragValue);
    }
    setIsDragging(false);
    setDragValue(null);
  }, [isDragging, dragValue, onChange]);

  const handleMouseLeave = useCallback(() => {
    if (!isDragging) return;
    if (dragValue !== null && onChange) {
      onChange(dragValue);
    }
    setIsDragging(false);
    setDragValue(null);
  }, [isDragging, dragValue, onChange]);

  // --- Touch handlers ---
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!interactive || !onChange) return;
    setIsDragging(true);
    const touch = e.touches[0];
    const seg = getSegmentFromPoint(touch.clientX);
    if (seg !== null) {
      setDragValue(seg);
    }
  }, [interactive, onChange, getSegmentFromPoint]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || !interactive) return;
    e.preventDefault(); // Prevent page scroll while dragging
    const touch = e.touches[0];
    const seg = getSegmentFromPoint(touch.clientX);
    if (seg !== null) {
      setDragValue(seg);
    }
  }, [isDragging, interactive, getSegmentFromPoint]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;
    if (dragValue !== null && onChange) {
      onChange(dragValue);
    }
    setIsDragging(false);
    setDragValue(null);
  }, [isDragging, dragValue, onChange]);

  // --- Keyboard handler ---
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!interactive || !onChange) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      onChange(Math.min(10, value + 1));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      onChange(Math.max(1, value - 1));
    }
  }, [interactive, onChange, value]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-0.5">
        {/* Battery body */}
        <div
          ref={containerRef}
          className="flex gap-0.5 p-1.5 bg-gray-200 rounded-md select-none"
          style={{ touchAction: interactive ? 'none' : undefined }}
          role="slider"
          tabIndex={interactive ? 0 : undefined}
          aria-label="Energy level"
          aria-valuemin={1}
          aria-valuemax={10}
          aria-valuenow={displayValue}
          onMouseDown={interactive ? handleMouseDown : undefined}
          onMouseMove={interactive ? handleMouseMove : undefined}
          onMouseUp={interactive ? handleMouseUp : undefined}
          onMouseLeave={interactive ? handleMouseLeave : undefined}
          onTouchStart={interactive ? handleTouchStart : undefined}
          onTouchMove={interactive ? handleTouchMove : undefined}
          onTouchEnd={interactive ? handleTouchEnd : undefined}
          onKeyDown={interactive ? handleKeyDown : undefined}
        >
          {Array.from({ length: 10 }, (_, i) => {
            const segmentNumber = i + 1;
            const isFilled = segmentNumber <= displayValue;
            const color = isFilled ? getBatteryColor(displayValue) : 'transparent';

            return (
              <button
                key={segmentNumber}
                ref={(el) => { segmentRefs.current[i] = el; }}
                type="button"
                onClick={() => handleSegmentClick(segmentNumber)}
                disabled={!interactive}
                tabIndex={-1}
                className={`
                  w-5 h-8 rounded-sm border transition-colors
                  ${isFilled ? 'border-transparent' : 'border-gray-300 bg-white'}
                  ${interactive ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}
                  disabled:cursor-default
                `}
                style={{ backgroundColor: isFilled ? color : undefined }}
                aria-label={`Set energy to ${segmentNumber}`}
              />
            );
          })}
        </div>
        {/* Battery terminal */}
        <div className="w-1.5 h-4 bg-gray-300 rounded-r-sm" />
      </div>

      {/* Energy score display */}
      <span className="text-sm text-gray-600">
        {displayValue}/10
      </span>
    </div>
  );
}
