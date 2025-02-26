import React from 'react';
import { SessionScheduler } from '../components/SessionScheduler';
import { PomodoroTimer } from '../components/PomodoroTimer';
import { SessionStats } from '../components/SessionStats';
import { Button } from '@/components/ui/button';
import { StudySession, createSessionBlock, updateSessionBlock, updateStudySession } from '../utils/supabase';
import { useToast } from 'sonner';

export default function StudySessions() {
  const [currentSession, setCurrentSession] = React.useState<StudySession | null>(null);
  const [currentBlockId, setCurrentBlockId] = React.useState<string | null>(null);
  const { toast } = useToast();

  const handleSessionCreated = (session: StudySession) => {
    setCurrentSession(session);
  };

  const handleStudyComplete = async () => {
    if (!currentSession || !currentBlockId) return;

    try {
      // Mark current block as completed
      await updateSessionBlock(currentBlockId, {
        completed: true,
        end_time: new Date().toISOString(),
      });

      // Check if this was the last block
      const totalBlocks = Math.ceil(
        currentSession.duration_minutes / currentSession.break_duration_minutes
      );
      const currentBlockNumber = Math.ceil(
        (new Date().getTime() - new Date(currentSession.created_at).getTime()) /
          (currentSession.duration_minutes * 60 * 1000)
      );

      if (currentBlockNumber >= totalBlocks) {
        await updateStudySession(currentSession.id, { completed: true });
        toast.success('Congratulations! Study session completed!');
        setCurrentSession(null);
        setCurrentBlockId(null);
      }
    } catch (error) {
      console.error('Failed to update session:', error);
      toast.error('Failed to update session progress');
    }
  };

  const handleBreakStart = async () => {
    if (!currentSession) return;

    try {
      const block = await createSessionBlock({
        session_id: currentSession.id,
        type: 'break',
        start_time: new Date().toISOString(),
        completed: false,
      });
      setCurrentBlockId(block.id);
    } catch (error) {
      console.error('Failed to create break block:', error);
      toast.error('Failed to start break');
    }
  };

  const handleBreakEnd = async () => {
    if (!currentSession || !currentBlockId) return;

    try {
      await updateSessionBlock(currentBlockId, {
        completed: true,
        end_time: new Date().toISOString(),
      });

      // Create new study block
      const block = await createSessionBlock({
        session_id: currentSession.id,
        type: 'study',
        start_time: new Date().toISOString(),
        completed: false,
      });
      setCurrentBlockId(block.id);
    } catch (error) {
      console.error('Failed to end break:', error);
      toast.error('Failed to end break');
    }
  };

  const startNewBlock = async () => {
    if (!currentSession) return;

    try {
      const block = await createSessionBlock({
        session_id: currentSession.id,
        type: 'study',
        start_time: new Date().toISOString(),
        completed: false,
      });
      setCurrentBlockId(block.id);
    } catch (error) {
      console.error('Failed to start new block:', error);
      toast.error('Failed to start study block');
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Study Sessions</h1>

        <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
          {!currentSession ? (
            <div>
              <SessionScheduler onSessionCreated={handleSessionCreated} />
            </div>
          ) : (
            <>
              <div className="space-y-8">
                <PomodoroTimer
                  duration={currentSession.duration_minutes}
                  breakDuration={currentSession.break_duration_minutes}
                  onComplete={handleStudyComplete}
                  onBreakStart={handleBreakStart}
                  onBreakEnd={handleBreakEnd}
                />
                {!currentBlockId && (
                  <Button onClick={startNewBlock} className="w-full">
                    Start Study Block
                  </Button>
                )}
              </div>
              <div>
                <SessionStats session={currentSession} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
