import React from "react";
import {
  AreaChart,
  Area,
  Tooltip,
  ResponsiveContainer,
  defs,
  linearGradient,
  XAxis,
  YAxis,
} from "recharts";

const TrendAreaChart = ({ data = [], color = "#0d6efd", height = 180 }) => {
  const values = data.length
    ? data
    : [5, 8, 6, 10, 12, 9, 14, 13, 15, 12, 16, 18].map((y, i) => ({
        x: i + 1,
        y,
      }));
  const id = `grad_${Math.random().toString(36).slice(2)}`;
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <AreaChart
          data={values}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="x" hide />
          <YAxis hide />
          <Tooltip cursor={{ stroke: "#eee" }} formatter={(v) => [v, ""]} />
          <Area
            type="monotone"
            dataKey="y"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${id})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendAreaChart;
