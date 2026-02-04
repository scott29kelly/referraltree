/**
 * Notification Service for Guardian Referral App
 *
 * Handles the 3-day follow-up rule and multi-channel notifications.
 * This is a stub implementation - in production, this would connect to
 * actual email/SMS services like SendGrid, Twilio, etc.
 */

import { getReferralUrl } from '@/lib/utils';

export type NotificationChannel = 'in-app' | 'email' | 'sms';
export type NotificationType = 'follow-up' | 'status-change' | 'milestone' | 'tax-threshold';

export interface NotificationRecipient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'rep' | 'referrer' | 'referee';
}

export interface NotificationPayload {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  referralId?: string;
  referralName?: string;
  recipients: NotificationRecipient[];
  channels: NotificationChannel[];
  priority: 'low' | 'normal' | 'high';
  createdAt: Date;
  scheduledFor?: Date;
  sentAt?: Date;
  status: 'pending' | 'sent' | 'failed';
}

// In-memory notification queue (in production, use a proper queue like Redis/SQS)
const notificationQueue: NotificationPayload[] = [];

// Constants
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
const REFERRAL_BONUS = 125;

/**
 * Check if a referral needs a follow-up notification
 * Rule: If submitted status for 3+ days without being contacted
 */
export function checkFollowUpNeeded(
  referral: { id: string; status: string; created_at: string; referee_name: string }
): boolean {
  if (referral.status !== 'submitted') {
    return false;
  }

  const submittedAt = new Date(referral.created_at);
  const now = new Date();
  const elapsed = now.getTime() - submittedAt.getTime();

  return elapsed >= THREE_DAYS_MS;
}

/**
 * Create a follow-up notification for a stale referral
 */
export function createFollowUpNotification(
  referral: {
    id: string;
    referee_name: string;
    referee_phone?: string;
    referee_email?: string;
  },
  recipients: NotificationRecipient[],
  repId: string
): NotificationPayload {
  const bookingUrl = getReferralUrl(repId);

  const notification: NotificationPayload = {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    type: 'follow-up',
    title: 'Referral Follow-Up Needed',
    message: `Following up on ${referral.referee_name}'s inspection request submitted 3 days ago. They're waiting to hear from us!`,
    actionUrl: bookingUrl,
    actionLabel: 'Book Inspection',
    referralId: referral.id,
    referralName: referral.referee_name,
    recipients,
    channels: ['in-app', 'email', 'sms'],
    priority: 'high',
    createdAt: new Date(),
    status: 'pending',
  };

  notificationQueue.push(notification);
  return notification;
}

/**
 * Create a status change notification
 */
export function createStatusChangeNotification(
  referralId: string,
  referralName: string,
  oldStatus: string,
  newStatus: string,
  recipients: NotificationRecipient[]
): NotificationPayload {
  let title = 'Referral Status Updated';
  let message = `${referralName}'s referral status changed from ${oldStatus} to ${newStatus}.`;

  if (newStatus === 'sold') {
    title = 'Congratulations! Referral Closed!';
    message = `Great news! ${referralName}'s referral has been closed. You've earned $${REFERRAL_BONUS}!`;
  } else if (newStatus === 'contacted') {
    title = 'Referral Contacted';
    message = `${referralName} has been contacted. The inspection is being scheduled.`;
  } else if (newStatus === 'quoted') {
    title = 'Quote Sent';
    message = `A quote has been sent to ${referralName}. Fingers crossed!`;
  }

  const notification: NotificationPayload = {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    type: 'status-change',
    title,
    message,
    referralId,
    referralName,
    recipients,
    channels: newStatus === 'sold' ? ['in-app', 'email', 'sms'] : ['in-app'],
    priority: newStatus === 'sold' ? 'high' : 'normal',
    createdAt: new Date(),
    status: 'pending',
  };

  notificationQueue.push(notification);
  return notification;
}

/**
 * Create a milestone notification (e.g., Level 2 unlocked)
 */
export function createMilestoneNotification(
  milestone: string,
  description: string,
  recipient: NotificationRecipient
): NotificationPayload {
  const notification: NotificationPayload = {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    type: 'milestone',
    title: `Milestone Achieved: ${milestone}`,
    message: description,
    recipients: [recipient],
    channels: ['in-app', 'email'],
    priority: 'high',
    createdAt: new Date(),
    status: 'pending',
  };

  notificationQueue.push(notification);
  return notification;
}

/**
 * Stub: Send email notification
 * In production, this would integrate with SendGrid, SES, etc.
 */
export async function sendEmailNotification(
  to: string,
  subject: string,
  body: string,
  actionUrl?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  console.log('[EMAIL STUB] Sending email:', {
    to,
    subject,
    body: body.slice(0, 100) + '...',
    actionUrl,
  });

  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 100));

  // In production:
  // const response = await sendgrid.send({
  //   to,
  //   from: 'noreply@guardianstormrepair.com',
  //   subject,
  //   html: body,
  // });

  return {
    success: true,
    messageId: `email-${Date.now()}`,
  };
}

/**
 * Stub: Send SMS notification via Twilio
 * In production, this would integrate with Twilio
 */
export async function sendSMSNotification(
  to: string,
  message: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  console.log('[SMS STUB] Sending SMS:', {
    to,
    message: message.slice(0, 50) + '...',
  });

  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 100));

  // In production:
  // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  // const response = await client.messages.create({
  //   body: message,
  //   from: process.env.TWILIO_PHONE_NUMBER,
  //   to,
  // });

  return {
    success: true,
    messageId: `sms-${Date.now()}`,
  };
}

/**
 * Process and send a notification through all channels
 */
export async function sendNotification(notification: NotificationPayload): Promise<void> {
  console.log('[NOTIFICATION] Processing:', notification.id, notification.type);

  for (const recipient of notification.recipients) {
    for (const channel of notification.channels) {
      try {
        switch (channel) {
          case 'email':
            if (recipient.email) {
              await sendEmailNotification(
                recipient.email,
                notification.title,
                notification.message,
                notification.actionUrl
              );
            }
            break;

          case 'sms':
            if (recipient.phone) {
              const smsMessage = notification.actionUrl
                ? `${notification.message} ${notification.actionUrl}`
                : notification.message;
              await sendSMSNotification(recipient.phone, smsMessage);
            }
            break;

          case 'in-app':
            // In-app notifications are handled by the frontend
            // They'll be fetched via the useNotifications hook
            break;
        }
      } catch (error) {
        console.error(`[NOTIFICATION] Failed to send via ${channel}:`, error);
      }
    }
  }

  notification.sentAt = new Date();
  notification.status = 'sent';
}

/**
 * Get pending notifications from the queue
 */
export function getPendingNotifications(userId?: string): NotificationPayload[] {
  return notificationQueue.filter((n) => {
    if (n.status !== 'pending') return false;
    if (userId && !n.recipients.some((r) => r.id === userId)) return false;
    return true;
  });
}

/**
 * Get recent notifications for a user
 */
export function getRecentNotifications(
  userId: string,
  limit: number = 10
): NotificationPayload[] {
  return notificationQueue
    .filter((n) => n.recipients.some((r) => r.id === userId))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);
}

/**
 * Mark notification as read/dismissed
 */
export function dismissNotification(notificationId: string): void {
  const index = notificationQueue.findIndex((n) => n.id === notificationId);
  if (index >= 0) {
    notificationQueue.splice(index, 1);
  }
}

/**
 * Schedule the follow-up check (in production, this would be a cron job)
 */
export function scheduleFollowUpCheck(): void {
  // In production, this would be a serverless cron function
  // or a background job processor like Bull, Agenda, etc.
  console.log('[SCHEDULER] Follow-up check would run daily at 9 AM');
}
