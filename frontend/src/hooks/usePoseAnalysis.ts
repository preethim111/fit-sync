import { useMemo } from 'react';
import { Pose, PoseAnalysisResult } from '@/types/pose';
import { PoseAnalysisService } from '@/services/pose-analysis.service';

interface UsePoseAnalysisProps {
  numJoints: number;
  epsilon?: number;
}

export const usePoseAnalysis = ({ numJoints, epsilon }: UsePoseAnalysisProps) => {
  const poseAnalysisService = useMemo(
    () => new PoseAnalysisService({ numJoints, epsilon }),
    [numJoints, epsilon]
  );

  const comparePoses = (
    referencePoses: Pose[],
    userPoses: Pose[]
  ): PoseAnalysisResult => {
    return poseAnalysisService.comparePoseSequences(referencePoses, userPoses);
  };

  return {
    comparePoses,
  };
}; 