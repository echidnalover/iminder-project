import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface Props {
  data: Array<{
    type: string;
    count: number;
  }>;
}

export function WorkoutProgressChart({ data }: Props) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Workouts by Type</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip
                formatter={(value: number) => [`${value} sessions`, 'Count']}
              />
              <Legend />
              <Bar
                dataKey="count"
                fill="#82ca9d"
                name="Sessions"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
