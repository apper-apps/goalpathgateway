import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import FilterBar from '@/components/molecules/FilterBar';
import GoalCard from '@/components/molecules/GoalCard';
import AddGoalModal from '@/components/organisms/AddGoalModal';
import CheckInModal from '@/components/organisms/CheckInModal';
import GoalDetailModal from '@/components/organisms/GoalDetailModal';
import { goalService } from '@/services/api/goalService';

const Dashboard = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  
  useEffect(() => {
    loadGoals();
  }, []);
  
  const loadGoals = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await goalService.getAll();
      setGoals(data);
    } catch (err) {
      setError('Failed to load goals. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const filteredGoals = goals.filter(goal => {
    if (activeFilter === 'all') return true;
    return goal.category === activeFilter;
  });
  
  const goalCounts = {
    all: goals.length,
    personal: goals.filter(g => g.category === 'personal').length,
    professional: goals.filter(g => g.category === 'professional').length
  };
  
  const handleGoalAdded = (newGoal) => {
    setGoals(prev => [newGoal, ...prev]);
  };
  
  const handleGoalUpdated = (updatedGoal) => {
    setGoals(prev => prev.map(goal => 
      goal.Id === updatedGoal.Id ? updatedGoal : goal
    ));
  };
  
  const handleDeleteGoal = async (goalId) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    
    try {
      await goalService.delete(goalId);
      setGoals(prev => prev.filter(goal => goal.Id !== goalId));
      toast.success('Goal deleted successfully');
    } catch (error) {
      toast.error('Failed to delete goal');
    }
  };
  
  const handleEditGoal = (goal) => {
    setSelectedGoal(goal);
    setIsDetailModalOpen(true);
  };
  
  const handleCheckIn = (goal) => {
    setSelectedGoal(goal);
    setIsCheckInModalOpen(true);
  };
  
  const handleCheckInAdded = (checkIn) => {
    // Refresh goals to get updated progress and streaks
    loadGoals();
  };
  
  if (loading) return <Loading />;
  
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Error message={error} onRetry={loadGoals} />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">
              GoalPath
            </h1>
            <p className="text-lg text-gray-600">
              Track your journey, one milestone at a time
            </p>
          </div>
          
          <Button
            onClick={() => setIsAddModalOpen(true)}
            icon="Plus"
            size="lg"
            className="mt-4 sm:mt-0"
          >
            Add Goal
          </Button>
        </motion.div>
        
        {/* Filters */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <FilterBar
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            goalCounts={goalCounts}
          />
        </motion.div>
        
        {/* Goals Grid */}
        {filteredGoals.length === 0 ? (
          <Empty
            title={activeFilter === 'all' ? "No goals yet" : `No ${activeFilter} goals`}
            description={
              activeFilter === 'all' 
                ? "Start your journey by creating your first goal"
                : `Create your first ${activeFilter} goal to get started`
            }
            onAction={() => setIsAddModalOpen(true)}
          />
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {filteredGoals.map((goal, index) => (
              <motion.div
                key={goal.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GoalCard
                  goal={goal}
                  onEdit={handleEditGoal}
                  onCheckIn={handleCheckIn}
                  onDelete={handleDeleteGoal}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
        
        {/* Floating Add Button (Mobile) */}
        <motion.button
          onClick={() => setIsAddModalOpen(true)}
          className="fixed bottom-6 right-6 lg:hidden w-14 h-14 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ApperIcon name="Plus" size={24} />
        </motion.button>
      </div>
      
      {/* Modals */}
      <AddGoalModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onGoalAdded={handleGoalAdded}
      />
      
      <CheckInModal
        isOpen={isCheckInModalOpen}
        onClose={() => setIsCheckInModalOpen(false)}
        goal={selectedGoal}
        onCheckInAdded={handleCheckInAdded}
      />
      
      <GoalDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        goal={selectedGoal}
        onGoalUpdated={handleGoalUpdated}
      />
    </div>
  );
};

export default Dashboard;