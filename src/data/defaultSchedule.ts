import { StudySession } from '../types';
import { GLOBAL_SCHEDULES } from '../config/customContent';

export const INITIAL_SCHEDULE: StudySession[] = GLOBAL_SCHEDULES.map((s) => ({
  id: s.id,
  day: s.day,
  title: s.title,
  subject: s.subject,
  startTime: s.startTime,
  endTime: s.endTime,
  notes: s.notes || '',
  color: s.color || 'blue',
  completed: false
}));
