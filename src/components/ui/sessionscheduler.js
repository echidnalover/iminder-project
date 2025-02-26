import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from 'sonner';
import { createStudySession, StudySession } from '../utils/supabase';

interface Props {
  onSessionCreated: (session: StudySession) => void;
}

export function SessionScheduler({ onSessionCreated }: Props) {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [duration, setDuration] = React.useState(25);
  const [breakDuration, setBreakDuration] = React.useState(5);
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title) {
      toast.error('Please enter a session title');
      return;
    }

    try {
      setIsLoading(true);
      const session = await createStudySession({
        title,
        description,
        duration_minutes: duration,
        break_duration_minutes: breakDuration,
      });
      
      onSessionCreated(session);
      toast.success('Study session created!');
      
      // Reset form
      setTitle('');
      setDescription('');
      setDuration(25);
      setBreakDuration(5);
    } catch (error) {
      console.error('Failed to create session:', error);
      toast.error('Failed to create study session');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule Study Session</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Session Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Math Chapter 5 Review"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What do you plan to cover?"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Study Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min={1}
                max={120}
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="breakDuration">Break Duration (minutes)</Label>
              <Input
                id="breakDuration"
                type="number"
                min={1}
                max={30}
                value={breakDuration}
                onChange={(e) => setBreakDuration(parseInt(e.target.value))}
                disabled={isLoading}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Session'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
