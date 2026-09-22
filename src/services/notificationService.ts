import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { StudySession, NotificationSettings } from '../types';
import { ALERT_MESSAGES } from '../config/customContent';
import { playNotification30mSound, startAlarm15m } from '../utils/audio';

// Notification Channels for Android 8.0+
export const CHANNEL_ALARM_15M = 'fkerni_alarms_channel';
export const CHANNEL_REMINDER_30M = 'fkerni_reminders_channel';

let isChannelsInitialized = false;

/**
 * Initialize Notification channels on Android devices
 */
export async function initNotificationService(): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    try {
      const permStatus = await LocalNotifications.requestPermissions();
      if (permStatus.display !== 'granted') {
        console.warn('Local notification permission not granted on device:', permStatus);
      }

      if (!isChannelsInitialized) {
        // High importance alarm channel - displays heads-up over other apps, vibrates, and plays sound
        await LocalNotifications.createChannel({
          id: CHANNEL_ALARM_15M,
          name: 'Fkerni Alarme 15 Min',
          description: 'Alarme prioritaire pour les séances d’étude (sonnerie & vibration)',
          importance: 5, // MAX importance (heads-up banner over other apps + sound)
          visibility: 1, // PUBLIC (shows on lock screen)
          vibration: true,
          sound: 'alarm.wav',
          lights: true,
          lightColor: '#06b6d4'
        });

        // Reminder channel
        await LocalNotifications.createChannel({
          id: CHANNEL_REMINDER_30M,
          name: 'Fkerni Rappels 30 Min',
          description: 'Rappels 30 minutes avant chaque séance d’étude',
          importance: 4, // HIGH importance
          visibility: 1,
          vibration: true,
          lights: true,
          lightColor: '#06b6d4'
        });

        isChannelsInitialized = true;
      }
      return permStatus.display === 'granted';
    } catch (err) {
      console.warn('Error initializing native notifications:', err);
      return false;
    }
  } else {
    // Web browser fallback
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        const res = await Notification.requestPermission();
        return res === 'granted';
      } catch {
        return false;
      }
    }
    return 'Notification' in window && Notification.permission === 'granted';
  }
}

/**
 * Trigger an immediate notification (like Instagram / WhatsApp notification)
 */
export async function sendInstantNotification({
  title,
  body,
  type = '30m',
  id = Math.floor(Math.random() * 100000)
}: {
  title: string;
  body: string;
  type?: '30m' | '15m';
  id?: number;
}): Promise<void> {
  const isAlarm = type === '15m';
  const channelId = isAlarm ? CHANNEL_ALARM_15M : CHANNEL_REMINDER_30M;

  if (Capacitor.isNativePlatform()) {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id,
            title,
            body,
            channelId,
            schedule: { at: new Date(Date.now() + 100) },
            sound: isAlarm ? 'alarm.wav' : undefined,
            smallIcon: 'ic_stat_book',
            iconColor: '#06b6d4',
            actionTypeId: '',
            extra: { type }
          }
        ]
      });
      return;
    } catch (err) {
      console.warn('Native instant notification failed, falling back:', err);
    }
  }

  // Web fallback
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/icon.png',
        badge: '/icon.png',
        tag: `fkerni-${id}`
      });
    } catch (err) {
      console.warn('Web notification error:', err);
    }
  }

  // Audio and vibration
  if (isAlarm) {
    startAlarm15m(90);
  } else {
    playNotification30mSound(85);
  }
  if ('vibrate' in navigator) {
    navigator.vibrate(isAlarm ? [400, 150, 400, 150, 500] : [200, 100, 200]);
  }
}

/**
 * Schedule automated system notifications for all upcoming sessions
 * Fired natively by Android even when app is completely closed or screen is off
 */
export async function scheduleAllSessionsNotifications(
  sessions: StudySession[],
  settings: NotificationSettings
): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications });
    }

    const dayMap: Record<string, number> = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6
    };

    const notificationsToSchedule: any[] = [];
    const now = new Date();
    const currentDay = now.getDay();

    sessions.forEach((session, index) => {
      if (session.completed) return;

      const targetDay = dayMap[session.day];
      if (targetDay === undefined) return;

      const [hours, minutes] = session.startTime.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) return;

      let dayOffset = targetDay - currentDay;
      if (dayOffset < 0) dayOffset += 7;

      const sessionDate = new Date(now);
      sessionDate.setDate(now.getDate() + dayOffset);
      sessionDate.setHours(hours, minutes, 0, 0);

      // 1. Schedule 30-minute reminder
      if (settings.enable30MinNotification) {
        const notif30Date = new Date(sessionDate.getTime() - 30 * 60 * 1000);
        if (notif30Date.getTime() > now.getTime()) {
          notificationsToSchedule.push({
            id: index * 10 + 1,
            title: `📖 Fkerni : ${session.title || 'Étude'} dans 30 min`,
            body: `${ALERT_MESSAGES.notification30m} (${session.subject})`,
            channelId: CHANNEL_REMINDER_30M,
            schedule: { at: notif30Date },
            smallIcon: 'ic_stat_book',
            iconColor: '#06b6d4',
            extra: { sessionId: session.id, type: '30m' }
          });
        }
      }

      // 2. Schedule 15-minute alarm
      if (settings.enable15MinAlarm) {
        const alarm15Date = new Date(sessionDate.getTime() - 15 * 60 * 1000);
        if (alarm15Date.getTime() > now.getTime()) {
          notificationsToSchedule.push({
            id: index * 10 + 2,
            title: `📖 Fkerni : Alarme 15 min (${session.startTime})`,
            body: `${ALERT_MESSAGES.alarm15m} (${session.subject})`,
            channelId: CHANNEL_ALARM_15M,
            schedule: { at: alarm15Date },
            sound: 'alarm.wav',
            smallIcon: 'ic_stat_book',
            iconColor: '#06b6d4',
            extra: { sessionId: session.id, type: '15m' }
          });
        }
      }
    });

    if (notificationsToSchedule.length > 0) {
      await LocalNotifications.schedule({
        notifications: notificationsToSchedule
      });
      console.log(`✅ Scheduled ${notificationsToSchedule.length} real mobile notifications with book icon.`);
    }
  } catch (err) {
    console.warn('Error scheduling local notifications:', err);
  }
}
