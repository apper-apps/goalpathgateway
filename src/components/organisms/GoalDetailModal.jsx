import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import ProgressBar from '@/components/atoms/ProgressBar';
import MilestoneList from '@/components/molecules/MilestoneList';
import { goalService } from '@/services/api/goalService';

const GoalDetailModal = ({ isOpen, onClose, goal, onGoalUpdated }) => {
  const [checkIns, setCheckIns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingMilestone, setUpdatingMilestone] = useState(false);
  
  useEffect(() => {
    if (isOpen && goal) {
      loadCheckIns();
    }
  }, [isOpen, goal]);
  
  const loadCheckIns = async () => {
    if (!goal) return;
    
    setLoading(true);
    try {
      const data = await goalService.getCheckIns(goal.Id);
      setCheckIns(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (error) {
      toast.error('Failed to load check-in history');
    } finally {
      setLoading(false);
    }
  };
  
  const handleToggleMilestone = async (milestoneId) => {
    setUpdatingMilestone(true);
    try {
      const milestone = goal.milestones.find(m => m.Id === milestoneId);
      const updatedMilestone = {
        ...milestone,
        completed: !milestone.completed,
        completedDate: !milestone.completed ? new Date().toISOString() : null
      };
      
      const updatedMilestones = goal.milestones.map(m => 
        m.Id === milestoneId ? updatedMilestone : m
      );
      
      // Calculate new progress
      const completedCount = updatedMilestones.filter(m => m.completed).length;
      const overallProgress = Math.round((completedCount / updatedMilestones.length) * 100);
      
      const updatedGoal = await goalService.update(goal.Id, {
        milestones: updatedMilestones,
        overallProgress
      });
      
      onGoalUpdated(updatedGoal);
      toast.success(updatedMilestone.completed ? 'Milestone completed!' : 'Milestone unchecked');
    } catch (error) {
      toast.error('Failed to update milestone');
    } finally {
      setUpdatingMilestone(false);
    }
  };
  
  const handleExport = () => {
    const exportData = {
      goal: goal.title,
      category: goal.category,
      created: format(new Date(goal.createdAt), 'PPP'),
      target: format(new Date(goal.targetDate), 'PPP'),
      progress: `${goal.overallProgress}%`,
      streak: `${goal.currentStreak} days`,
      milestones: goal.milestones.map(m => ({
        title: m.title,
        completed: m.completed,
        targetDate: format(new Date(m.targetDate), 'PPP'),
        completedDate: m.completedDate ? format(new Date(m.completedDate), 'PPP') : 'Not completed'
      })),
      recentCheckIns: checkIns.slice(0, 5).map(c => ({
        date: format(new Date(c.date), 'PPP'),
        progress: `${c.progress}%`,
        mood: c.mood,
        note: c.note || 'No notes'
      }))
    };
    
    const exportText = `
GOAL SUMMARY
============
Goal: ${exportData.goal}
Category: ${exportData.category}
Created: ${exportData.created}
Target Date: ${exportData.target}
Current Progress: ${exportData.progress}
Current Streak: ${exportData.streak}

MILESTONES
==========
${exportData.milestones.map(m => `
• ${m.title}
  Status: ${m.completed ? '✓ Completed' : '○ Pending'}
  Target: ${m.targetDate}
  ${m.completed ? `Completed: ${m.completedDate}` : ''}
`).join('')}

RECENT CHECK-INS
===============
${exportData.recentCheckIns.map(c => `
Date: ${c.date}
Progress: ${c.progress}
Mood: ${c.mood}
Notes: ${c.note}
`).join('')}
    `.trim();
    
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${goal.title.replace(/[^a-zA-Z0-9]/g, '_')}_summary.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Goal summary exported!');
  };
  
  const getMoodEmoji = (mood) => {
    switch (mood) {
      case 'happy': return '😊';
      case 'neutral': return '😐';
      case 'stressed': return '😓';
      default: return '🤷';
    }
  };
  
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  };
  
  if (!isOpen || !goal) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        className="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="modal-content max-w-2xl max-h-[90vh] overflow-y-auto"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <Badge variant={goal.category} className="capitalize">
                    {goal.category}
                  </Badge>
                  {goal.currentStreak > 0 && (
                    <div className="flex items-center space-x-1 text-accent-600">
                      <ApperIcon name="Flame" size={16} />
                      <span className="text-sm font-medium">{goal.currentStreak} day streak</span>
                    </div>
                  )}
                </div>
                <h2 className="text-2xl font-display font-semibold text-gray-900 mb-2">
                  {goal.title}
                </h2>
                <p className="text-gray-600">
                  Target: {format(new Date(goal.targetDate), 'MMMM d, yyyy')}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleExport}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Export summary"
                >
                  <ApperIcon name="Download" size={20} />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ApperIcon name="X" size={20} />
                </button>
              </div>
            </div>
            
            {/* Progress */}
            <div className="mb-8">
              <ProgressBar progress={goal.overallProgress} size="lg" />
            </div>
            
            {/* Milestones */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Milestones ({goal.milestones?.filter(m => m.completed).length || 0}/{goal.milestones?.length || 0})
              </h3>
              <MilestoneList
                milestones={goal.milestones || []}
                onToggle={handleToggleMilestone}
                editable={!updatingMilestone}
              />
            </div>
            
            {/* Check-in History */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Check-ins
              </h3>
              
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : checkIns.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {checkIns.map((checkIn) => (
                    <div
                      key={checkIn.Id}
                      className="bg-gray-50 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl">
                          {getMoodEmoji(checkIn.mood)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {checkIn.progress}% Progress
                          </div>
                          <div className="text-sm text-gray-600">
                            {format(new Date(checkIn.date), 'MMM d, yyyy')}
                          </div>
                          {checkIn.note && (
                            <div className="text-sm text-gray-700 mt-1 italic">
                              "{checkIn.note}"
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ApperIcon name="Calendar" size={48} className="mx-auto mb-3 text-gray-300" />
                  <p>No check-ins yet</p>
                  <p className="text-sm">Start checking in daily to track your progress!</p>
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div className="flex justify-end pt-6 border-t mt-6">
              <Button onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GoalDetailModal;