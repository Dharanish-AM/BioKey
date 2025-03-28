import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const FilePieChart = ({ files }) => {
  // Group files by type and calculate total size per category
  const groupedData = files.reduce((acc, file) => {
    acc[file.type] = (acc[file.type] || 0) + file.size;
    return acc;
  }, {});

  // Convert data to an array for the chart
  const chartData = Object.entries(groupedData).map(([type, size]) => ({
    name: type,
    value: size,
  }));

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <PieChart width={400} height={400}>
      <Pie
        data={chartData}
        cx="50%"
        cy="50%"
        outerRadius={120}
        fill="#8884d8"
        dataKey="value"
        label
      >
        {chartData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  );
};

export default FilePieChart;
