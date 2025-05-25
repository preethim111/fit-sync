interface ExerciseVideo {
  name: string;
  path: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const exerciseVideos: ExerciseVideo[] = [
  // Easy exercises
  {
    name: "Basic Squats",
    path: "../public/videos/squat.mp4",
    difficulty: "easy"
  },
  {
    name: "Modified Push-Ups",
    path: "../public/videos/modified_pushups.mp4",
    difficulty: "easy"
  },
  {
    name: "Lunges",
    path: "../public/videos/lunges.mp4",
    difficulty: "easy"
  },
  {
    name: "Planks",
    path: "../public/videos/plank.mp4",
    difficulty: "easy"
  },

  // Medium exercises
  {
    name: "Jump Squats",
    path: "../public/videos/jump_squats.mp4",
    difficulty: "medium"
  },
  {
    name: "Push-Ups",
    path: "../public/videos/pushups.mp4",
    difficulty: "medium"
  },
  {
    name: "Jump Lunges",
    path: "../public/videos/jump_lunges.mp4",
    difficulty: "medium"
  },
  {
    name: "Side Planks",
    path: "../public/videos/side_plank.mp4",
    difficulty: "medium"
  },

  // Hard exercises
  {
    name: "Burpees",
    path: "../public/videos/burpees.mp4",
    difficulty: "hard"
  },
  {
    name: "Pike Push-Ups",
    path: "../public/videos/pike_pushups.mp4",
    difficulty: "hard"
  },
  {
    name: "Pistol Squats",
    path: "../public/videos/pistol_squats.mp4",
    difficulty: "hard"
  },
  {
    name: "Plank Reach Outs",
    path: "../public/videos/plank_reaches.mp4",
    difficulty: "hard"
  }
];

// Helper function to get videos by difficulty
export const getVideosByDifficulty = (difficulty: 'easy' | 'medium' | 'hard') => {
  return exerciseVideos.filter(video => video.difficulty === difficulty);
};

// Helper function to get a specific exercise video
export const getExerciseVideo = (name: string, difficulty: 'easy' | 'medium' | 'hard') => {
  return exerciseVideos.find(video => 
    video.name === name && video.difficulty === difficulty
  );
}; 