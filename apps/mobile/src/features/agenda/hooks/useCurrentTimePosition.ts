import { useState, useEffect } from 'react';
import { calculateCurrentTimePosition } from '../utils/timelineHelpers';

export interface CurrentTimePosition {
  offsetY: number;
  hour: number;
  minute: number;
}

export const useCurrentTimePosition = (
  hours: Array<{ hour: number }>,
  hourSlotHeight: number
): CurrentTimePosition | null => {
  const [position, setPosition] = useState<CurrentTimePosition | null>(() =>
    calculateCurrentTimePosition(hours, hourSlotHeight)
  );

  useEffect(() => {
    const updatePosition = () => {
      const newPosition = calculateCurrentTimePosition(hours, hourSlotHeight);
      setPosition(newPosition);
    };

    updatePosition();

    const intervalId = setInterval(updatePosition, 60000);

    return () => clearInterval(intervalId);
  }, [hours, hourSlotHeight]);

  return position;
};
