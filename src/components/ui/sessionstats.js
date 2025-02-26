import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StudySession, SessionBlock, listSessionBlocks } from '../utils/supabase';

interface Props {
  session: StudySession;
}

export function SessionStats({ session }: Props) {
  const [blocks, setBlocks] = React.useState<SessionBlock[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const data = await listSessionBlocks(session.id);
        setBlocks(data);
      } catch (error) {
        console.error('Failed to fetch session blocks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlocks();
  }, [session.id]);

  const stats = React.useMemo(() => {
    const completedStudyBlocks = blocks.filter(
      (block) => block.type === 'study' && block.completed
    ).length;
    const totalStudyBlocks = blocks.filter((block) => block.type === 'study').length;
    const completedBreakBlocks = blocks.filter(
      (block) => block.type === 'break' && block.completed
    ).length;

    const totalStudyTime = blocks
      .filter((block) => block.type === 'study' && block.completed)
      .reduce((total, block) => {
        if (block.start_time && block.end_time) {
          const start = new Date(block.start_time);
          const end = new Date(block.end_time);
          return total + (end.getTime() - start.getTime()) / 1000 / 60;
        }
        return total;
      }, 0);

    return {
      completedStudyBlocks,
      totalStudyBlocks,
      completedBreakBlocks,
      totalStudyTime: Math.round(totalStudyTime),
    };
  }, [blocks]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center">Loading session stats...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-2xl font-bold">
              {stats.completedStudyBlocks}/{stats.totalStudyBlocks}
            </p>
            <p className="text-sm text-muted-foreground">Study Blocks Completed</p>
          </div>

          <div className="space-y-1">
            <p className="text-2xl font-bold">{stats.completedBreakBlocks}</p>
            <p className="text-sm text-muted-foreground">Breaks Taken</p>
          </div>

          <div className="space-y-1">
            <p className="text-2xl font-bold">{stats.totalStudyTime}</p>
            <p className="text-sm text-muted-foreground">Total Minutes Studied</p>
          </div>

          <div className="space-y-1">
            <p className="text-2xl font-bold">
              {Math.round((stats.completedStudyBlocks / stats.totalStudyBlocks) * 100) || 0}%
            </p>
            <p className="text-sm text-muted-foreground">Session Progress</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
