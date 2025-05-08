import { Pose, PoseAnalysisResult } from '../types/pose';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export class PoseAnalysisService {
  async comparePoses(
    referencePoses: Pose[],
    userPoses: Pose[]
  ): Promise<PoseAnalysisResult> {
    try {
      const response = await fetch(`${API_URL}/api/compare-poses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          referencePoses: this.convertPosesToArray(referencePoses),
          userPoses: this.convertPosesToArray(userPoses),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to compare poses');
      }

      const result = await response.json();
      return {
        similarity: result.similarity,
        jointWeights: result.joint_weights,
        jointDisplacements: result.joint_displacements,
      };
    } catch (error) {
      console.error('Error comparing poses:', error);
      throw error;
    }
  }

  private convertPosesToArray(poses: Pose[]): number[][][] {
    return poses.map(pose => 
      pose.landmarks.map(landmark => [landmark.x, landmark.y, landmark.z])
    );
  }
} 