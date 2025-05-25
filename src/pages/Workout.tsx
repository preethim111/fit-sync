
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dumbbell, ArrowLeft, Volume2, Volume1, VolumeX, Play, Pause } from "lucide-react";
import VideoContainer from "@/components/workout/VideoContainer";
import ScoreFeedback from "@/components/workout/ScoreFeedback";

const Workout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const difficulty = searchParams.get("difficulty") || "medium";
  
  const [volume, setVolume] = useState<"high" | "low" | "muted">("high");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  
  // Exercise list based on difficulty
  const exercises = {
    easy: ["Basic Squats", "Modified Push-Ups", "Lunges", "Planks"],
    medium: ["Jump Squats", "Push-Ups", "Split Lunges", "Side Planks"],
    hard: ["Burpees", "Pike Push-Ups", "Pistol Squats", "Plank Reach Outs"]
  };
  
  const exerciseList = exercises[difficulty as keyof typeof exercises];
  
  const handleVolumeToggle = () => {
    if (volume === "high") setVolume("low");
    else if (volume === "low") setVolume("muted");
    else setVolume("high");
  };
  
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    
    // If playing, start a timer to show feedback after 10 seconds
    if (!isPlaying) {
      setTimeout(() => {
        setIsPlaying(false);
        setShowFeedback(true);
      }, 10000); // 10 seconds
    }
  };
  
  const handleNextExercise = () => {
    setShowFeedback(false);
    if (currentExercise < exerciseList.length - 1) {
      setCurrentExercise(currentExercise + 1);
    } else {
      // Workout completed
      navigate("/home");
    }
  };
  
  const handleTryAgain = () => {
    setShowFeedback(false);
    setIsPlaying(false);
  };
  
  const getVolumeIcon = () => {
    if (volume === "high") return <Volume2 size={20} />;
    if (volume === "low") return <Volume1 size={20} />;
    return <VolumeX size={20} />;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full" 
              onClick={() => navigate("/home")}
            >
              <ArrowLeft size={20} />
            </Button>
            <div className="flex items-center gap-2">
              <Dumbbell size={24} className="text-buddy-purple" />
              <h1 className="text-xl font-bold gradient-text">FitSync</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm bg-buddy-purple/10 px-3 py-1 rounded-full text-buddy-purple font-medium">
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Level
            </span>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold mb-1">
            {showFeedback ? "Exercise Feedback" : `Exercise: ${exerciseList[currentExercise]}`}
          </h2>
          <p className="text-gray-600">
            {showFeedback 
              ? "Review your performance and continue when ready" 
              : `${currentExercise + 1} of ${exerciseList.length} - Follow the reference video and match the movements`
            }
          </p>
        </div>
        
        {!showFeedback ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 h-[500px]">
            <VideoContainer type="user" label="You" />
            <VideoContainer type="reference" label="Reference Video" />
            <VideoContainer type="buddy" label="Your Buddy" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="md:col-span-2 h-[400px] grid grid-cols-1 md:grid-cols-2 gap-4">
              <VideoContainer type="user" label="Your Performance" />
              <VideoContainer type="reference" label="Reference Video" />
            </div>
            <div>
              <ScoreFeedback 
                exerciseName={exerciseList[currentExercise]}
                onNextExercise={handleNextExercise}
                onTryAgain={handleTryAgain}
              />
            </div>
          </div>
        )}
        
        {!showFeedback && (
          <div className="flex justify-center gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full w-12 h-12" 
              onClick={handleVolumeToggle}
            >
              {getVolumeIcon()}
            </Button>
            <Button 
              className="rounded-full w-16 h-16 bg-buddy-purple hover:bg-buddy-purple-dark"
              onClick={handlePlayPause}
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Workout;
