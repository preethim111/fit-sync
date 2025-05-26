import { useEffect, useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/auth/context/AuthContext';

interface ScoreData {
  submitted_at: string;
  most_recent_score: number;
}

const SimilarityScoreChart = () => {
  const [scoreData, setScoreData] = useState<ScoreData[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchScoreData = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('userperformance')
          .select('most_recent_score, submitted_at')
          .eq('user_id', user.id)
          .order('submitted_at', { ascending: false })
          .limit(12);

        if (error) {
          console.error('Error fetching score data:', error);
          return;
        }

        if (data) {
          // Reverse the data to show oldest to newest
          setScoreData(data.reverse());
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchScoreData();
  }, [user?.id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();
    const time = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    return `${month} ${day}, ${time}`;
  };

  const formatScore = (score: number) => {
    return (score * 100).toFixed(2) + '%';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Most Recent Similarity Scores</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{
                top: 20,
                right: 20,
                bottom: 60,
                left: 20,
              }}
            >
              <CartesianGrid />
              <XAxis
                dataKey="submitted_at"
                name="Date"
                tickFormatter={formatDate}
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis
                dataKey="most_recent_score"
                name="Similarity Score"
                tickFormatter={(value) => formatScore(value)}
                domain={[0, 1]}
              />
              {/* <Tooltip
                formatter={(value: number) => formatScore(value)}
                label="Similarity Score"
              /> */}
              
              <Scatter
                data={scoreData}
                fill="#8884d8"
                name="Similarity Score"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimilarityScoreChart; 