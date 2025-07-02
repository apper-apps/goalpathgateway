import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import MoodSelector from '@/components/molecules/MoodSelector';
import { goalService } from '@/services/api/goalService';

const CheckInModal = ({ isOpen, onClose, goal, onCheckInAdded }) => {
  const [progress, setProgress] = useState(goal?.overallProgress || 0);
  const [mood, setMood] = useState('neutral');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    if (!goal) return;
    
    setIsSubmitting(true);
    try {
      const checkInData = {
        goalId: goal.Id,
        progress: progress,
        mood: mood,
        note: note.trim() || null
      };
      
      const newCheckIn = await goalService.addCheckIn(checkInData);
      onCheckInAdded(newCheckIn);
      handleClose();
      
      // Show success message based on progress
      if (progress >= 100) {
        toast.success('🎉 Congratulations! Goal completed!');
      } else if (progress > goal.overallProgress) {
        toast.success('Great progress! Keep it up!');
      } else {
        toast.info('Check-in recorded. Every step counts!');
      }
    } catch (error) {
      toast.error('Failed to record check-in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleClose = () => {
    setProgress(goal?.overallProgress || 0);
    setMood('neutral');
    setNote('');
    onClose();
  };
  
  const progressOptions = [
    { value: 0, label: "No progress today" },
    { value: 25, label: "Made some progress" },
    { value: 50, label: "Good progress" },
    { value: 75, label: "Great progress" },
    { value: 100, label: "Goal completed!" }
  ];
  
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
        onClick={handleClose}
      >
        <motion.div
          className="modal-content max-w-lg"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-display font-semibold text-gray-900">
                  Daily Check-in
                </h2>
                <p className="text-gray-600 mt-1 line-clamp-2">
                  How's your progress on "{goal.title}"?
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ApperIcon name="X" size={20} />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Progress Slider */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Overall Progress ({progress}%)
                </label>
                
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={progress}
                      onChange={(e) => setProgress(parseInt(e.target.value))}
                      className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #6B5B95 0%, #6B5B95 ${progress}%, #e5e7eb ${progress}%, #e5e7eb 100%)`
                      }}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {progressOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setProgress(option.value)}
                        className={`
                          p-2 text-sm rounded-lg border transition-all duration-200
                          ${progress === option.value
                            ? 'border-primary-300 bg-primary-50 text-primary-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }
                        `}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Mood Selector */}
              <MoodSelector
                selectedMood={mood}
                onMoodChange={setMood}
              />
              
              {/* Optional Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Any thoughts, challenges, or wins you'd like to record?"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-colors duration-200 outline-none resize-none"
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="secondary" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  loading={isSubmitting}
                  icon="Check"
                >
                  Record Check-in
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CheckInModal;