import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { DifficultyCard } from '../components/home/DifficultyCard';
import { Dumbbell, User, LogOut } from 'lucide-react';

const difficultyLevels = [
  {
    title: "Beginner",
    description: "Perfect for those just starting their fitness journey",
    icon: <Dumbbell size={24} className="text-buddy-purple" />,
    level: "easy",
    exercises: ["Basic Squats", "Push-ups", "Plank"]
  },
  {
    title: "Intermediate",
    description: "For those with some experience looking to challenge themselves",
    icon: <Dumbbell size={24} className="text-buddy-purple" />,
    level: "medium",
    exercises: ["Jump Squats", "Diamond Push-ups", "Mountain Climbers"]
  },
  {
    title: "Advanced",
    description: "Intense workouts for experienced fitness enthusiasts",
    icon: <Dumbbell size={24} className="text-buddy-purple" />,
    level: "hard",
    exercises: ["Burpees", "Pull-ups", "Box Jumps"]
  }
];

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Add logout logic here
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-buddy-purple-light/30 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Dumbbell size={28} className="text-buddy-purple" />
            <h1 className="text-2xl font-bold gradient-text">FitSync</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="flex items-center gap-2" onClick={() => navigate("/profile")}>
              <User size={18} />
              <span className="hidden sm:inline">Profile</span>
            </Button>
            <Button variant="outline" className="flex items-center gap-2" onClick={handleLogout}>
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <section className="mb-10">
            <h2 className="text-3xl font-bold mb-2">Welcome to FitSync</h2>
            <p className="text-gray-600 mb-6">
              Choose a difficulty level below to start your workout session. You can create
              a room and invite a buddy, or join an existing room.
            </p>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {difficultyLevels.map((level) => (
                <DifficultyCard 
                  key={level.title}
                  title={level.title}
                  description={level.description}
                  icon={level.icon}
                  level={level.level}
                  exercises={level.exercises}
                />
              ))}
            </div>
          </section>
          
          <section>
            <div className="bg-buddy-purple/10 rounded-lg p-6 flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Ready for a quick session?</h3>
                <p className="text-gray-600 mb-4">
                  Join our community workout room with random exercises tailored to your fitness level.
                </p>
                <Button className="bg-buddy-orange hover:bg-buddy-orange/90">
                  Quick Match
                </Button>
              </div>
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-md animate-pulse-scale">
                <Dumbbell size={48} className="text-buddy-purple" />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Home;
