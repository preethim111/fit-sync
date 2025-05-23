import { tensor1d, tensor3d, sum, mul, norm, dispose } from '@tensorflow/tfjs';

// export interface Point3D [
//   number;
//   number;
//   z: number;
//   visibility: number;
// ]

// export type Pose = number[][][];
export type PoseSequence = number[][][];

export function calculateJointWeights(referencePoses: PoseSequence): number[] {
  const numJoints = 12; // MediaPipe model joints
  const jointDisplacements = new Array(numJoints).fill(0);

  for (let j = 0; j < numJoints; j++) {
    // Extract coordinates for this joint across all frames
    const coords = referencePoses.map(frame => frame[j]);
    
    // Calculate differences between consecutive frames
    const diffs = [];
    for (let i = 1; i < coords.length; i++) {
      const dx = coords[i][0] - coords[i-1][0];
      const dy = coords[i][1] - coords[i-1][1];
      const dz = coords[i][2] - coords[i-1][2];
      diffs.push(Math.sqrt(dx*dx + dy*dy + dz*dz));
    }
    
    // Sum all displacements for this joint
    jointDisplacements[j] = diffs.reduce((sum, val) => sum + val, 0);
  }

  // Calculate weights by normalizing displacements
  const totalDisplacement = jointDisplacements.reduce((sum, val) => sum + val, 0);
  return jointDisplacements.map(disp => disp / totalDisplacement);
}


// export function weightedCosineSimilarity(
//   refVec: number[][][],
//   userVec: number[][][],
//   weights: number[]
// ): number {
//   // Expand weights: each joint's weight is repeated for x, y, z, visibility
//   // const weightsExpanded = weights.map(w => [[w, w, w]]);

//   const weightsExpanded = Array(weights.length*3).flatMap(() =>
//     weights.flatMap(w => [w, w, w]) // or [w, w, w, w] if visibility is included
//   );

//   // if (weightsExpanded.length !== refVec.length || refVec.length !== userVec.length) {
//   //   throw new Error(`Vector length mismatch: ref=${refVec.length}, user=${userVec.length}, weights=${weightsExpanded.length}`);
//   // }

//   // Convert arrays to tensors for efficient computation
//   const refTensor = tensor3d(refVec);
//   const userTensor = tensor3d(userVec);
//   const weightsTensor = tensor3d(weightsExpanded);

//   // Calculate weighted dot product
//   const dot = sum(mul(mul(weightsTensor, refTensor), userTensor));

//   // Calculate weighted norms
//   const normRef = norm(mul(weightsTensor, refTensor));
//   const normUser = norm(mul(weightsTensor, userTensor));

//   // Calculate similarity with small epsilon to prevent division by zero
//   const similarity = dot.div(normRef.mul(normUser).add(1e-8));

//   // Get the result as a number
//   const result = similarity.dataSync()[0];

//   // Clean up tensors
//   dispose([refTensor, userTensor, weightsTensor, dot, normRef, normUser, similarity]);

//   return result;
// }


export function weightedCosineSimilarity(
  refVec: number[][][],   // shape: [frames][joints][3]
  userVec: number[][][],  // shape: [frames][joints][3]
  weights: number[]       // length: numJoints
): number {
  const numFrames = refVec.length;
  const numJoints = weights.length;

  // Expand weights to match shape [frames][joints][3]
  const weightsExpanded: number[][][] = [];
  for (let f = 0; f < numFrames; f++) {
    const frameWeights: number[][] = [];
    for (let j = 0; j < numJoints; j++) {
      const w = weights[j];
      frameWeights.push([w, w, w]); // [x, y, z]
    }
    weightsExpanded.push(frameWeights);
  }

  // Convert to tensors
  const refTensor = tensor3d(refVec);
  const userTensor = tensor3d(userVec);
  const weightsTensor = tensor3d(weightsExpanded);

  // Compute weighted dot product
  const dot = sum(mul(mul(weightsTensor, refTensor), userTensor));

  // Compute norms
  const normRef = norm(mul(weightsTensor, refTensor));
  const normUser = norm(mul(weightsTensor, userTensor));

  const similarity = dot.div(normRef.mul(normUser).add(1e-8));
  const result = similarity.dataSync()[0];

  dispose([refTensor, userTensor, weightsTensor, dot, normRef, normUser, similarity]);

  return result;
}
