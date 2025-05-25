import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import WorkoutTracker from '@/components/workout/WorkoutTracker';
import { Button } from '@/components/ui/button';
import { exerciseVideos, getVideosByDifficulty } from '@/config/exercises';
import { ArrowRight } from 'lucide-react';

const displayDifficultyMap = {
  'easy': 'Easy',
  'medium': 'Medium',
  'hard': 'Hard'
} as const;

const WorkoutPage = () => {
  const [searchParams] = useSearchParams();
  const difficultyParam = searchParams.get('difficulty')?.toLowerCase() || 'easy';
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  
  // Ensure difficulty is one of the valid values
  const selectedDifficulty = (difficultyParam === 'easy' || difficultyParam === 'medium' || difficultyParam === 'hard') 
    ? difficultyParam 
    : 'easy';
    
  const difficultyExercises = getVideosByDifficulty(selectedDifficulty);
  const currentExercise = difficultyExercises[currentExerciseIndex];

  const handleNextExercise = () => {
    setCurrentExerciseIndex((prev) => 
      prev === difficultyExercises.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {displayDifficultyMap[selectedDifficulty]} - {currentExercise?.name}
        </h2>
        <Button 
          onClick={handleNextExercise}
          className="flex items-center gap-2 bg-buddy-purple hover:bg-buddy-purple-dark"
        >
          Next Exercise
          <ArrowRight size={16} />
        </Button>
      </div>

      <WorkoutTracker
        exerciseName={currentExercise?.name || ''}
        difficulty={selectedDifficulty}
      />
    </div>
  );
};

export default WorkoutPage; 