import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { StudySession } from '../types';
import { SUPABASE_CONFIG } from '../config/supabaseConfig';

let supabaseClient: SupabaseClient | null = null;
let currentUrl = '';
let currentKey = '';
let realtimeChannel: RealtimeChannel | null = null;
let quotesRealtimeChannel: RealtimeChannel | null = null;

// Primary table used by the user's database is 'sessions'
const PRIMARY_TABLE = 'sessions';
const FALLBACK_TABLE = 'study_sessions';

// Funny quotes tables
const QUOTES_PRIMARY_TABLE = 'funny_quotes';
const QUOTES_FALLBACK_TABLE = 'quotes';

export interface SupabaseQuote {
  id?: string | number;
  text: string;
  emoji?: string;
  is_active?: boolean;
  is_pinned?: boolean; // When true, always displays this quote on open!
  priority?: number;
  created_at?: string;
}

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

/**
 * =======================================================================
 *  FUNNY QUOTES / WORDS MANAGEMENT (SUPABASE + OFFLINE CACHE)
 * =======================================================================
 */

const INITIAL_OFFLINE_QUOTES: SupabaseQuote[] = [
  { id: 1, text: "m3ndkch etude taw ? myselch 9oum we a9ra chwaya fel dar", emoji: "⏰", is_active: true, is_pinned: false },
  { id: 2, text: "Sa7tek aham men ay 7aja o5ra dima tfaker okk ?", emoji: "💗", is_active: true, is_pinned: false },
  { id: 3, text: "El 9raya 3morha makent b7r9an l3sab mrigl ?", emoji: "📔", is_active: true, is_pinned: false },
  { id: 4, text: "w9t t7es ro7k t3ebt a3ml pause s8yra makench rani chn5othk", emoji: "😠", is_active: true, is_pinned: false },
  { id: 5, text: "Aya el 7amdelah 3lik ki tfakert w7dek w 7allit", emoji: "🎉", is_active: true, is_pinned: false },
  { id: 6, text: "Chouf chkoun jeeeeee hani seket ena wakahw", emoji: "🥱", is_active: true, is_pinned: false },
  { id: 7, text: "9otli mela 5ayfa mel bac ? hhhhh ena n2kdlk eli houwa el 3ks", emoji: "😁", is_active: true, is_pinned: false },
  { id: 8, text: "Jme3t el Bac sience wouuh wouuuh ", emoji: "😩", is_active: true, is_pinned: false },
  { id: 9, text: "Temchich tnsa el w9t ranii walllllh", emoji: "🔪", is_active: true, is_pinned: false },
  { id: 10, text: "N7ebk tbiba 3ad maw ? allh 8aleb n7eb ndewi blech", emoji: "😛", is_active: true, is_pinned: false },
  { id: 11, text: "Taw enti tkrahni 9adech men 1 l 10 ?", emoji: "🙂", is_active: true, is_pinned: false },
  { id: 12, text: "Chah Chah toul 3lina akther 3ad Netw7ch rani", emoji: "🥺", is_active: true, is_pinned: false },
  { id: 13, text: "mar7be beli takrahni", emoji: "🙋‍♂️", is_active: true, is_pinned: false }
];

export function getCachedQuotes(): SupabaseQuote[] {
  const cached = localStorage.getItem('fkerni_cached_quotes');
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {
      // fallback
    }
  }
  return INITIAL_OFFLINE_QUOTES;
}

export function selectQuoteToDisplay(quotes: SupabaseQuote[]): { text: string; emoji: string } {
  if (!quotes || quotes.length === 0) {
    return { text: "m3ndkch etude taw ? myselch 9oum we a9ra chwaya fel dar", emoji: "⏰" };
  }

  // 1. If there's a pinned quote (is_pinned === true), always display it!
  const pinned = quotes.find((q) => q.is_pinned === true && q.is_active !== false);
  if (pinned) {
    return { text: pinned.text, emoji: pinned.emoji || '🔥' };
  }

  // 2. Otherwise pick randomly among active quotes
  const activeQuotes = quotes.filter((q) => q.is_active !== false);
  const pool = activeQuotes.length > 0 ? activeQuotes : quotes;
  const picked = pool[Math.floor(Math.random() * pool.length)];

  return { text: picked.text, emoji: picked.emoji || '🔥' };
}

export async function fetchQuotesFromSupabase(): Promise<SupabaseQuote[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    // 1. Try QUOTES_PRIMARY_TABLE ('funny_quotes')
    let { data, error } = await client
      .from(QUOTES_PRIMARY_TABLE)
      .select('*')
      .order('id', { ascending: true });

    // 2. Fallback to 'quotes'
    if (error && error.code === 'PGRST205') {
      const fallback = await client
        .from(QUOTES_FALLBACK_TABLE)
        .select('*')
        .order('id', { ascending: true });
      data = fallback.data;
      error = fallback.error;
    }

    if (error) {
      console.warn('Could not fetch quotes from Supabase (using offline cache):', error.message);
      return null;
    }

    if (data && data.length > 0) {
      localStorage.setItem('fkerni_cached_quotes', JSON.stringify(data));
      return data as SupabaseQuote[];
    }

    return null;
  } catch (err) {
    console.warn('Network error fetching quotes, using offline cache:', err);
    return null;
  }
}

export function subscribeToLiveQuotes(
  onQuotesChange: (quotes: SupabaseQuote[]) => void
): () => void {
  const client = getSupabaseClient();
  if (!client) return () => {};

  if (quotesRealtimeChannel) {
    quotesRealtimeChannel.unsubscribe();
    quotesRealtimeChannel = null;
  }

  const handleRefresh = async () => {
    const updated = await fetchQuotesFromSupabase();
    if (updated && updated.length > 0) {
      onQuotesChange(updated);
    }
  };

  try {
    quotesRealtimeChannel = client
      .channel('public:quotes-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: QUOTES_PRIMARY_TABLE }, () => {
        handleRefresh();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: QUOTES_FALLBACK_TABLE }, () => {
        handleRefresh();
      })
      .subscribe();
  } catch {
    // Ignore realtime error
  }

  return () => {
    if (quotesRealtimeChannel) {
      quotesRealtimeChannel.unsubscribe();
      quotesRealtimeChannel = null;
    }
  };
}
