import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { StudySession } from '../types';
import { SUPABASE_CONFIG } from '../config/supabaseConfig';

let supabaseClient: SupabaseClient | null = null;
let currentUrl = '';
let currentKey = '';
let realtimeChannel: RealtimeChannel | null = null;

// Primary table used by the user's database is 'sessions'
const PRIMARY_TABLE = 'sessions';
const FALLBACK_TABLE = 'study_sessions';

export function getSupabaseClient(url?: string, anonKey?: string): SupabaseClient | null {
  const targetUrl =
    url ||
    currentUrl ||
    (import.meta.env.VITE_SUPABASE_URL as string) ||
    SUPABASE_CONFIG.url ||
    localStorage.getItem('fkerni_supabase_url') ||
    '';
  const targetKey =
    anonKey ||
    currentKey ||
    (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
    SUPABASE_CONFIG.anonKey ||
    localStorage.getItem('fkerni_supabase_key') ||
    '';

  if (!targetUrl || !targetKey) {
    return null;
  }

  if (!supabaseClient || currentUrl !== targetUrl || currentKey !== targetKey) {
    try {
      supabaseClient = createClient(targetUrl, targetKey);
      currentUrl = targetUrl;
      currentKey = targetKey;
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      supabaseClient = null;
    }
  }

  return supabaseClient;
}

export function saveSupabaseCredentials(url: string, anonKey: string): void {
  localStorage.setItem('fkerni_supabase_url', url.trim());
  localStorage.setItem('fkerni_supabase_key', anonKey.trim());
  currentUrl = url.trim();
  currentKey = anonKey.trim();
  if (url && anonKey) {
    try {
      supabaseClient = createClient(url.trim(), anonKey.trim());
    } catch {
      supabaseClient = null;
    }
  } else {
    supabaseClient = null;
  }
}

export async function testSupabaseConnection(url?: string, anonKey?: string): Promise<{ success: boolean; message: string }> {
  try {
    const client = getSupabaseClient(url, anonKey);
    if (!client) {
      return { success: false, message: 'URL ou Clé API manquante.' };
    }

    // Try querying primary 'sessions' table
    const { error: primaryError } = await client.from(PRIMARY_TABLE).select('id').limit(1);
    if (!primaryError) {
      return { success: true, message: 'Connexion établie avec succès avec votre base Supabase (table: sessions) !' };
    }

    // Try fallback 'study_sessions' table
    const { error: fallbackError } = await client.from(FALLBACK_TABLE).select('id').limit(1);
    if (!fallbackError) {
      return { success: true, message: 'Connexion établie avec succès avec votre base Supabase (table: study_sessions) !' };
    }

    return { success: false, message: primaryError?.message || fallbackError?.message || 'Erreur inconnue de connexion' };
  } catch (err) {
    return { success: false, message: (err as Error).message || 'Erreur inconnue de connexion' };
  }
}

function mapRowToSession(item: any): StudySession {
  return {
    id: String(item.id),
    day: item.day,
    title: item.title || `Étude à ${item.start_time || item.startTime}`,
    subject: item.subject || '',
    startTime: item.start_time || item.startTime || '08:00',
    endTime: item.end_time || item.endTime || '10:00',
    room: item.room || '',
    notes: item.notes || '',
    color: item.color || 'blue',
    completed: Boolean(item.completed),
    created_at: item.created_at
  };
}

export async function fetchSessionsFromSupabase(): Promise<StudySession[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    // 1. Try PRIMARY_TABLE ('sessions')
    let { data, error } = await client
      .from(PRIMARY_TABLE)
      .select('*')
      .order('start_time', { ascending: true });

    // 2. If 'sessions' not found, fallback to 'study_sessions'
    if (error && error.code === 'PGRST205') {
      const fallback = await client
        .from(FALLBACK_TABLE)
        .select('*')
        .order('start_time', { ascending: true });
      data = fallback.data;
      error = fallback.error;
    }

    if (error) {
      console.warn('Supabase fetch error:', error);
      return null;
    }

    if (!data) return [];

    return data.map(mapRowToSession);
  } catch (err) {
    console.warn('Error querying Supabase:', err);
    return null;
  }
}

export async function syncSessionToSupabase(session: StudySession): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  const row = {
    id: session.id,
    day: session.day,
    title: session.title,
    subject: session.subject,
    start_time: session.startTime,
    end_time: session.endTime,
    notes: session.notes || '',
    color: session.color,
    completed: session.completed || false,
    updated_at: new Date().toISOString()
  };

  try {
    // Try primary table first
    const { error } = await client.from(PRIMARY_TABLE).upsert(row);
    if (!error) return true;

    // Try fallback table
    if (error.code === 'PGRST205') {
      const fallback = await client.from(FALLBACK_TABLE).upsert(row);
      return !fallback.error;
    }

    console.error('Supabase upsert error:', error);
    return false;
  } catch (err) {
    console.error('Supabase upsert exception:', err);
    return false;
  }
}

export async function deleteSessionFromSupabase(sessionId: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from(PRIMARY_TABLE).delete().eq('id', sessionId);
    if (!error) return true;

    if (error.code === 'PGRST205') {
      const fallback = await client.from(FALLBACK_TABLE).delete().eq('id', sessionId);
      return !fallback.error;
    }

    console.error('Supabase delete error:', error);
    return false;
  } catch (err) {
    console.error('Supabase delete exception:', err);
    return false;
  }
}

/**
 * Realtime subscription to live session changes
 * Automatically refetches and updates sessions when any changes occur in Supabase
 */
export function subscribeToLiveSessions(
  onDataChange: (sessions: StudySession[]) => void
): () => void {
  const client = getSupabaseClient();
  if (!client) return () => {};

  if (realtimeChannel) {
    realtimeChannel.unsubscribe();
    realtimeChannel = null;
  }

  const handleRefresh = async () => {
    const updated = await fetchSessionsFromSupabase();
    if (updated && updated.length > 0) {
      onDataChange(updated);
    }
  };

  try {
    realtimeChannel = client
      .channel('public:sessions-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: PRIMARY_TABLE },
        () => {
          handleRefresh();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: FALLBACK_TABLE },
        () => {
          handleRefresh();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('⚡ Supabase Realtime connected for live study sessions!');
        }
      });
  } catch (err) {
    console.warn('Could not establish Supabase realtime subscription:', err);
  }

  return () => {
    if (realtimeChannel) {
      realtimeChannel.unsubscribe();
      realtimeChannel = null;
    }
  };
}
