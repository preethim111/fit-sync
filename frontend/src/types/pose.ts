export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export interface Pose {
  landmarks: Landmark[];
  timestamp: number;
}

export interface PoseAnalysisResult {
  similarity: number;
  jointWeights: number[];
  jointDisplacements: number[];
}

export interface PoseComparisonConfig {
  numJoints: number;
  epsilon?: number; // Small value to prevent division by zero
} 