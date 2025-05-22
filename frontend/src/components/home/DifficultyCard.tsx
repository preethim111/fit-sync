import React from 'react';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';

interface DifficultyCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  level: string;
  exercises: string[];
}

export const DifficultyCard: React.FC<DifficultyCardProps> = ({
  title,
  description,
  icon,
  level,
  exercises
}) => {
  const navigate = useNavigate();

  const handleStartWorkout = () => {
    navigate(`/workout/${level}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <span className="text-2xl mr-2">{icon}</span>
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      <p className="text-gray-600 mb-4">{description}</p>
      <div className="mb-4">
        <h4 className="font-medium mb-2">Exercises:</h4>
        <ul className="list-disc list-inside text-gray-600">
          {exercises.map((exercise, index) => (
            <li key={index}>{exercise}</li>
          ))}
        </ul>
      </div>
      <Button 
        variant="default" 
        className="w-full"
        onClick={handleStartWorkout}
      >
        Start {level} Workout
      </Button>
    </div>
  );
};
