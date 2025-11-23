// biểu đồ donut -> thể hiện tỷ lệ 


import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const DonutChart = ({
  data = [],
  colors = ["#0d6efd", "#198754", "#6f42c1", "#dc3545"],
  height = 200,
  innerRadius = 60,
  outerRadius = 80,
}) => {
  const values = data.length
    ? data
    : [
        { name: "Maintenance", value: 35 },
        { name: "Repair", value: 25 },
        { name: "Inspection", value: 20 },
        { name: "Other", value: 20 },
      ];
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={values}
            dataKey="value"
            nameKey="name"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
          >
            {values.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Pie>
          <Tooltip formatter={(v, n) => [v, n]} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DonutChart;
