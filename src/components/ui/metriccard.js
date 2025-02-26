import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';

interface Props {
  title: string;
  value: string | number;
  change?: number;
  description?: string;
  icon?: React.ReactNode;
}

export function MetricCard({ title, value, change, description, icon }: Props) {
  const isPositiveChange = change && change > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(change !== undefined || description) && (
          <p className="text-xs text-muted-foreground">
            {change !== undefined && (
              <span
                className={`inline-flex items-center ${isPositiveChange ? 'text-green-600' : 'text-red-600'}`}
              >
                {isPositiveChange ? (
                  <ArrowUpIcon className="mr-1 h-4 w-4" />
                ) : (
                  <ArrowDownIcon className="mr-1 h-4 w-4" />
                )}
                {Math.abs(change)}%
              </span>
            )}
            {description && (
              <span className="ml-1">{description}</span>
            )}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
