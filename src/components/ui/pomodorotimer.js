import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from 'sonner';
import { Play, Pause, RotateCcw, Forward } from 'lucide-react';

interface Props {
  duration: number;
  breakDuration: number;
  onComplete: () => void;
  onBreakStart: () => void;
  onBreakEnd: () => void;
}

type TimerState = 'idle' | 'running' | 'paused' | 'break';

export function PomodoroTimer({
  duration,
  breakDuration,
  onComplete,
  onBreakStart,
  onBreakEnd,
}: Props) {
  const [timeLeft, setTimeLeft] = React.useState(duration * 60);
  const [state, setState] = React.useState<TimerState>('idle');
  const [isBreak, setIsBreak] = React.useState(false);
  const intervalRef = React.useRef<number>();
  const { toast } = useToast();

  const progress = React.useMemo(() => {
    const total = isBreak ? breakDuration * 60 : duration * 60;
    return ((total - timeLeft) / total) * 100;
  }, [timeLeft, duration, breakDuration, isBreak]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    setState('running');
    intervalRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          if (isBreak) {
            onBreakEnd();
            setIsBreak(false);
            setState('idle');
            setTimeLeft(duration * 60);
            toast.success('Break completed! Ready for next session?');
          } else {
            onComplete();
            setIsBreak(true);
            setState('break');
            setTimeLeft(breakDuration * 60);
            onBreakStart();
            toast.success('Study session completed! Time for a break.');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseTimer = () => {
    setState('paused');
    clearInterval(intervalRef.current);
  };

  const resetTimer = () => {
    setState('idle');
    clearInterval(intervalRef.current);
    setTimeLeft(duration * 60);
    setIsBreak(false);
  };

  const skipBreak = () => {
    if (isBreak) {
      onBreakEnd();
      setIsBreak(false);
      setState('idle');
      setTimeLeft(duration * 60);
      toast.success('Break skipped!');
    }
  };

  React.useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{isBreak ? 'Break Time' : 'Study Session'}</span>
          <span className="text-2xl font-mono">{formatTime(timeLeft)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Progress value={progress} className="h-2" />
          
          <div className="flex justify-center space-x-2">
            {state === 'idle' || state === 'paused' ? (
              <Button onClick={startTimer} size="icon">
                <Play className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={pauseTimer} size="icon">
                <Pause className="h-4 w-4" />
              </Button>
            )}
            
            <Button onClick={resetTimer} size="icon" variant="outline">
              <RotateCcw className="h-4 w-4" />
            </Button>

            {isBreak && (
              <Button onClick={skipBreak} size="icon" variant="outline">
                <Forward className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="text-center text-sm text-muted-foreground">
            {state === 'idle' && 'Ready to start'}
            {state === 'running' && !isBreak && 'Focus time!'}
            {state === 'running' && isBreak && 'Take a break'}
            {state === 'paused' && 'Timer paused'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
