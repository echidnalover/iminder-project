import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key'
);

export interface StudySession {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  material_id?: string;
  duration_minutes: number;
  break_duration_minutes: number;
  completed: boolean;
  created_at: string;
}

export interface SessionBlock {
  id: string;
  session_id: string;
  start_time: string;
  end_time?: string;
  type: 'study' | 'break';
  completed: boolean;
  notes?: string;
}

export const studySessionsTable = 'study_sessions';
export const sessionBlocksTable = 'session_blocks';

export async function createStudySession(session: Omit<StudySession, 'id' | 'user_id' | 'created_at' | 'completed'>) {
  const { data, error } = await supabase
    .from(studySessionsTable)
    .insert([
      {
        ...session,
        completed: false,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateStudySession(id: string, updates: Partial<StudySession>) {
  const { data, error } = await supabase
    .from(studySessionsTable)
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getStudySession(id: string) {
  const { data, error } = await supabase
    .from(studySessionsTable)
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function listStudySessions() {
  const { data, error } = await supabase
    .from(studySessionsTable)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createSessionBlock(block: Omit<SessionBlock, 'id'>) {
  const { data, error } = await supabase
    .from(sessionBlocksTable)
    .insert([block])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSessionBlock(id: string, updates: Partial<SessionBlock>) {
  const { data, error } = await supabase
    .from(sessionBlocksTable)
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function listSessionBlocks(sessionId: string) {
  const { data, error } = await supabase
    .from(sessionBlocksTable)
    .select('*')
    .eq('session_id', sessionId)
    .order('start_time', { ascending: true });

  if (error) throw error;
  return data;
}
