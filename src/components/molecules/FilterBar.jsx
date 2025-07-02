import React from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const FilterBar = ({ activeFilter, onFilterChange, goalCounts }) => {
  const filters = [
    { key: 'all', label: 'All Goals', icon: 'Target', count: goalCounts.all },
    { key: 'personal', label: 'Personal', icon: 'Heart', count: goalCounts.personal },
    { key: 'professional', label: 'Professional', icon: 'Briefcase', count: goalCounts.professional }
  ];
  
  return (
    <div className="flex flex-wrap gap-2 p-1 bg-gray-50 rounded-lg">
      {filters.map((filter) => (
        <motion.button
          key={filter.key}
          onClick={() => onFilterChange(filter.key)}
          className={`
            flex items-center space-x-2 px-4 py-2 rounded-md font-medium text-sm transition-all duration-200
            ${activeFilter === filter.key
              ? 'bg-white text-primary-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }
          `}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ApperIcon name={filter.icon} size={16} />
          <span>{filter.label}</span>
          {filter.count > 0 && (
            <span className={`
              px-2 py-0.5 rounded-full text-xs font-medium
              ${activeFilter === filter.key
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-200 text-gray-600'
              }
            `}>
              {filter.count}
            </span>
          )}
        </motion.button>
      ))}
    </div>
  );
};

export default FilterBar;