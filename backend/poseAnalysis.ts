import { tensor1d, tensor3d, sum, mul, norm, dispose } from '@tensorflow/tfjs';

// Define the limb vectors (connections between joints)
const LIMB_VECTORS = [
  ["LEFT_WRIST", "LEFT_ELBOW"],
  ["LEFT_ELBOW", "LEFT_SHOULDER"],
  ["LEFT_SHOULDER", "RIGHT_SHOULDER"],
  ["RIGHT_WRIST", "RIGHT_ELBOW"],
  ["RIGHT_ELBOW", "RIGHT_SHOULDER"],
  ["LEFT_SHOULDER", "LEFT_HIP"],
  ["RIGHT_SHOULDER", "RIGHT_HIP"],
  ["LEFT_HIP", "RIGHT_HIP"],
  ["LEFT_HIP", "LEFT_KNEE"],
  ["LEFT_KNEE", "LEFT_ANKLE"],
  ["RIGHT_HIP", "RIGHT_KNEE"],
  ["RIGHT_KNEE", "RIGHT_ANKLE"]
] as const;

// export type PoseSequence = number[][][];

// export function calculateJointWeights(referencePoses: PoseSequence): number[] {
//   const numJoints = 12; // MediaPipe model joints
//   const jointDisplacements = new Array(numJoints).fill(0);

//   for (let j = 0; j < numJoints; j++) {
//     // Extract coordinates for this joint across all frames
//     const coords = referencePoses.map(frame => frame[j]);
    
//     // Calculate differences between consecutive frames
//     const diffs = [];
//     for (let i = 1; i < coords.length; i++) {
//       const dx = coords[i][0] - coords[i-1][0];
//       const dy = coords[i][1] - coords[i-1][1];
//       const dz = coords[i][2] - coords[i-1][2];
//       diffs.push(Math.sqrt(dx*dx + dy*dy + dz*dz));
//     }
    
//     // Sum all displacements for this joint
//     jointDisplacements[j] = diffs.reduce((sum, val) => sum + val, 0);
//   }



//   // Calculate weights by normalizing displacements
//   const totalDisplacement = jointDisplacements.reduce((sum, val) => sum + val, 0);
//   return jointDisplacements.map(disp => disp / totalDisplacement);
// }

////////////////////////////////////////////////////////////
export type PoseSequence = number[][][];
export type VisibilityMatrix = number[][];

// Calculate normalized limb vectors for a single frame
function calculateLimbVectors(frame: number[][], visibility: number[]): number[][] {
  const limbVectors: number[][] = [];
  
  LIMB_VECTORS.forEach(([fromJoint, toJoint], index) => {
    const fromIndex = index * 2;
    const toIndex = index * 2 + 1;
    
    // Check if both joints are visible
    if (visibility[fromIndex] >= 0.5 && visibility[toIndex] >= 0.5) {
      const from = frame[fromIndex];
      const to = frame[toIndex];
      
      // Calculate vector between joints
      const vector = [
        to[0] - from[0],
        to[1] - from[1],
        to[2] - from[2]
      ];
      
      // Normalize the vector
      const magnitude = Math.sqrt(
        vector[0] * vector[0] + 
        vector[1] * vector[1] + 
        vector[2] * vector[2]
      );
      
      if (magnitude > 0) {
        limbVectors.push([
          vector[0] / magnitude,
          vector[1] / magnitude,
          vector[2] / magnitude
        ]);
      } else {
        limbVectors.push([0, 0, 0]);
      }
    } else {
      limbVectors.push([0, 0, 0]);
    }
  });
  
  return limbVectors;
}

export function calculateJointWeights(
  referencePoses: PoseSequence,
  userVisibility: VisibilityMatrix,
  visibleThreshold = 0.5,
  visibilityCutoffRatio = 0.4
): number[] {
  const numFrames = referencePoses.length;
  const numLimbs = LIMB_VECTORS.length;
  const limbDisplacements = new Array(numLimbs).fill(0);

  for (let l = 0; l < numLimbs; l++) {
    const diffs: number[] = [];
    const [fromJoint, toJoint] = LIMB_VECTORS[l];
    const fromIndex = l * 2;
    const toIndex = l * 2 + 1;

    // For each frame:
    for (let i = 1; i < numFrames; i++) {
      // 1. Check visibility
      const fromVisible = userVisibility[i][fromIndex] >= visibleThreshold && 
                         userVisibility[i-1][fromIndex] >= visibleThreshold;
      const toVisible = userVisibility[i][toIndex] >= visibleThreshold && 
                       userVisibility[i-1][toIndex] >= visibleThreshold;
      
      if (!fromVisible || !toVisible) continue;

      // 2. Calculate normalized vectors for current and previous frame
      const prevFrame = referencePoses[i-1];
      const currFrame = referencePoses[i];
      // fills in with 1s if the joint is visible 
      const prevVector = calculateLimbVectors(prevFrame, Array(prevFrame.length).fill(1));
      const currVector = calculateLimbVectors(currFrame, Array(currFrame.length).fill(1));

      // 3. Calculate difference between normalized vectors using Euclidean distance
      const diff = Math.sqrt(
        Math.pow(currVector[0][0] - prevVector[0][0], 2) +
        Math.pow(currVector[0][1] - prevVector[0][1], 2) +
        Math.pow(currVector[0][2] - prevVector[0][2], 2)
      );

      // 4. Add to diffs array
      diffs.push(diff);
    }

    // Sum all differences for this limb 
    limbDisplacements[l] = diffs.reduce((sum, val) => sum + val, 0);
  }

  // Normalize weights --> sum of normalized differences are the weights
  const total = limbDisplacements.reduce((a, b) => a + b, 0);
  return total === 0
    ? limbDisplacements.map(() => 1 / numLimbs)
    : limbDisplacements.map(d => d / total);
}








export function weightedCosineSimilarity(
  refVec: number[][][],
  userVec: number[][][],
  weights: number[]
): number {
  const numFrames = refVec.length;
  const numLimbs = LIMB_VECTORS.length;
  
  // Convert joint positions to limb vectors
  const refLimbVectors: number[][][] = [];
  const userLimbVectors: number[][][] = [];
  
  for (let f = 0; f < numFrames; f++) {
    refLimbVectors.push(calculateLimbVectors(refVec[f], Array(refVec[f].length).fill(1)));
    userLimbVectors.push(calculateLimbVectors(userVec[f], Array(userVec[f].length).fill(1)));
  }
  
  // Expand weights to match shape [frames][limbs][3]
  const weightsExpanded: number[][][] = [];
  for (let f = 0; f < numFrames; f++) {
    const frameWeights: number[][] = [];
    for (let l = 0; l < numLimbs; l++) {
      const w = weights[l];
      frameWeights.push([w, w, w]); // [x, y, z]
    }
    weightsExpanded.push(frameWeights);
  }

  // Convert to tensors
  const refTensor = tensor3d(refLimbVectors);
  const userTensor = tensor3d(userLimbVectors);
  const weightsTensor = tensor3d(weightsExpanded);

  // Apply weights to both vectors
  const weightedRef = mul(weightsTensor, refTensor);
  const weightedUser = mul(weightsTensor, userTensor);

  // Compute dot product and norms
  const dot = sum(mul(weightedRef, weightedUser));
  const normRef = norm(weightedRef);
  const normUser = norm(weightedUser);

  // Compute similarity
  const similarity = dot.div(normRef.mul(normUser).add(1e-8)); // avoid /0
  const result = similarity.dataSync()[0];

  dispose([refTensor, userTensor, weightsTensor, dot, weightedRef, weightedUser, similarity]);

  return result;
}
