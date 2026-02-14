import { BatteryProps } from '@/types';
import { getBatteryColor } from '@/constants/activities';

/**
 * Battery Visualization Component (Spec 1.1)
 *
 * - 10 discrete segments (no partial fills)
 * - Clickable: clicking segment N fills segments 1-N
 * - Controlled component with value/onChange props
 * - Interactive prop controls whether user can click to change
 */
export function Battery({ value, onChange, interactive = true }: BatteryProps) {
  const handleSegmentClick = (segmentNumber: number) => {
    if (interactive && onChange) {
      onChange(segmentNumber);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-0.5">
        {/* Battery body */}
        <div
          className="flex gap-0.5 p-1.5 bg-gray-200 rounded-md"
          role="slider"
          aria-label="Energy level"
          aria-valuemin={1}
          aria-valuemax={10}
          aria-valuenow={value}
        >
          {Array.from({ length: 10 }, (_, i) => {
            const segmentNumber = i + 1;
            const isFilled = segmentNumber <= value;
            const color = isFilled ? getBatteryColor(value) : 'transparent';

            return (
              <button
                key={segmentNumber}
                type="button"
                onClick={() => handleSegmentClick(segmentNumber)}
                disabled={!interactive}
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
        {value}/10
      </span>
    </div>
  );
}
