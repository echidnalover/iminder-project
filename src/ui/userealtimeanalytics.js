import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { TimeRange } from '../components/TimeFilter';
import { fetchAnalyticsData, fetchRecentActivities, AnalyticsData, Activity } from './analytics';

export function useRealtimeAnalytics(timeRange: TimeRange) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [data, recentActivities] = await Promise.all([
        fetchAnalyticsData(timeRange),
        fetchRecentActivities(timeRange),
      ]);
      setAnalyticsData(data);
      setActivities(recentActivities);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Subscribe to changes in study sessions
    const studySubscription = supabase
      .channel('study_sessions_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'study_sessions' },
        fetchData
      )
      .subscribe();

    // Subscribe to changes in workout sessions
    const workoutSubscription = supabase
      .channel('workout_sessions_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'workout_sessions' },
        fetchData
      )
      .subscribe();

    // Subscribe to changes in work tasks
    const workTaskSubscription = supabase
      .channel('work_tasks_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'work_tasks' },
        fetchData
      )
      .subscribe();

    return () => {
      studySubscription.unsubscribe();
      workoutSubscription.unsubscribe();
      workTaskSubscription.unsubscribe();
    };
  }, [timeRange]);

  return { analyticsData, activities, isLoading };
}
