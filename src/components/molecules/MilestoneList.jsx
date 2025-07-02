import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';

const MilestoneList = ({ milestones = [], onToggle, editable = false }) => {
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
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default MilestoneList;