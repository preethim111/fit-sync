import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/auth/context/AuthContext';
import { Zap, Activity, Flame } from 'lucide-react';

interface WorkoutCounts {
  BEGINNER: number;
  INTERMEDIATE: number;
  ADVANCED: number;
}

const WorkoutCountCard = () => {
  const [workoutCounts, setWorkoutCounts] = useState<WorkoutCounts>({
    BEGINNER: 0,
    INTERMEDIATE: 0,
    ADVANCED: 0
  });
  const { user } = useAuth();

  useEffect(() => {
    const fetchWorkoutCounts = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('userperformance')
          .select('difficulty_level')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching workout counts:', error);
          return;
        }

        if (data) {
          const counts = data.reduce((acc, workout) => {
            acc[workout.difficulty_level as keyof WorkoutCounts]++;
            return acc;
          }, { BEGINNER: 0, INTERMEDIATE: 0, ADVANCED: 0 } as WorkoutCounts);

          setWorkoutCounts(counts);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchWorkoutCounts();
  }, [user?.id]);

  const difficultyCards = [
    {
      title: 'Beginner',
      count: workoutCounts.BEGINNER,
      icon: <Zap size={24} className="text-green-500" />,
      color: 'bg-green-50'
    },
    {
      title: 'Intermediate',
      count: workoutCounts.INTERMEDIATE,
      icon: <Activity size={24} className="text-blue-500" />,
      color: 'bg-blue-50'
    },
    {
      title: 'Advanced',
      count: workoutCounts.ADVANCED,
      icon: <Flame size={24} className="text-red-500" />,
      color: 'bg-red-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {difficultyCards.map((card) => (
        <Card key={card.title} className={card.color}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{card.title}</CardTitle>
              {card.icon}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{card.count}</p>
            <p className="text-sm text-gray-500">workouts completed</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default WorkoutCountCard; 