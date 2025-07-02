import { toast } from 'react-toastify';
import { format, differenceInDays, differenceInHours, isBefore, addDays } from 'date-fns';

class NotificationService {
  constructor() {
    this.scheduledReminders = new Map();
    this.storageKey = 'goalpath_reminders';
    this.loadScheduledReminders();
    this.startReminderCheck();
  }

  // Request notification permission
  async requestPermission() {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  // Check if notifications are supported and permitted
  canSendNotifications() {
    return 'Notification' in window && Notification.permission === 'granted';
  }

  // Schedule a reminder for a milestone
  async scheduleMilestoneReminder(milestone, goalId) {
    if (!milestone.reminderSettings?.enabled || milestone.completed) {
      return;
    }

    const reminderId = `${goalId}_${milestone.Id}`;
    const targetDate = new Date(milestone.targetDate);
    const now = new Date();
    
    // Calculate reminder date based on timing setting
    const reminderDate = new Date(targetDate);
    reminderDate.setDate(reminderDate.getDate() - milestone.reminderSettings.timing);

    // Smart timing: Don't schedule if target date is too close or passed
    if (isBefore(targetDate, now)) {
      console.log(`Milestone ${milestone.Id} target date has passed`);
      return;
    }

    if (differenceInHours(targetDate, now) < 24 && milestone.reminderSettings.timing > 1) {
      console.log(`Milestone ${milestone.Id} is too close to target date for configured timing`);
      return;
    }

    // Store reminder information
    const reminderInfo = {
      milestoneId: milestone.Id,
      goalId,
      title: milestone.title,
      targetDate: milestone.targetDate,
      reminderDate: reminderDate.toISOString(),
      frequency: milestone.reminderSettings.frequency,
      timing: milestone.reminderSettings.timing,
      lastSent: null
    };

    this.scheduledReminders.set(reminderId, reminderInfo);
    this.saveScheduledReminders();

    console.log(`Scheduled reminder for milestone: ${milestone.title}`);
  }

  // Cancel a milestone reminder
  cancelMilestoneReminder(milestoneId) {
    // Find and remove reminders for this milestone
    for (const [reminderId, reminder] of this.scheduledReminders.entries()) {
      if (reminder.milestoneId === milestoneId) {
        this.scheduledReminders.delete(reminderId);
      }
    }
    this.saveScheduledReminders();
  }

  // Send a notification
  async sendNotification(title, body, options = {}) {
    const canSend = this.canSendNotifications();
    
    if (canSend) {
      try {
        const notification = new Notification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: options.tag || 'goalpath-reminder',
          requireInteraction: false,
          ...options
        });

        // Auto-close after 5 seconds
        setTimeout(() => {
          notification.close();
        }, 5000);

        return notification;
      } catch (error) {
        console.error('Failed to send notification:', error);
        // Fallback to toast
        toast.info(`${title}\n${body}`);
      }
    } else {
      // Fallback to toast notification
      toast.info(`📋 ${title}\n${body}`, {
        autoClose: 5000,
        closeOnClick: true
      });
    }
  }

  // Check for due reminders
  checkReminders() {
    const now = new Date();
    
    for (const [reminderId, reminder] of this.scheduledReminders.entries()) {
      const reminderDate = new Date(reminder.reminderDate);
      const targetDate = new Date(reminder.targetDate);
      
      // Skip if target date has passed (completed or overdue)
      if (isBefore(targetDate, now)) {
        this.scheduledReminders.delete(reminderId);
        continue;
      }

      // Check if it's time to send the reminder
      const shouldSend = this.shouldSendReminder(reminder, now, reminderDate);
      
      if (shouldSend) {
        this.sendMilestoneReminder(reminder);
        this.updateLastSent(reminderId, now);
      }
    }

    this.saveScheduledReminders();
  }

  // Determine if a reminder should be sent based on frequency and last sent time
  shouldSendReminder(reminder, now, reminderDate) {
    // If reminder date hasn't arrived yet, don't send
    if (isBefore(now, reminderDate)) {
      return false;
    }

    const { frequency, lastSent } = reminder;

    if (!lastSent) {
      return true; // First reminder
    }

    const lastSentDate = new Date(lastSent);
    const daysSinceLastSent = differenceInDays(now, lastSentDate);

    switch (frequency) {
      case 'once':
        return false; // Already sent
      case 'daily':
        return daysSinceLastSent >= 1;
      case 'weekly':
        return daysSinceLastSent >= 7;
      default:
        return false;
    }
  }

  // Send milestone reminder notification
  async sendMilestoneReminder(reminder) {
    const daysUntilDue = differenceInDays(new Date(reminder.targetDate), new Date());
    const timeText = daysUntilDue === 0 ? 'today' : 
                     daysUntilDue === 1 ? 'tomorrow' : 
                     `in ${daysUntilDue} days`;

    const title = '🎯 Milestone Reminder';
    const body = `"${reminder.title}" is due ${timeText}`;

    await this.sendNotification(title, body, {
      tag: `milestone-${reminder.milestoneId}`,
      data: {
        milestoneId: reminder.milestoneId,
        goalId: reminder.goalId,
        type: 'milestone-reminder'
      }
    });
  }

  // Update last sent time for a reminder
  updateLastSent(reminderId, timestamp) {
    const reminder = this.scheduledReminders.get(reminderId);
    if (reminder) {
      reminder.lastSent = timestamp.toISOString();
      this.scheduledReminders.set(reminderId, reminder);
    }
  }

  // Start the reminder checking interval
  startReminderCheck() {
    // Check every 30 minutes
    setInterval(() => {
      this.checkReminders();
    }, 30 * 60 * 1000);

    // Initial check
    setTimeout(() => {
      this.checkReminders();
    }, 5000);
  }

  // Save scheduled reminders to localStorage
  saveScheduledReminders() {
    try {
      const remindersArray = Array.from(this.scheduledReminders.entries());
      localStorage.setItem(this.storageKey, JSON.stringify(remindersArray));
    } catch (error) {
      console.error('Failed to save reminders to localStorage:', error);
    }
  }

  // Load scheduled reminders from localStorage
  loadScheduledReminders() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const remindersArray = JSON.parse(stored);
        this.scheduledReminders = new Map(remindersArray);
        
        // Clean up old reminders (target date passed)
        const now = new Date();
        for (const [reminderId, reminder] of this.scheduledReminders.entries()) {
          if (isBefore(new Date(reminder.targetDate), now)) {
            this.scheduledReminders.delete(reminderId);
          }
        }
        this.saveScheduledReminders();
      }
    } catch (error) {
      console.error('Failed to load reminders from localStorage:', error);
      this.scheduledReminders = new Map();
    }
  }

  // Get all scheduled reminders for debugging
  getScheduledReminders() {
    return Array.from(this.scheduledReminders.entries());
  }

  // Clear all reminders
  clearAllReminders() {
    this.scheduledReminders.clear();
    this.saveScheduledReminders();
  }
}

// Create singleton instance
export const notificationService = new NotificationService();