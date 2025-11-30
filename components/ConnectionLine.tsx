import React from 'react';
import { Point } from '../types';

interface ConnectionLineProps {
  start: Point;
  end: Point;
  color?: string;
}

export const ConnectionLine: React.FC<ConnectionLineProps> = ({ start, end, color = '#64748b' }) => {
  // Calculate control points for a bezier curve
  const dx = Math.abs(end.x - start.x);
  const controlOffset = Math.max(dx * 0.5, 50);

  const p1 = { x: start.x + controlOffset, y: start.y };
  const p2 = { x: end.x - controlOffset, y: end.y };

  const pathData = `M ${start.x} ${start.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${end.x} ${end.y}`;

  return (
    <path
      d={pathData}
      stroke={color}
      strokeWidth="2"
      fill="none"
      className="pointer-events-none transition-all duration-300"
    />
  );
};