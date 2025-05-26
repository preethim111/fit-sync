
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface DifficultyCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  level: "easy" | "medium" | "hard";
  exercises: string[];
}

const DifficultyCard = ({ title, description, icon, level, exercises }: DifficultyCardProps) => {
  const navigate = useNavigate();
  
  const cardColors = {
    easy: "bg-green-50 border-green-200 hover:bg-green-100",
    medium: "bg-blue-50 border-blue-200 hover:bg-blue-100",
    hard: "bg-red-50 border-red-200 hover:bg-red-100"
  };
  
  const buttonColors = {
    easy: "bg-green-500 hover:bg-green-600",
    medium: "bg-blue-500 hover:bg-blue-600",
    hard: "bg-red-500 hover:bg-red-600"
  };

  const handleCreateRoom = () => {
    // For demo purposes, just navigate to workout page with the difficulty
    console.log('hello');
    navigate(`/workout?difficulty=${level}`);
  };

  return (
    <Card className={`card-hover ${cardColors[level]} transition-all duration-300`}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-full p-2 bg-white">{icon}</div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-600">
          <p className="font-medium mb-1">Includes:</p>
          <ul className="list-disc pl-5 space-y-1">
            {exercises.map((exercise, index) => (
              <li key={index}>{exercise}</li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button 
          className={`w-full ${buttonColors[level]}`} 
          onClick={handleCreateRoom}
        >
          Start Workout
        </Button>
        
      </CardFooter>
    </Card>
  );
};

export default DifficultyCard;
