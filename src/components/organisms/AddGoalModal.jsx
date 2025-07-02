import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import MilestoneList from '@/components/molecules/MilestoneList';
import { goalService } from '@/services/api/goalService';

const AddGoalModal = ({ isOpen, onClose, onGoalAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'personal',
    targetDate: ''
  });
  const [milestones, setMilestones] = useState([]);
  const [isGeneratingMilestones, setIsGeneratingMilestones] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1); // 1: Basic info, 2: Milestones
  
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Goal title is required';
    }
    
    if (!formData.targetDate) {
      newErrors.targetDate = 'Target date is required';
    } else {
      const targetDate = new Date(formData.targetDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (targetDate <= today) {
        newErrors.targetDate = 'Target date must be in the future';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleGenerateMilestones = async () => {
    if (!validateForm()) return;
    
    setIsGeneratingMilestones(true);
    try {
      const generatedMilestones = await goalService.generateMilestones(
        formData.title,
        formData.category,
        formData.targetDate
      );
      setMilestones(generatedMilestones);
      setStep(2);
      toast.success('AI milestones generated successfully!');
    } catch (error) {
      toast.error('Failed to generate milestones. Please try again.');
    } finally {
      setIsGeneratingMilestones(false);
    }
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const goalData = {
        ...formData,
        milestones: milestones.map((milestone, index) => ({
          ...milestone,
          Id: index + 1 // Assign proper IDs when creating
        }))
      };
      
      const newGoal = await goalService.create(goalData);
      onGoalAdded(newGoal);
      handleClose();
      toast.success('Goal created successfully!');
    } catch (error) {
      toast.error('Failed to create goal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleClose = () => {
    setFormData({ title: '', category: 'personal', targetDate: '' });
    setMilestones([]);
    setErrors({});
    setStep(1);
    onClose();
  };
  
  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleInputChange('title', transcript);
        toast.success('Voice input captured!');
      };
      
      recognition.onerror = () => {
        toast.error('Voice recognition failed. Please try again.');
      };
      
      recognition.start();
      toast.info('Listening... Speak your goal now!');
    } else {
      toast.error('Voice input not supported in this browser');
    }
  };
  
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  };
  
  if (!isOpen) return null;
  
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
          className="modal-content"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-display font-semibold text-gray-900">
                  {step === 1 ? 'Create New Goal' : 'Review Milestones'}
                </h2>
                <p className="text-gray-600 mt-1">
                  {step === 1 
                    ? 'Set your goal and let AI suggest the perfect milestones' 
                    : 'AI-generated milestones for your goal'
                  }
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ApperIcon name="X" size={20} />
              </button>
            </div>
            
            {step === 1 ? (
              <div className="space-y-6">
                <div className="relative">
                  <Input
                    label="What's your goal?"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Learn Spanish conversational level"
                    error={errors.title}
                  />
                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    className="absolute right-3 top-9 p-1 text-gray-400 hover:text-primary-500 transition-colors"
                    title="Voice input"
                  >
                    <ApperIcon name="Mic" size={16} />
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <div className="flex space-x-3">
                    {['personal', 'professional'].map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => handleInputChange('category', category)}
                        className={`
                          flex-1 py-3 px-4 rounded-lg border-2 font-medium capitalize transition-all duration-200
                          ${formData.category === category
                            ? 'border-primary-300 bg-primary-50 text-primary-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }
                        `}
                      >
                        <ApperIcon 
                          name={category === 'personal' ? 'Heart' : 'Briefcase'} 
                          size={16} 
                          className="inline mr-2" 
                        />
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
                
                <Input
                  label="Target Date"
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => handleInputChange('targetDate', e.target.value)}
                  error={errors.targetDate}
                  min={new Date().toISOString().split('T')[0]}
                />
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button variant="secondary" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleGenerateMilestones}
                    loading={isGeneratingMilestones}
                    icon="Sparkles"
                    disabled={!formData.title || !formData.targetDate}
                  >
                    Generate Milestones with AI
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">{formData.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="capitalize flex items-center">
                      <ApperIcon 
                        name={formData.category === 'personal' ? 'Heart' : 'Briefcase'} 
                        size={14} 
                        className="mr-1" 
                      />
                      {formData.category}
                    </span>
                    <span>Target: {new Date(formData.targetDate).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    AI-Generated Milestones ({milestones.length})
                  </h4>
                  <MilestoneList milestones={milestones} />
                </div>
                
                <div className="flex justify-between pt-4">
                  <Button variant="secondary" onClick={() => setStep(1)}>
                    Back to Edit
                  </Button>
                  <div className="space-x-3">
                    <Button variant="secondary" onClick={handleClose}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      loading={isSubmitting}
                      icon="Check"
                    >
                      Create Goal
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddGoalModal;