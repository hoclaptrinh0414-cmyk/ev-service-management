import React, { useMemo } from "react";

// Sparkline with subtle gradient fill (no external deps)
const MiniAreaChart = ({
  data = [],
  color = "#000",
  height = 60,
  width = 180,
  showDots = false,
  strokeWidth = 2,
}) => {
  const values = data && data.length ? data : [5, 8, 6, 10, 12, 9, 14];
  const padding = 5;
  const maxVal = Math.max(...values) || 1;

  const { points, polygonPoints, coords } = useMemo(() => {
    const cs = values.map((v, i) => {
      const x = (i / (values.length - 1)) * (width - padding * 2) + padding;
      const y = height - (v / maxVal) * (height - padding * 2) - padding;
      return { x, y };
    });
    const pts = cs.map((p) => `${p.x},${p.y}`).join(" ");
    const baselineY = height - padding;
    const startX = cs[0]?.x ?? padding;
    const endX = cs[cs.length - 1]?.x ?? width - padding;
    const poly = `${startX},${baselineY} ${pts} ${endX},${baselineY}`;
    return { points: pts, polygonPoints: poly, coords: cs };
  }, [values, width, height, maxVal]);

  const gradId = useMemo(
    () => `grad_${Math.random().toString(36).slice(2)}`,
    []
  );

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={polygonPoints} fill={`url(#${gradId})`} />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        points={points}
      />
      {showDots &&
        coords.map((p, idx) => (
          <circle key={idx} cx={p.x} cy={p.y} r={2} fill={color} />
        ))}
    </svg>
  );
};

export default MiniAreaChart;
