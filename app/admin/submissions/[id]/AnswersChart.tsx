"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface ChartEntry {
  label: string;
  value: number;
  unit: string;
}

export function AnswersChart({ data }: { data: ChartEntry[] }) {
  if (data.length === 0) return null;

  return (
    <div className="rounded-card bg-midnight p-6 shadow-card space-y-3">
      <h2 className="font-display text-lg text-cloud">Numeriske svar</h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
          <XAxis
            dataKey="label"
            tick={{ fill: "#8a8273", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              background: "#efe7d6",
              border: "1px solid #ddd0ba",
              borderRadius: "0.5rem",
              fontSize: 12,
            }}
            formatter={(value: number, _name: string, props) => [
              `${value.toLocaleString("nb-NO")} ${props.payload.unit}`,
              props.payload.label,
            ]}
            labelFormatter={() => ""}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={56}>
            {data.map((_entry, index) => (
              <Cell
                key={index}
                fill={index % 2 === 0 ? "#142a4b" : "#0c8ba0"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-muted text-center">
        Råverdier — aksene er ikke sammenlignbare på tvers av kategorier
      </p>
    </div>
  );
}
