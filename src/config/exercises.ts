interface ExerciseVideo {
  name: string;
  path: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const exerciseVideos: ExerciseVideo[] = [
  // Easy exercises
  {
    name: "Basic Squats",
    path: "../public/videos/basic_squats.mp4",
    difficulty: "easy"
  },
  {
    name: "Modified Push-Ups",
    path: "../public/videos/modified_pushups.mp4",
    difficulty: "easy"
  },
  {
    name: "Lunges",
    path: "/videos/exercises/easy/lunges.mp4",
    difficulty: "easy"
  },
  {
    name: "Planks",
    path: "/videos/exercises/easy/planks.mp4",
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
    name: "Split Lunges",
    path: "../public/videos/split_lunges.mp4",
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
    path: "/videos/exercises/hard/burpees.mp4",
    difficulty: "hard"
  },
  {
    name: "Pike Push-Ups",
    path: "/videos/exercises/hard/pike-pushups.mp4",
    difficulty: "hard"
  },
  {
    name: "Bulgarian Split Squats",
    path: "/videos/exercises/hard/bulgarian-split-squats.mp4",
    difficulty: "hard"
  },
  {
    name: "Handstand Practice",
    path: "/videos/exercises/hard/handstand.mp4",
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