import numpy as np
from typing import List, Tuple, Dict
import json

class PoseSimilarityScorer:
    def __init__(self, num_joints: int = 33, epsilon: float = 1e-8):
        self.num_joints = num_joints
        self.epsilon = epsilon

    def calculate_joint_weights(self, reference_poses: List[List[Tuple[float, float, float]]]) -> np.ndarray:
        joint_displacements = np.zeros(self.num_joints)

        for j in range(self.num_joints):
            coords = np.array([frame[j] for frame in reference_poses])  # shape (T, 3)
            diffs = np.diff(coords, axis=0)  # (T-1, 3)
            displacements = np.linalg.norm(diffs, axis=1)  # (T-1,)
            joint_displacements[j] = np.sum(displacements)

        joint_weights = joint_displacements / np.sum(joint_displacements)
        return joint_weights

    def weighted_cosine_similarity(self, ref_vec: np.ndarray, user_vec: np.ndarray, weights: np.ndarray) -> float:
        dot = np.sum(weights * ref_vec * user_vec)
        norm_ref = np.linalg.norm(weights * ref_vec)
        norm_user = np.linalg.norm(weights * user_vec)
        return dot / (norm_ref * norm_user + self.epsilon)

    def compare_poses(self, reference_poses: List[List[Tuple[float, float, float]]], 
                     user_poses: List[List[Tuple[float, float, float]]]) -> Dict:
        # Calculate joint weights from reference poses
        joint_weights = self.calculate_joint_weights(reference_poses)
        
        # Convert poses to vectors
        ref_vec = self._poses_to_vector(reference_poses)
        user_vec = self._poses_to_vector(user_poses)
        
        # Calculate similarity
        similarity = self.weighted_cosine_similarity(ref_vec, user_vec, joint_weights)
        
        return {
            "similarity": float(similarity),
            "joint_weights": joint_weights.tolist(),
            "joint_displacements": (joint_weights * 100).tolist()  # Convert to percentage
        }

    def _poses_to_vector(self, poses: List[List[Tuple[float, float, float]]]) -> np.ndarray:
        coords = np.array(poses)  # shape (T, num_joints, 3)
        return np.mean(coords, axis=0).flatten()  # Average over time, then flatten

if __name__ == "__main__":
    # Example usage
    scorer = PoseSimilarityScorer()
    
    # Example data
    reference_poses = [
        [(0, 0, 0) for _ in range(33)],  # Frame 1
        [(1, 1, 1) for _ in range(33)]   # Frame 2
    ]
    
    user_poses = [
        [(0.1, 0.1, 0.1) for _ in range(33)],  # Frame 1
        [(1.1, 1.1, 1.1) for _ in range(33)]   # Frame 2
    ]
    
    result = scorer.compare_poses(reference_poses, user_poses)
    print(json.dumps(result, indent=2)) 