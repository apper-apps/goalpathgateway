import React from 'react';
import ApperIcon from '@/components/ApperIcon';

const Empty = ({ 
  title = "No goals yet", 
  description = "Start your journey by creating your first goal",
  actionText = "Add Goal",
  onAction 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-8 rounded-full mb-6">
        <ApperIcon name="Target" size={64} className="text-primary-500" />
      </div>
      
      <h3 className="text-2xl font-display font-semibold text-gray-900 mb-3">
        {title}
      </h3>
      
      <p className="text-gray-600 text-center mb-8 max-w-md text-lg">
        {description}
      </p>
      
      {onAction && (
        <button
          onClick={onAction}
          className="btn-primary flex items-center space-x-2 text-lg px-8 py-4"
        >
          <ApperIcon name="Plus" size={20} />
          <span>{actionText}</span>
        </button>
      )}
      
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 mb-2">Quick tips to get started:</p>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Set specific, measurable goals</li>
          <li>• Break them into small milestones</li>
          <li>• Check in daily to build momentum</li>
        </ul>
      </div>
    </div>
  );
};

export default Empty;