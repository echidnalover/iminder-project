import React from 'react';
import { TimeFilter, TimeRange } from '../components/TimeFilter';
import { MetricCard } from '../components/MetricCard';
import { StudyProgressChart } from '../components/StudyProgressChart';
import { WorkoutProgressChart } from '../components/WorkoutProgressChart';
import { TaskCompletionChart } from '../components/TaskCompletionChart';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { useRealtimeAnalytics } from '../utils/useRealtimeAnalytics';
import { Brain, Dumbbell, Briefcase, TrendingUp } from 'lucide-react';

export default function Analytics() {
  const [timeRange, setTimeRange] = React.useState<TimeRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date(),
  });
  const { analyticsData, activities, isLoading } = useRealtimeAnalytics(timeRange);

  if (isLoading || !analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Analytics Dashboard</h1>
          <TimeFilter onChange={setTimeRange} />
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <MetricCard
            title="Study Hours"
            value={analyticsData.studyHours.toFixed(1)}
            description="Total hours studied"
            icon={<Brain className="h-4 w-4" />}
          />
          <MetricCard
            title="Study Sessions"
            value={analyticsData.studySessionsCompleted}
            description="Completed sessions"
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <MetricCard
            title="Workouts"
            value={analyticsData.workoutSessionsCompleted}
            description="Completed workouts"
            icon={<Dumbbell className="h-4 w-4" />}
          />
          <MetricCard
            title="Work Tasks"
            value={analyticsData.workTasksCompleted}
            description="Completed tasks"
            icon={<Briefcase className="h-4 w-4" />}
          />
        </div>

        <div className="grid gap-8 grid-cols-1 lg:grid-cols-2 mb-8">
          <StudyProgressChart data={analyticsData.studyProgress} />
          <WorkoutProgressChart data={analyticsData.workoutsByType} />
        </div>

        <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
          <TaskCompletionChart data={analyticsData.taskCompletionRate} />
          <ActivityTimeline activities={activities} />
        </div>
      </div>
    </div>
  );
}
