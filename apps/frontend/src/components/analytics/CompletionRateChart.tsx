import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface CompletionRateChartProps {
  data: Array<{ date: string; averageScore: number; sessionCount: number }>;
}

export default function CompletionRateChart({ data }: CompletionRateChartProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Score Trends Over Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="averageScore"
            stroke="#10b981"
            strokeWidth={2}
            name="Average Score (%)"
          />
          <Line
            type="monotone"
            dataKey="sessionCount"
            stroke="#f59e0b"
            strokeWidth={2}
            name="Number of Sessions"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
