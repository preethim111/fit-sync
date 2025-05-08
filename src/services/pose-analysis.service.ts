import { Pose, PoseAnalysisResult, PoseComparisonConfig } from '@/types/pose';

export class PoseAnalysisService {
  private config: PoseComparisonConfig;

  constructor(config: PoseComparisonConfig) {
    this.config = {
      epsilon: 1e-8,
      ...config,
    };
  }

  /**
   * Calculate joint displacements and weights from a sequence of poses
   */
  private calculateJointWeights(referencePoses: Pose[]): number[] {
    const { numJoints } = this.config;
    const jointDisplacements = new Array(numJoints).fill(0);

    // Calculate displacements for each joint
    for (let j = 0; j < numJoints; j++) {
      const coords = referencePoses.map(pose => [
        pose.landmarks[j].x,
        pose.landmarks[j].y,
        pose.landmarks[j].z,
      ]);

      // Calculate differences between consecutive frames
      for (let i = 1; i < coords.length; i++) {
        const dx = coords[i][0] - coords[i - 1][0];
        const dy = coords[i][1] - coords[i - 1][1];
        const dz = coords[i][2] - coords[i - 2][2];
        const displacement = Math.sqrt(dx * dx + dy * dy + dz * dz);
        jointDisplacements[j] += displacement;
      }
    }

    // Calculate weights
    const totalDisplacement = jointDisplacements.reduce((sum, d) => sum + d, 0);
    return jointDisplacements.map(d => d / totalDisplacement);
  }

  /**
   * Calculate weighted cosine similarity between two pose vectors
   */
  private weightedCosineSimilarity(
    refVec: number[],
    userVec: number[],
    weights: number[]
  ): number {
    const { epsilon } = this.config;

    // Calculate weighted dot product
    let dotProduct = 0;
    for (let i = 0; i < refVec.length; i++) {
      dotProduct += weights[i] * refVec[i] * userVec[i];
    }

    // Calculate weighted norms
    let refNorm = 0;
    let userNorm = 0;
    for (let i = 0; i < refVec.length; i++) {
      refNorm += weights[i] * refVec[i] * refVec[i];
      userNorm += weights[i] * userVec[i] * userVec[i];
    }
    refNorm = Math.sqrt(refNorm);
    userNorm = Math.sqrt(userNorm);

    return dotProduct / (refNorm * userNorm + epsilon);
  }

  /**
   * Compare a user's pose sequence with a reference pose sequence
   */
  public comparePoseSequences(
    referencePoses: Pose[],
    userPoses: Pose[]
  ): PoseAnalysisResult {
    const jointWeights = this.calculateJointWeights(referencePoses);
    const jointDisplacements = jointWeights.map(w => w * 100); // Convert to percentage

    // Convert poses to vectors for comparison
    const refVec = this.poseSequenceToVector(referencePoses);
    const userVec = this.poseSequenceToVector(userPoses);

    // Calculate similarity
    const similarity = this.weightedCosineSimilarity(refVec, userVec, jointWeights);

    return {
      similarity,
      jointWeights,
      jointDisplacements,
    };
  }

  /**
   * Convert a sequence of poses to a single vector representation
   */
  private poseSequenceToVector(poses: Pose[]): number[] {
    const { numJoints } = this.config;
    const vector: number[] = [];

    // For each joint, calculate the average position
    for (let j = 0; j < numJoints; j++) {
      let sumX = 0, sumY = 0, sumZ = 0;
      for (const pose of poses) {
        sumX += pose.landmarks[j].x;
        sumY += pose.landmarks[j].y;
        sumZ += pose.landmarks[j].z;
      }
      const n = poses.length;
      vector.push(sumX / n, sumY / n, sumZ / n);
    }

    return vector;
  }
} 