// // scoreRoute.ts
// import { Request, Response, Router } from 'express';
// import { calculateJointWeights, weightedCosineSimilarity, PoseSequence } from './poseAnalysis';
// import { supabase } from './supabaseClient';

// // type PoseLandmark = { x: number; y: number; z: number; [key: string]: any };

// const router = Router();

// const KEYPOINTS = [
//   'LEFT_SHOULDER',
//   'RIGHT_SHOULDER',
//   'LEFT_ELBOW',
//   'RIGHT_ELBOW',
//   'LEFT_WRIST',
//   'RIGHT_WRIST',
//   'LEFT_HIP',
//   'RIGHT_HIP',
//   'LEFT_KNEE',
//   'RIGHT_KNEE',
//   'LEFT_ANKLE',
//   'RIGHT_ANKLE'
// ];

// router.post('/', async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { user_id, reference_poses, user_poses, video_reference, difficulty_level } = req.body;

//     // Debug: Print incoming data
//     console.log('--- Incoming /api/score request ---');
//     console.log('user_id:', user_id);
//     console.log('difficulty_level:', difficulty_level);
//     console.log('video_reference:', video_reference);
//     console.log('reference_poses type:', typeof reference_poses, 'length:', reference_poses?.length);
//     if (reference_poses && reference_poses.length > 0) {
//       console.log('Sample reference_poses[0]:', reference_poses[0]);
//     }
//     console.log('user_poses type:', typeof user_poses, 'length:', user_poses?.length);
//     if (user_poses && user_poses.length > 0) {
//       console.log('Sample user_poses[0]:', user_poses[0]);
//     }

//     if (!user_id || !reference_poses || !user_poses) {
//        res.status(400).json({ error: 'Missing required fields' });
//        return;
//     }

//     const jointWeights = calculateJointWeights(reference_poses as PoseSequence);
//     // const flatten = (poses: PoseSequence) => poses.flat().flatMap(j => [j[0], j[1], j[2]]);
//     const refVec = reference_poses;
//     console.log(refVec)
//     const userVec = user_poses;
//     console.log(userVec)
//     const score = weightedCosineSimilarity(refVec, userVec, jointWeights);
//     console.log(score)

//     const { data: perf } = await supabase
//       .from('userperformance')
//       .select('id, best_score')
//       .eq('user_id', user_id)
//       .maybeSingle();

//     let best_score = score;
//     if (perf?.best_score != null) {
//       best_score = Math.max(score, perf.best_score);
//     }

//     const { error: upsertError } = await supabase
//       .from('userperformance')
//       .upsert({
//         user_id,
//         difficulty_level,
//         most_recent_score: score,
//         best_score,
//         video_reference
//       }, { onConflict: 'user_id' });

//     if (upsertError) {
//        res.status(500).json({ error: upsertError.message });
//     }

//     // Debug: Print computed scores
    
//     console.log('Computed score:', score, 'Best score:', best_score);

//     res.status(200).json({ score, best_score });
//     return;
//   } catch (err) {
//     console.error('Error in /api/score:', err);
//     res.status(500).json({ error: 'Internal server error' });
//     return;
//   }
// });

// function cleanPoseSequence(sequence: PoseLandmark[][]): PoseLandmark[][] {
//   return sequence.map((frame: PoseLandmark[]) => {
//     // Only keep the keypoints we care about
//     return KEYPOINTS.map(keypoint => {
//       const landmark = frame.find(lm => lm.name === keypoint);
//       return landmark ? { x: landmark.x, y: landmark.y, z: landmark.z } : null;
//     }).filter(Boolean) as PoseLandmark[];
//   });
// }

// export default router;


import { calculateJointWeights, weightedCosineSimilarity, PoseSequence } from './poseAnalysis';
import { Router, Request, Response } from 'express';

const router = Router();


router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Received POST to /api/score');

    const { user_id, reference_poses, user_poses, video_reference, difficulty_level } = req.body;

    if (!reference_poses || !user_poses) {
      res.status(400).json({ error: 'Missing required fields: reference_poses and user_poses' });
      return;
    }

    const jointWeights = calculateJointWeights(reference_poses);
    const flatten = (poses: PoseSequence) =>
      poses.flat().flatMap(p => [p[0], p[1], p[2]]);

    const refVec = reference_poses;
    const userVec = user_poses;

    console.log(`refVec.length = ${refVec.length}`);
    console.log(`userVec.length = ${userVec.length}`);
    console.log(`jointWeights.length = ${jointWeights.length}`);
    console.log(`Expected expanded weights length: ${jointWeights.length * 3}`);


    if (refVec.length !== userVec.length) {
      res.status(400).json({ error: 'Reference and user vectors must have the same length' });
      return;
    }

    const score = weightedCosineSimilarity(refVec, userVec, jointWeights);

    console.log('Returning score:', score);
    res.status(200).json({ score });

  } catch (err) {
    console.error('Internal error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
  //hello
});


export default router;
