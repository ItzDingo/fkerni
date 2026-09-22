/**
 * =======================================================================
 *  FKERNI - CONFIGURATION CENTRALE (TOUT MODIFIER ICI)
 * =======================================================================
 * Tu peux modifier directement ici :
 * 1. Tes citations et phrases drôles de début (qui s'affichent à l'ouverture)
 * 2. Le message de l'alarme 15 min (ex: "L’alarme dharbet! Sayeb el TikTok...")
 * 3. Le message de la notification 30 min
 * 4. Les horaires et matières globaux du planning
 * 5. La clé et l'URL Supabase pour synchroniser la base de données
 *
 * Rien d'autre ne peut être modifié par l'utilisateur dans l'application !
 */

import { SessionColor } from '../types';

// Funny quotes are now dynamically managed from Supabase and cached locally in localStorage ('fkerni_cached_quotes').

// -----------------------------------------------------------------------
// 2. MESSAGES DES ALERTES ET ALARMES
// -----------------------------------------------------------------------
export const ALERT_MESSAGES = {
  // Alarme 15 minutes avant le début de la séance :
  alarm15m: "Aya akahw w9ayet bech tmchi 3ad mnt7alouch",

  // Notification 30 minutes avant le début de la séance :
  notification30m: "30 t9i9a 3al etude 7adher challagetk we mallagetk kifma t9oul omi"
};

// -----------------------------------------------------------------------
// 3. HORAIRES GLOBAUX DU PLANNING (Séances "Étude à...")
// Aucune salle / labo n'est affichée.
// -----------------------------------------------------------------------
export interface GlobalSessionConfig {
  id: string;
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  title: string;
  subject: string;
  startTime: string; // Format "HH:mm" (24h)
  endTime: string;   // Format "HH:mm" (24h)
  notes?: string;
  color?: SessionColor;
}

export const GLOBAL_SCHEDULES: GlobalSessionConfig[] = [
  // Lundi
  {
    id: 'mon-1',
    day: 'monday',
    title: 'test',
    subject: 'test',
    startTime: '08:30',
    endTime: '10:30',
    color: 'blue'
  }
];

// -----------------------------------------------------------------------
// 4. CONFIGURATION SUPABASE (Si tu veux gérer depuis une base de données)
// -----------------------------------------------------------------------
export const SUPABASE_CREDENTIALS = {
  // Mets ton URL Supabase ici (ex: "https://abcdefgh.supabase.co")
  url: "https://xztvhdncbfyotgfrpyen.supabase.co",

  // Mets ta clé publique anon ici
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6dHZoZG5jYmZ5b3RnZnJweWVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwODU2NjYsImV4cCI6MjEwNTY2MTY2Nn0.xVnbY4lRE2jIzHnx-LP_y3Jgeeo6Il4NT70QYttow9w",

  // Auto synchronisation active
  autoSync: true
};
