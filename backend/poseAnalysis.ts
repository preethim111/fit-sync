import { tensor1d, tensor3d, sum, mul, norm, dispose } from '@tensorflow/tfjs';


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

export function calculateJointWeights(
  referencePoses: PoseSequence,     // [frames][joints][3]
  userVisibility: VisibilityMatrix,       // [frames][joints]
  visibleThreshold = 0.5,
  visibilityCutoffRatio = 0.4
): number[] {
  console.log('User visibility:', userVisibility);
  const numFrames = referencePoses.length;
  const numJoints = referencePoses[0].length;
  const jointDisplacements = new Array(numJoints).fill(0);

  for (let j = 0; j < numJoints; j++) {
    let visibleCount = 0;

    for (let f = 0; f < numFrames; f++) {
      if (userVisibility[f][j] >= visibleThreshold) visibleCount++;
    }

    
    const visibilityRatio = visibleCount / numFrames;

    if (visibilityRatio < (1 - visibilityCutoffRatio)) {
      jointDisplacements[j] = 0;
      continue;
    }

    let sum = 0;
    for (let i = 1; i < numFrames; i++) {
      const visible = userVisibility[i][j] >= visibleThreshold && userVisibility[i - 1][j] >= visibleThreshold;
      if (!visible) continue;

      const prev = referencePoses[i - 1][j];
      const curr = referencePoses[i][j];
      const dx = curr[0] - prev[0];
      const dy = curr[1] - prev[1];
      const dz = curr[2] - prev[2];
      sum += Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    jointDisplacements[j] = sum;
  }

  console.log('Joint Displacements:', jointDisplacements);


  const total = jointDisplacements.reduce((a, b) => a + b, 0);
  return total === 0
    ? jointDisplacements.map(() => 1 / numJoints)
    : jointDisplacements.map(d => d / total);
}








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

  // // Compute weighted dot product
  // const dot = sum(mul(mul(weightsTensor, refTensor), userTensor));

  // Compute norms
  // const weightedRef = norm(mul(weightsTensor, refTensor));
  // const weightedUser = norm(mul(weightsTensor, userTensor));


  // console.log('dot:', dot.dataSync()[0]);
  // console.log('normRef:', normRef.dataSync()[0]);
  // console.log('normUser:', normUser.dataSync()[0]);


  // const similarity = dot.div(normRef.mul(normUser).add(1e-8));
  // const result = similarity.dataSync()[0];

   // ✅ Apply weights to both vectors
   const weightedRef = mul(weightsTensor, refTensor);
   const weightedUser = mul(weightsTensor, userTensor);
 
   // ✅ Compute dot product and norms
   const dot = sum(mul(weightedRef, weightedUser));
   const normRef = norm(weightedRef);                        
   const normUser = norm(weightedUser);  
 
  //  console.log('dot:', dot.dataSync()[0]);
  //  console.log('normRef:', normRef.dataSync()[0]);
  //  console.log('normUser:', normUser.dataSync()[0]);
 
   // ✅ Compute similarity
   const similarity = dot.div(normRef.mul(normUser).add(1e-8)); // avoid /0
   const result = similarity.dataSync()[0];

  dispose([refTensor, userTensor, weightsTensor, dot, weightedRef, weightedUser, similarity]);

  return result;
}
