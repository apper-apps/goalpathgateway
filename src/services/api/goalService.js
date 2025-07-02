import goalsData from '@/services/mockData/goals.json';
import checkInsData from '@/services/mockData/checkIns.json';

let goals = [...goalsData];
let checkIns = [...checkInsData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const goalService = {
  async getAll() {
    await delay(300);
    return [...goals];
  },

  async getById(id) {
    await delay(200);
    const goal = goals.find(g => g.Id === parseInt(id));
    if (!goal) throw new Error('Goal not found');
    return { ...goal };
  },

  async create(goalData) {
    await delay(400);
    
    const newGoal = {
      Id: Math.max(...goals.map(g => g.Id), 0) + 1,
      ...goalData,
      createdAt: new Date().toISOString(),
      currentStreak: 0,
      overallProgress: 0,
      milestones: goalData.milestones || []
    };
    
    goals.push(newGoal);
    return { ...newGoal };
  },

  async update(id, updates) {
    await delay(300);
    
    const index = goals.findIndex(g => g.Id === parseInt(id));
    if (index === -1) throw new Error('Goal not found');
    
    goals[index] = { ...goals[index], ...updates };
    return { ...goals[index] };
  },

  async delete(id) {
    await delay(250);
    
    const index = goals.findIndex(g => g.Id === parseInt(id));
    if (index === -1) throw new Error('Goal not found');
    
    goals.splice(index, 1);
    
    // Also remove related check-ins
    checkIns = checkIns.filter(c => c.goalId !== parseInt(id));
    
    return true;
  },

  async getCheckIns(goalId) {
    await delay(200);
    return checkIns.filter(c => c.goalId === parseInt(goalId));
  },

  async addCheckIn(checkInData) {
    await delay(300);
    
    const newCheckIn = {
      Id: Math.max(...checkIns.map(c => c.Id), 0) + 1,
      ...checkInData,
      date: new Date().toISOString()
    };
    
    checkIns.push(newCheckIn);
    
    // Update goal progress and streak
    const goal = goals.find(g => g.Id === parseInt(checkInData.goalId));
    if (goal) {
      goal.overallProgress = checkInData.progress;
      
      // Calculate streak (simplified - in real app would be more complex)
      const recentCheckIns = checkIns
        .filter(c => c.goalId === parseInt(checkInData.goalId))
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      
      goal.currentStreak = recentCheckIns.length > 0 ? goal.currentStreak + 1 : 1;
    }
    
    return { ...newCheckIn };
  },

  async generateMilestones(goalTitle, category, targetDate) {
    await delay(800); // Simulate AI processing time
    
    const milestoneTemplates = {
      personal: {
        fitness: [
          "Establish baseline fitness level",
          "Create consistent workout routine",
          "Reach intermediate fitness milestone",
          "Achieve advanced training goals",
          "Complete final fitness challenge"
        ],
        learning: [
          "Complete foundational course or materials",
          "Practice daily for skill development",
          "Apply knowledge in real-world scenario",
          "Teach or share knowledge with others",
          "Master advanced concepts and techniques"
        ],
        default: [
          "Research and plan approach",
          "Start with basic foundation",
          "Build consistent daily habits",
          "Reach halfway milestone",
          "Complete final goal achievement"
        ]
      },
      professional: {
        career: [
          "Define clear career objectives",
          "Develop required skills and knowledge",
          "Build professional network connections",
          "Apply for opportunities or create visibility",
          "Achieve career advancement goal"
        ],
        project: [
          "Plan project scope and requirements",
          "Set up tools and development environment",
          "Build core functionality and features",
          "Test, refine, and add final touches",
          "Launch and promote completed project"
        ],
        default: [
          "Research industry requirements",
          "Develop necessary skills",
          "Create professional assets",
          "Network and build connections",
          "Achieve professional milestone"
        ]
      }
    };
    
    // Simple AI simulation - detect goal type and return relevant milestones
    const goalLower = goalTitle.toLowerCase();
    let milestones;
    
    if (category === 'personal') {
      if (goalLower.includes('run') || goalLower.includes('fitness') || goalLower.includes('exercise')) {
        milestones = milestoneTemplates.personal.fitness;
      } else if (goalLower.includes('learn') || goalLower.includes('language') || goalLower.includes('course')) {
        milestones = milestoneTemplates.personal.learning;
      } else {
        milestones = milestoneTemplates.personal.default;
      }
    } else {
      if (goalLower.includes('website') || goalLower.includes('app') || goalLower.includes('project')) {
        milestones = milestoneTemplates.professional.project;
      } else if (goalLower.includes('job') || goalLower.includes('career') || goalLower.includes('promotion')) {
        milestones = milestoneTemplates.professional.career;
      } else {
        milestones = milestoneTemplates.professional.default;
      }
    }
    
    // Generate timeline based on target date
    const now = new Date();
    const target = new Date(targetDate);
    const totalDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    const daysPerMilestone = Math.floor(totalDays / milestones.length);
    
    return milestones.map((title, index) => ({
      Id: Date.now() + index, // Temporary ID for new milestones
      title,
      completed: false,
      targetDate: new Date(now.getTime() + (daysPerMilestone * (index + 1) * 24 * 60 * 60 * 1000)).toISOString(),
      completedDate: null
    }));
  }
};