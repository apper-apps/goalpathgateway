import React from 'react';
import { motion } from 'framer-motion';
import { format, differenceInDays } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Badge from '@/components/atoms/Badge';
import ProgressBar from '@/components/atoms/ProgressBar';

const GoalCard = ({ goal, onEdit, onCheckIn, onDelete }) => {
  const daysLeft = differenceInDays(new Date(goal.targetDate), new Date());
  const completedMilestones = goal.milestones?.filter(m => m.completed).length || 0;
  const totalMilestones = goal.milestones?.length || 0;
  
  const getMoodColor = (mood) => {
    switch (mood) {
      case 'happy': return 'text-green-500';
      case 'neutral': return 'text-yellow-500';
      case 'stressed': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };
  
  return (
    <motion.div
      className="card p-6 card-hover"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      layout
    >
      <div className="flex justify-between items-start mb-4">
        <Badge variant={goal.category} size="sm" className="capitalize">
          {goal.category}
        </Badge>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(goal)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ApperIcon name="Edit2" size={16} />
          </button>
          <button
            onClick={() => onDelete(goal.Id)}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
          >
            <ApperIcon name="Trash2" size={16} />
          </button>
        </div>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-4 line-clamp-2">
        {goal.title}
      </h3>
      
      <ProgressBar 
        progress={goal.overallProgress} 
        className="mb-4"
      />
      
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{completedMilestones}</span>
            <span className="text-gray-400">/{totalMilestones} milestones</span>
          </div>
          
          {goal.currentStreak > 0 && (
            <div className="flex items-center space-x-1 text-accent-600">
              <ApperIcon name="Flame" size={14} />
              <span className="text-sm font-medium">{goal.currentStreak} day streak</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {daysLeft > 0 ? (
            <span>{daysLeft} days left</span>
          ) : daysLeft === 0 ? (
            <span className="text-accent-600 font-medium">Due today!</span>
          ) : (
            <span className="text-red-500 font-medium">{Math.abs(daysLeft)} days overdue</span>
          )}
        </div>
        
        <button
          onClick={() => onCheckIn(goal)}
          className="btn-primary text-sm px-4 py-2"
        >
          Check In
        </button>
      </div>
    </motion.div>
  );
};

export default GoalCard;