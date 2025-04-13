
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Check, RefreshCcw } from "lucide-react";

interface ScoreFeedbackProps {
  exerciseName: string;
  onNextExercise: () => void;
  onTryAgain: () => void;
}

const ScoreFeedback = ({ exerciseName, onNextExercise, onTryAgain }: ScoreFeedbackProps) => {
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  
  // Simulate a score calculation
  useEffect(() => {
    // In a real app, this would come from the computer vision analysis
    const simulatedScore = Math.floor(Math.random() * 100);
    const timer = setTimeout(() => {
      setScore(simulatedScore);
      
      if (simulatedScore >= 80) {
        setFeedback("Great job! Your form is excellent!");
      } else if (simulatedScore >= 60) {
        setFeedback("Good effort! Try to keep your movements more controlled.");
      } else {
        setFeedback("Keep practicing! Focus on matching the reference video more closely.");
      }
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [exerciseName]);

  // Get color based on score
  const getScoreColor = () => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };
  
  // Get progress color based on score
  const getProgressColor = () => {
    if (score >= 80) return "bg-green-600";
    if (score >= 60) return "bg-yellow-600";
    return "bg-red-600";
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Exercise: {exerciseName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Similarity Score:</span>
          <span className={`text-2xl font-bold ${getScoreColor()}`}>{score}%</span>
        </div>
        
        <Progress value={score} className={getProgressColor()} />
        
        <div className="bg-muted p-3 rounded-md text-sm">
          <p>{feedback}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2" 
            onClick={onTryAgain}
          >
            <RefreshCcw size={16} />
            Try Again
          </Button>
          <Button 
            className="flex items-center gap-2 bg-buddy-purple hover:bg-buddy-purple-dark" 
            onClick={onNextExercise}
          >
            <Check size={16} />
            Next Exercise
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScoreFeedback;
