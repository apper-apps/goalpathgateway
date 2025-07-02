import React from 'react';
import { motion } from 'framer-motion';

const MoodSelector = ({ selectedMood, onMoodChange, className = '' }) => {
  const moods = [
    { key: 'happy', emoji: '😊', label: 'Happy', color: 'text-green-500' },
    { key: 'neutral', emoji: '😐', label: 'Neutral', color: 'text-yellow-500' },
    { key: 'stressed', emoji: '😓', label: 'Stressed', color: 'text-red-500' }
  ];
  
  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        How are you feeling today?
      </label>
      
      <div className="flex space-x-3">
        {moods.map((mood) => (
          <motion.button
            key={mood.key}
            type="button"
            onClick={() => onMoodChange(mood.key)}
            className={`
              flex flex-col items-center p-3 rounded-lg border-2 transition-all duration-200
              ${selectedMood === mood.key
                ? 'border-primary-300 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-2xl mb-1">{mood.emoji}</span>
            <span className={`text-xs font-medium ${mood.color}`}>
              {mood.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default MoodSelector;