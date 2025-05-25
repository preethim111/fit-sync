import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, ArrowLeft } from "lucide-react";
import { useAuth } from "@/auth/context/AuthContext";
import { supabase } from "@/lib/supabase";

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recentScore, setRecentScore] = useState<number | null>(null);
  const [bestScore, setBestScore] = useState<number | null>(null);

  console.log('User:', user);
  useEffect(() => {
    const fetchScores = async () => {
      
      if (!user?.id) return;
      
      console.log('Fetching scores for:', user.id);

      try {
        // Fetch recent score
        const { data: recentData, error: recentError } = await supabase
          .from('userperformance')
          .select('most_recent_score, submitted_at')
          .eq('user_id', user.id)
          .order('submitted_at', { ascending: false })
          .limit(1);

        console.log('Recent Data:', recentData);
        console.log('Recent Error:', recentError);
        if (!recentError && recentData && recentData.length > 0) {
          setRecentScore(recentData[0].most_recent_score);
        }

        // Fetch best score
        const { data: bestData, error: bestError } = await supabase
          .from('userperformance')
          .select('most_recent_score')
          .eq('user_id', user.id)
          .order('most_recent_score', { ascending: false })
          .limit(1);

        if (!bestError && bestData && bestData.length > 0) {
          setBestScore(bestData[0].most_recent_score);
        }
      } catch (error) {
        console.error('Error fetching scores:', error);
      }
    };

    fetchScores();
  }, [user?.id]);

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-buddy-purple-light/30 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
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
              <h1 className="text-xl font-bold gradient-text">Profile</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
                {/* <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{user?.user_metadata?.name || 'Not set'}</p>
                </div> */}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Most Recent Score</p>
                  <p className="font-medium text-2xl">
                    {recentScore !== null ? recentScore.toFixed(2) : 'No scores yet'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Best Score</p>
                  <p className="font-medium text-2xl">
                    {bestScore !== null ? bestScore.toFixed(2) : 'No scores yet'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile; 