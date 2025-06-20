
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dumbbell, User, LogOut, Zap, Activity, Flame } from "lucide-react";
import DifficultyCard from "@/components/home/DifficultyCard";

const Home = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    // For demo purposes, just navigate back to login
    navigate("/");
  };

  const difficultyLevels = [
    {
      title: "Beginner",
      description: "Perfect for those new to fitness or getting back into it.",
      icon: <Zap size={24} className="text-green-500" />,
      level: "easy" as const,
      exercises: ["Squats", "Push-Ups (Modified)", "Lunges", "Planks (30s)"]
    },
    {
      title: "Intermediate",
      description: "For those with some fitness experience looking to progress.",
      icon: <Activity size={24} className="text-blue-500" />,
      level: "medium" as const,
      exercises: ["Jump Squats", "Push-Ups", "Split Lunges", "Side Planks"]
    },
    {
      title: "Advanced",
      description: "Challenging workouts for fitness enthusiasts.",
      icon: <Flame size={24} className="text-red-500" />,
      level: "hard" as const,
      exercises: ["Burpees", "Pike Push-Ups", "Pistol Squats", "Plank Reach Outs"]
    }
  ];

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
              Choose a difficulty level below to start your workout session. Perfect your form and get stronger with our advanced AI powered similarity feedback algorithm.
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
              <h3 className="text-xl font-bold mb-2">Train with confidence, wherever you're at.</h3>
              <p className="text-gray-600 mb-4">
                Whether you're just getting started or pushing your limits, form matters and confidence does too.
                Over <span className="font-semibold">50% of people</span> say they’ve felt too intimidated or unsure to step into a gym.
                That’s why we built this app: to help you refine your movement, build trust in your body, and level up at your own pace.
                <br />
                <br />
                From your first squat to your next PR — <span className="font-semibold">we got you</span>. Welcome to the FitSync community!
              </p>
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
