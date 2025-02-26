import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, Dumbbell, Briefcase } from 'lucide-react';

type Activity = {
  id: string;
  type: 'study' | 'workout' | 'work';
  title: string;
  timestamp: string;
  description?: string;
};

interface Props {
  activities: Activity[];
}

export function ActivityTimeline({ activities }: Props) {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'study':
        return <Brain className="h-4 w-4" />;
      case 'workout':
        return <Dumbbell className="h-4 w-4" />;
      case 'work':
        return <Briefcase className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'study':
        return 'bg-blue-500';
      case 'workout':
        return 'bg-green-500';
      case 'work':
        return 'bg-purple-500';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-8">
            {activities.map((activity) => (
              <div key={activity.id} className="flex">
                <div className="flex flex-col items-center mr-4">
                  <div className={`rounded-full p-2 ${getActivityColor(activity.type)} text-white`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="h-full w-px bg-border mt-2" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <time className="text-sm text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleString()}
                    </time>
                  </div>
                  {activity.description && (
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
