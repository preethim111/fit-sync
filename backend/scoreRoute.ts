import { calculateJointWeights, weightedCosineSimilarity, PoseSequence, VisibilityMatrix } from './poseAnalysis';
import { Router, Request, Response } from 'express';
import { supabase } from './supabaseClient';

const router = Router();

// Define valid difficulty levels
const VALID_DIFFICULTY_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;
type DifficultyLevel = typeof VALID_DIFFICULTY_LEVELS[number];

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Received POST to /api/score');

    const { user_id, reference_poses, user_poses, difficulty_level, visibility_matrix } = req.body;

    if (!reference_poses || !user_poses) {
      res.status(400).json({ error: 'Missing required fields: reference_poses and user_poses' });
      return;
    }

    const jointWeights = calculateJointWeights(reference_poses, visibility_matrix);
    console.log('Joint Weights:', jointWeights);

    const refVec = reference_poses;
    const userVec = user_poses;

    console.log('Reference Vector:', refVec);
    console.log('User Vector:', userVec);

    if (refVec.length !== userVec.length) {
      res.status(400).json({ error: 'Reference and user vectors must have the same length' });
      return;
    }

    const score = weightedCosineSimilarity(refVec, userVec, jointWeights);
    console.log('Computed score:', score);

    // Map difficulty levels to match database constraint
    const difficultyMap: { [key: string]: DifficultyLevel } = {
      'easy': 'BEGINNER',
      'medium': 'INTERMEDIATE',
      'hard': 'ADVANCED'
    };

    const formattedDifficulty = difficultyMap[difficulty_level.toLowerCase()];
    console.log('Original difficulty:', difficulty_level);
    console.log('Formatted difficulty:', formattedDifficulty);

    if (!formattedDifficulty) {
      res.status(400).json({ error: 'Invalid difficulty level' });
      return;
    }

    // Insert new performance record
    const { error: insertError } = await supabase
      .from('userperformance')
      .insert({
        user_id,
        most_recent_score: score,
        submitted_at: new Date().toISOString(),
        difficulty_level: formattedDifficulty
      });

    if (insertError) {
      console.error('Error inserting performance record:', insertError);
      res.status(500).json({ error: 'Failed to save performance record' });
      return;
    }

    // Get best score
    const { data: bestScoreData, error: bestScoreError } = await supabase
      .from('userperformance')
      .select('most_recent_score')
      .eq('user_id', user_id)
      .order('most_recent_score', { ascending: false })
      .limit(1)
      .single();

      
    if (bestScoreError) {
      console.error('Error fetching best score:', bestScoreError);
    }

    const bestScore = bestScoreData?.most_recent_score || score;

    await supabase
      .from('userperformance')
      .update({ best_score: bestScore })
      .match({
        user_id,
        difficulty_level: formattedDifficulty
      });


    console.log('Returning scores:', { score, bestScore });
    res.status(200).json({ score, bestScore });

  } catch (err) {
    console.error('Internal error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
