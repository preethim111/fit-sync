import { useState } from 'react';
import WorkoutTracker from '@/components/workout/WorkoutTracker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const exercises = [
  {
    id: 'squat',
    name: 'Squat',
    difficulty: 'easy' as const,
    videoUrl: '/videos/squat.mp4',
  },
  {
    id: 'pushup',
    name: 'Push-up',
    difficulty: 'medium' as const,
    videoUrl: '/videos/pushup.mp4',
  },
  {
    id: 'plank',
    name: 'Plank',
    difficulty: 'hard' as const,
    videoUrl: '/videos/plank.mp4',
  },
];

const WorkoutPage = () => {
  const [selectedExercise, setSelectedExercise] = useState(exercises[0]);

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Select Your Exercise</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedExercise.id}
            onValueChange={(value) => {
              const exercise = exercises.find((e) => e.id === value);
              if (exercise) setSelectedExercise(exercise);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select exercise" />
            </SelectTrigger>
            <SelectContent>
              {exercises.map((exercise) => (
                <SelectItem key={exercise.id} value={exercise.id}>
                  {exercise.name} ({exercise.difficulty})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <WorkoutTracker
        referenceVideo={selectedExercise.videoUrl}
        difficulty={selectedExercise.difficulty}
        exerciseName={selectedExercise.name}
      />
    </div>
  );
};

export default WorkoutPage; 