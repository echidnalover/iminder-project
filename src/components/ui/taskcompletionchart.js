import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface Props {
  data: Array<{
    date: string;
    completed: number;
    total: number;
  }>;
}

export function TaskCompletionChart({ data }: Props) {
  const chartData = data.map(item => ({
    ...item,
    completionRate: (item.completed / item.total) * 100,
  }));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Task Completion Rate</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Completion Rate']}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="completionRate"
                stroke="#8884d8"
                fill="#8884d8"
                name="Completion Rate"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
