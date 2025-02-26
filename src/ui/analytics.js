import { supabase } from './supabase';
import { TimeRange } from '../components/TimeFilter';

export interface AnalyticsData {
  studyHours: number;
  studySessionsCompleted: number;
  workoutSessionsCompleted: number;
  workTasksCompleted: number;
  studyProgress: Array<{
    date: string;
    hours: number;
  }>;
  workoutsByType: Array<{
    type: string;
    count: number;
  }>;
  taskCompletionRate: Array<{
    date: string;
    completed: number;
    total: number;
  }>;
}

export interface Activity {
  id: string;
  type: 'study' | 'workout' | 'work';
  title: string;
  timestamp: string;
  description?: string;
}

export async function fetchAnalyticsData(timeRange: TimeRange): Promise<AnalyticsData> {
  const { from, to } = timeRange;

  // Fetch study sessions data
  const { data: studySessions } = await supabase
    .from('study_sessions')
    .select('*')
    .gte('created_at', from.toISOString())
    .lte('created_at', to.toISOString());

  // Fetch workout sessions data
  const { data: workoutSessions } = await supabase
    .from('workout_sessions')
    .select('*')
    .gte('created_at', from.toISOString())
    .lte('created_at', to.toISOString());

  // Fetch work tasks data
  const { data: workTasks } = await supabase
    .from('work_tasks')
    .select('*')
    .gte('created_at', from.toISOString())
    .lte('created_at', to.toISOString());

  // Calculate study hours
  const studyHours = studySessions
    ? studySessions.reduce((total, session) => total + (session.duration_minutes / 60), 0)
    : 0;

  // Calculate completed sessions/tasks
  const studySessionsCompleted = studySessions
    ? studySessions.filter(session => session.completed).length
    : 0;

  const workoutSessionsCompleted = workoutSessions
    ? workoutSessions.filter(session => session.completed).length
    : 0;

  const workTasksCompleted = workTasks
    ? workTasks.filter(task => task.status === 'done').length
    : 0;

  // Calculate study progress over time
  const studyProgress = studySessions
    ? groupByDate(studySessions, 'created_at', session => session.duration_minutes / 60)
    : [];

  // Calculate workouts by type
  const workoutsByType = workoutSessions
    ? groupByType(workoutSessions, 'type')
    : [];

  // Calculate task completion rate over time
  const taskCompletionRate = workTasks
    ? calculateTaskCompletionRate(workTasks)
    : [];

  return {
    studyHours,
    studySessionsCompleted,
    workoutSessionsCompleted,
    workTasksCompleted,
    studyProgress,
    workoutsByType,
    taskCompletionRate,
  };
}

export async function fetchRecentActivities(timeRange: TimeRange): Promise<Activity[]> {
  const { from, to } = timeRange;
  const activities: Activity[] = [];

  // Fetch study sessions
  const { data: studySessions } = await supabase
    .from('study_sessions')
    .select('*')
    .gte('created_at', from.toISOString())
    .lte('created_at', to.toISOString())
    .order('created_at', { ascending: false });

  if (studySessions) {
    activities.push(
      ...studySessions.map(session => ({
        id: session.id,
        type: 'study' as const,
        title: session.title,
        timestamp: session.created_at,
        description: session.description,
      }))
    );
  }

  // Fetch workout sessions
  const { data: workoutSessions } = await supabase
    .from('workout_sessions')
    .select('*')
    .gte('created_at', from.toISOString())
    .lte('created_at', to.toISOString())
    .order('created_at', { ascending: false });

  if (workoutSessions) {
    activities.push(
      ...workoutSessions.map(session => ({
        id: session.id,
        type: 'workout' as const,
        title: session.title,
        timestamp: session.created_at,
        description: session.description,
      }))
    );
  }

  // Fetch work tasks
  const { data: workTasks } = await supabase
    .from('work_tasks')
    .select('*')
    .gte('created_at', from.toISOString())
    .lte('created_at', to.toISOString())
    .order('created_at', { ascending: false });

  if (workTasks) {
    activities.push(
      ...workTasks.map(task => ({
        id: task.id,
        type: 'work' as const,
        title: task.title,
        timestamp: task.created_at,
        description: task.description,
      }))
    );
  }

  // Sort all activities by timestamp
  return activities.sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
}

function groupByDate<T>(
  data: T[],
  dateField: keyof T,
  valueFunc: (item: T) => number
) {
  const grouped = data.reduce((acc, item) => {
    const date = new Date(item[dateField] as string).toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + valueFunc(item);
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(grouped).map(([date, hours]) => ({
    date,
    hours,
  }));
}

function groupByType<T>(data: T[], typeField: keyof T) {
  const grouped = data.reduce((acc, item) => {
    const type = item[typeField] as string;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(grouped).map(([type, count]) => ({
    type,
    count,
  }));
}

function calculateTaskCompletionRate(tasks: any[]) {
  const grouped = tasks.reduce((acc, task) => {
    const date = new Date(task.created_at).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = { completed: 0, total: 0 };
    }
    acc[date].total += 1;
    if (task.status === 'done') {
      acc[date].completed += 1;
    }
    return acc;
  }, {} as Record<string, { completed: number; total: number }>);

  return Object.entries(grouped).map(([date, { completed, total }]) => ({
    date,
    completed,
    total,
  }));
}
