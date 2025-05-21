import { tensor1d, sum, mul, norm, dispose } from '@tensorflow/tfjs';

interface Point3D {
  x: number;
  y: number;
  z: number;
}

type Pose = Point3D[];
type PoseSequence = Pose[];

export function calculateJointWeights(referencePoses: PoseSequence): number[] {
  const numJoints = 33; // MediaPipe model joints
  const jointDisplacements = new Array(numJoints).fill(0);

  for (let j = 0; j < numJoints; j++) {
    // Extract coordinates for this joint across all frames
    const coords = referencePoses.map(frame => frame[j]);
    
    // Calculate differences between consecutive frames
    const diffs = [];
    for (let i = 1; i < coords.length; i++) {
      const dx = coords[i].x - coords[i-1].x;
      const dy = coords[i].y - coords[i-1].y;
      const dz = coords[i].z - coords[i-1].z;
      diffs.push(Math.sqrt(dx*dx + dy*dy + dz*dz));
    }
    
    // Sum all displacements for this joint
    jointDisplacements[j] = diffs.reduce((sum, val) => sum + val, 0);
  }

  // Calculate weights by normalizing displacements
  const totalDisplacement = jointDisplacements.reduce((sum, val) => sum + val, 0);
  return jointDisplacements.map(disp => disp / totalDisplacement);
}

export function weightedCosineSimilarity(
  refVec: number[],
  userVec: number[],
  weights: number[]
): number {
  // Convert arrays to tensors for efficient computation
  const refTensor = tensor1d(refVec);
  const userTensor = tensor1d(userVec);
  const weightsTensor = tensor1d(weights);

  // Calculate weighted dot product
  const dot = sum(mul(mul(weightsTensor, refTensor), userTensor));

  // Calculate weighted norms
  const normRef = norm(mul(weightsTensor, refTensor));
  const normUser = norm(mul(weightsTensor, userTensor));

  // Calculate similarity with small epsilon to prevent division by zero
  const similarity = dot.div(normRef.mul(normUser).add(1e-8));

  // Get the result as a number
  const result = similarity.dataSync()[0];

  // Clean up tensors
  dispose([refTensor, userTensor, weightsTensor, dot, normRef, normUser, similarity]);

  return result;
} 