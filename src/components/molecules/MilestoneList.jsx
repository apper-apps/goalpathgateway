import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import { notificationService } from '@/services/api/notificationService';
import { goalService } from '@/services/api/goalService';

const MilestoneList = ({ milestones = [], onToggle, editable = false, goalId, onMilestoneUpdated }) => {
const [expandedReminders, setExpandedReminders] = useState(new Set());
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    // Initialize notifications for milestones with reminders enabled
    milestones.forEach(milestone => {
      if (milestone.reminderSettings?.enabled && !milestone.completed) {
        notificationService.scheduleMilestoneReminder(milestone, goalId);
      }
    });
  }, [milestones, goalId]);

  const toggleReminderSettings = (milestoneId) => {
    const newExpanded = new Set(expandedReminders);
    if (newExpanded.has(milestoneId)) {
      newExpanded.delete(milestoneId);
    } else {
      newExpanded.add(milestoneId);
    }
    setExpandedReminders(newExpanded);
  };

  const updateReminderSettings = async (milestone, newSettings) => {
    if (!goalId) return;
    
    setUpdating(true);
    try {
      const updatedMilestone = {
        ...milestone,
        reminderSettings: newSettings
      };

      // Update in backend
      const goals = await goalService.getAll();
      const goal = goals.find(g => g.Id === goalId);
      if (goal) {
        const updatedMilestones = goal.milestones.map(m => 
          m.Id === milestone.Id ? updatedMilestone : m
        );
        await goalService.update(goalId, { milestones: updatedMilestones });
      }

      // Update notifications
      if (newSettings.enabled && !milestone.completed) {
        await notificationService.scheduleMilestoneReminder(updatedMilestone, goalId);
        toast.success('Reminder scheduled successfully');
      } else {
        notificationService.cancelMilestoneReminder(milestone.Id);
        toast.success('Reminder disabled');
      }

      if (onMilestoneUpdated) {
        onMilestoneUpdated(updatedMilestone);
      }
    } catch (error) {
      toast.error('Failed to update reminder settings');
    } finally {
      setUpdating(false);
    }
  };

  const requestNotificationPermission = async () => {
    const permission = await notificationService.requestPermission();
    if (permission === 'denied') {
      toast.warning('Notifications are blocked. Please enable them in your browser settings.');
    }
    return permission === 'granted';
  };

  return (
    <div className="space-y-3">
      {milestones.map((milestone, index) => (
        <motion.div
          key={milestone.Id || index}
          className={`
            flex items-start space-x-3 p-3 rounded-lg border transition-all duration-200
            ${milestone.completed 
              ? 'bg-green-50 border-green-200' 
              : 'bg-white border-gray-200 hover:border-gray-300'
            }
          `}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <button
            onClick={() => editable && onToggle && onToggle(milestone.Id)}
            className={`
              flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200
              ${milestone.completed
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300 hover:border-green-400'
              }
              ${!editable ? 'cursor-default' : 'cursor-pointer'}
            `}
            disabled={!editable}
          >
            {milestone.completed && (
              <ApperIcon name="Check" size={12} />
            )}
          </button>
          
          <div className="flex-1 min-w-0">
            <h4 className={`
              text-sm font-medium
              ${milestone.completed ? 'text-green-800 line-through' : 'text-gray-900'}
            `}>
              {milestone.title}
            </h4>
            
            <div className="flex items-center space-x-4 mt-1">
              <span className="text-xs text-gray-500">
                Due: {format(new Date(milestone.targetDate), 'MMM d, yyyy')}
              </span>
              
              {milestone.completedDate && (
                <span className="text-xs text-green-600">
                  ✓ Completed {format(new Date(milestone.completedDate), 'MMM d')}
                </span>
)}
            </div>

            {/* Reminder Controls - Only show for incomplete milestones */}
            {!milestone.completed && editable && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ApperIcon name="Bell" size={14} className="text-gray-400" />
                    <span className="text-xs text-gray-600">Reminders</span>
                    {milestone.reminderSettings?.enabled && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                  <button
                    onClick={() => toggleReminderSettings(milestone.Id)}
                    className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {expandedReminders.has(milestone.Id) ? 'Hide' : 'Configure'}
                  </button>
                </div>

                {/* Expanded Reminder Settings */}
                {expandedReminders.has(milestone.Id) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 p-3 bg-gray-50 rounded-lg space-y-3"
                  >
                    {/* Enable/Disable Toggle */}
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={milestone.reminderSettings?.enabled || false}
                        onChange={async (e) => {
                          if (e.target.checked) {
                            const hasPermission = await requestNotificationPermission();
                            if (!hasPermission) {
                              e.target.checked = false;
                              return;
                            }
                          }
                          
                          const newSettings = {
                            ...milestone.reminderSettings,
                            enabled: e.target.checked,
                            timing: milestone.reminderSettings?.timing || 1,
                            frequency: milestone.reminderSettings?.frequency || 'once'
                          };
                          updateReminderSettings(milestone, newSettings);
                        }}
                        disabled={updating}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-xs text-gray-700">Enable reminders</span>
                    </label>

                    {/* Timing and Frequency Controls */}
                    {milestone.reminderSettings?.enabled && (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <label className="text-xs text-gray-600 min-w-0 flex-shrink-0">Remind me</label>
                          <select
                            value={milestone.reminderSettings?.timing || 1}
                            onChange={(e) => {
                              const newSettings = {
                                ...milestone.reminderSettings,
                                timing: parseInt(e.target.value)
                              };
                              updateReminderSettings(milestone, newSettings);
                            }}
                            disabled={updating}
                            className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value={1}>1 day</option>
                            <option value={2}>2 days</option>
                            <option value={3}>3 days</option>
                            <option value={7}>1 week</option>
                            <option value={14}>2 weeks</option>
                          </select>
                          <span className="text-xs text-gray-600">before due date</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <label className="text-xs text-gray-600 min-w-0 flex-shrink-0">Frequency:</label>
                          <select
                            value={milestone.reminderSettings?.frequency || 'once'}
                            onChange={(e) => {
                              const newSettings = {
                                ...milestone.reminderSettings,
                                frequency: e.target.value
                              };
                              updateReminderSettings(milestone, newSettings);
                            }}
                            disabled={updating}
                            className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="once">Once only</option>
                            <option value="daily">Daily until due</option>
                            <option value="weekly">Weekly until due</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default MilestoneList;