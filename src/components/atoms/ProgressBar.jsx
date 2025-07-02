import React from 'react';
import { motion } from 'framer-motion';

const ProgressBar = ({ 
  progress = 0, 
  showPercentage = true, 
  size = 'md',
  color = 'primary',
  className = '' 
}) => {
  const sizes = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };
  
  const colors = {
    primary: 'from-primary-400 to-primary-500',
    secondary: 'from-secondary-400 to-secondary-500',
    accent: 'from-accent-400 to-accent-500',
    success: 'from-green-400 to-green-500'
  };
  
  return (
    <div className={`space-y-2 ${className}`}>
      {showPercentage && (
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-semibold text-gray-900">{Math.round(progress)}%</span>
        </div>
      )}
      
      <div className={`bg-gray-200 rounded-full overflow-hidden ${sizes[size]}`}>
        <motion.div
          className={`progress-bar bg-gradient-to-r ${colors[color]} ${sizes[size]} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;