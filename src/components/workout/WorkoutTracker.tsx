import React, { useCallback, useState, useEffect, useRef } from 'react';
import { Camera } from '@mediapipe/camera_utils';
import { Pose, Results } from '@mediapipe/pose';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useUser } from '@supabase/auth-helpers-react';
import { POSE_LANDMARKS } from '@mediapipe/pose';

interface WorkoutTrackerProps {
  referenceVideo?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  exerciseName: string;
}

// Only include upper-body and leg joints
const KEYPOINTS = [
  "LEFT_SHOULDER",
  "RIGHT_SHOULDER",
  "LEFT_ELBOW",
  "RIGHT_ELBOW",
  "LEFT_WRIST",
  "RIGHT_WRIST",
  "LEFT_HIP",
  "RIGHT_HIP",
  "LEFT_KNEE",
  "RIGHT_KNEE",
  "LEFT_ANKLE",
  "RIGHT_ANKLE"
] as const;

const FRAME_INTERVAL = 30; // Process every 30th frame (2 frames per second at 60fps)
let frameCount = 0;

const WorkoutTracker = ({ referenceVideo, difficulty, exerciseName }: WorkoutTrackerProps) => {
  console.log('WorkoutTracker initialized with:', { referenceVideo, difficulty, exerciseName });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const referenceVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const referenceCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isUserTracking, setIsUserTracking] = useState(false);
  const [isRefTracking, setIsRefTracking] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [userPoseSequence, setUserPoseSequence] = useState<any[][]>([]);
  const [referencePoseSequence, setReferencePoseSequence] = useState<any[][]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const user = useUser();
  console.log('User state:', user);
  const { toast } = useToast();

  // Initialize camera on mount
  useEffect(() => {
    console.log('Initializing camera on mount');
    if (!videoRef.current || !canvasRef.current) {
      console.log('User video or canvas not ready');
      return;
    }

    const initializeCamera = async () => {
      try {
        console.log('Requesting camera access');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            console.log('Camera stream loaded');
            if (videoRef.current) {
              videoRef.current.play();
            }
          };
        }
      } catch (err) {
        console.error('Camera access error:', err);
        setCameraError('Could not access camera. Please ensure you have granted camera permissions.');
        toast({
          title: "Camera Error",
          description: "Could not access camera. Please ensure you have granted camera permissions.",
          variant: "destructive",
        });
      }
    };

    initializeCamera();

    return () => {
      console.log('Cleaning up camera stream');
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);

  // Initialize reference video pose detection
  useEffect(() => {
    console.log('Initializing reference video pose detection');
    if (!referenceVideoRef.current || !referenceCanvasRef.current) {
      console.log('Reference video or canvas not ready');
      return;
    }

    const referencePose = new Pose({
      locateFile: (file) => {
        console.log('Loading MediaPipe file:', file);
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
      },
    });

    referencePose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: true,
      smoothSegmentation: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    referencePose.onResults((results) => {
      if (!referenceCanvasRef.current) return;
      const canvasCtx = referenceCanvasRef.current.getContext('2d');
      if (!canvasCtx) return;
      
      if (results.poseLandmarks && isRefTracking) {
        console.log('Reference pose detected, frame count:', frameCount);
        if (frameCount % FRAME_INTERVAL === 0) {
          console.log('Reference pose vector:', results.poseLandmarks);
          setReferencePoseSequence(prev => [...prev, results.poseLandmarks]);
        }
        frameCount++;
      }
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, referenceCanvasRef.current.width, referenceCanvasRef.current.height);
      canvasCtx.drawImage(results.image, 0, 0, referenceCanvasRef.current.width, referenceCanvasRef.current.height);
      
      if (results.poseLandmarks) {
        drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
          color: '#4CAF50',
          lineWidth: 2,
        });
        drawLandmarks(canvasCtx, results.poseLandmarks, {
          color: '#2196F3',
          lineWidth: 1,
        });
      }
      canvasCtx.restore();
    });

    // Process reference video frames
    const processReferenceFrame = async () => {
      if (referenceVideoRef.current && !referenceVideoRef.current.paused && isRefTracking) {
        await referencePose.send({ image: referenceVideoRef.current });
        requestAnimationFrame(processReferenceFrame);
      }
    };

    if (isRefTracking) {
      if (referenceVideoRef.current) {
        referenceVideoRef.current.play();
        requestAnimationFrame(processReferenceFrame);
      }
    } else {
      if (referenceVideoRef.current) {
        referenceVideoRef.current.pause();
      }
    }

    return () => {
      console.log('Cleaning up reference pose detection');
      referencePose.close();
    };
  }, [isRefTracking]);

  // Initialize user video and pose detection
  useEffect(() => {
    console.log('Initializing user video, isUserTracking:', isUserTracking);
    if (!videoRef.current || !canvasRef.current) {
      console.log('User video or canvas not ready');
      return;
    }

    const initializeCamera = async () => {
      try {
        console.log('Requesting camera access');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            console.log('Camera stream loaded');
            if (videoRef.current) {
              videoRef.current.play();
            }
          };
        }
      } catch (err) {
        console.error('Camera access error:', err);
        setCameraError('Could not access camera. Please ensure you have granted camera permissions.');
        toast({
          title: "Camera Error",
          description: "Could not access camera. Please ensure you have granted camera permissions.",
          variant: "destructive",
        });
      }
    };

    if (isUserTracking) {
      initializeCamera();
    } else {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    }

    return () => {
      console.log('Cleaning up camera stream');
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isUserTracking, toast]);

  useEffect(() => {
    console.log('Initializing user pose detection, isUserTracking:', isUserTracking);
    if (!videoRef.current || !canvasRef.current || !isUserTracking) return;

    const pose = new Pose({
      locateFile: (file) => {
        console.log('Loading MediaPipe file for user pose:', file);
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
      },
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: true,
      smoothSegmentation: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults((results) => {
      if (!canvasRef.current) return;
      const canvasCtx = canvasRef.current.getContext('2d');
      if (!canvasCtx) return;
      
      if (results.poseLandmarks && isUserTracking) {
        console.log('User pose detected, frame count:', frameCount);
        // Only collect landmarks every half second
        if (frameCount % FRAME_INTERVAL === 0) {
          console.log('Collecting user pose frame', results.poseLandmarks);
          setUserPoseSequence(prev => [...prev, results.poseLandmarks]);
        }
        frameCount++;
      }
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);
      
      if (results.poseLandmarks) {
        // Draw pose landmarks
        drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
          color: '#FF4081',  // Pink color for user pose
          lineWidth: 2,
        });
        drawLandmarks(canvasCtx, results.poseLandmarks, {
          color: '#FF0000',  // Red color for user landmarks
          lineWidth: 1,
        });
      }
      canvasCtx.restore();
    });

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current) {
          await pose.send({ image: videoRef.current });
        }
      },
      width: 640,
      height: 480,
    });

    if (isUserTracking) {
      console.log('Starting camera for pose detection');
      camera.start();
    }

    return () => {
      console.log('Cleaning up user pose detection');
      camera.stop();
      pose.close();
    };
  }, [isUserTracking]);

  const startTracking = () => {
    console.log('Starting workout tracking');
    setIsUserTracking(true);
    setIsRefTracking(true);
    setUserPoseSequence([]);
    setReferencePoseSequence([]);
    setScore(null);
    setBestScore(null);
    toast({
      title: "Tracking Started",
      description: "Your workout is being tracked. Try to match the reference pose!",
    });
  };

  const stopTracking = () => {
    console.log('Stopping workout tracking');
    setIsUserTracking(false);
    setIsRefTracking(false);
    if (referenceVideoRef.current) {
      referenceVideoRef.current.pause();
    }
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    toast({
      title: "Tracking Stopped",
      description: "Your workout session has ended.",
    });
  };

  // Helper to clean pose data
  function cleanPoseSequence(sequence: any[][]) {
    return sequence.map(frame =>
      frame.map(({ x, y, z }: any) => ({ x, y, z }))
    );
  }

  // Function to submit score
  async function submitScore() {
    console.log('Submitting score, user:', user);
    if (!user) {
      console.log('No user logged in');
      toast({ title: 'Not logged in', description: 'Please log in to submit your score.', variant: 'destructive' });
      return;
    }
    if (userPoseSequence.length === 0 || referencePoseSequence.length === 0) {
      console.log('No pose data available:', { userPoseSequenceLength: userPoseSequence.length, referencePoseSequenceLength: referencePoseSequence.length });
      toast({ title: 'No pose data', description: 'No pose data to submit.', variant: 'destructive' });
      return;
    }

    // Extract only the keypoints we care about
    const cleanedReference = referencePoseSequence.map(frame => {
      const landmarkDict: { [key: string]: [number, number, number] } = {};
      KEYPOINTS.forEach(keypoint => {
        const index = POSE_LANDMARKS[keypoint as keyof typeof POSE_LANDMARKS];
        const landmark = frame[index];
        if (landmark) {
          landmarkDict[keypoint] = [landmark.x, -landmark.y, -landmark.z];
        }
      });
      return Object.values(landmarkDict);
    });

    const cleanedUser = userPoseSequence.map(frame => {
      const landmarkDict: { [key: string]: [number, number, number] } = {};
      KEYPOINTS.forEach(keypoint => {
        const index = POSE_LANDMARKS[keypoint as keyof typeof POSE_LANDMARKS];
        const landmark = frame[index];
        if (landmark) {
          landmarkDict[keypoint] = [landmark.x, -landmark.y, -landmark.z];
        }
      });
      return Object.values(landmarkDict);
    });

    // Ensure both sequences have the same length
    const minLength = Math.min(cleanedReference.length, cleanedUser.length);
    const finalReference = cleanedReference.slice(0, minLength);
    const finalUser = cleanedUser.slice(0, minLength);

    console.log('Sending score request to backend');
    const res = await fetch('http://localhost:4000/api/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        reference_poses: finalReference,
        user_poses: finalUser,
        video_reference: referenceVideo,
        difficulty_level: difficulty
      })
    });

    if (!res.ok) {
      console.log('String response JSON:', await res.text());
      console.error('Score submission failed:', res.status);
      const { error } = await res.json();
      toast({ title: 'Error', description: error, variant: 'destructive' });
      return;
    }

    const { score, best_score } = await res.json();
    console.log('Score received:', { score, best_score });
    setScore(score);
    setBestScore(best_score);
    toast({ title: 'Score Submitted', description: `Your score: ${score}\nBest score: ${best_score}` });
  }

  const extractLandmarks = (results: Results) => {
    if (!results.poseLandmarks) return null;

    const landmarkDict: { [key: string]: [number, number, number] } = {};
    
    KEYPOINTS.forEach(keypoint => {
      const index = POSE_LANDMARKS[keypoint as keyof typeof POSE_LANDMARKS];
      const landmark = results.poseLandmarks[index];
      if (landmark) {
        landmarkDict[keypoint] = [landmark.x, -landmark.y, -landmark.z];
      }
    });

    return landmarkDict;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          {exerciseName} - {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <video
              ref={videoRef}
              className="w-full rounded-lg"
              playsInline
              style={{ display: 'block' }}
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
              width={640}
              height={480}
              style={{ display: 'block' }}
            />
            {cameraError && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-100 rounded-lg">
                <p className="text-red-600 text-center p-4">{cameraError}</p>
              </div>
            )}
          </div>
          {referenceVideo && (
            <div className="relative">
              <video
                ref={referenceVideoRef}
                src={referenceVideo}
                className="w-full rounded-lg"
                loop
                muted
                width={640}
                height={480}
              />
              <canvas
                ref={referenceCanvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                width={640}
                height={480}
              />
            </div>
          )}
        </div>

        <div className="flex justify-center space-x-4">
          {!isUserTracking && !isRefTracking ? (
            <Button onClick={startTracking} className="bg-buddy-purple hover:bg-buddy-purple-dark">
              Start Workout
            </Button>
          ) : (
            <Button onClick={stopTracking} variant="destructive">
              Stop Workout
            </Button>
          )}
          <Button 
            onClick={submitScore} 
            disabled={isUserTracking || isRefTracking || userPoseSequence.length === 0 || referencePoseSequence.length === 0}
          >
            Submit Score
          </Button>
        </div>
        {score !== null && bestScore !== null && (
          <div className="text-center mt-4">
            <p>Your score: <span className="font-bold">{score.toFixed(3)}</span></p>
            <p>Your best score: <span className="font-bold">{bestScore.toFixed(3)}</span></p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Helper functions for drawing landmarks
const drawConnectors = (
  ctx: CanvasRenderingContext2D,
  landmarks: any,
  connections: any,
  style: { color: string; lineWidth: number }
) => {
  const { color, lineWidth } = style;
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;

  for (const [i, j] of connections) {
    const start = landmarks[i];
    const end = landmarks[j];
    if (start && end) {
      ctx.beginPath();
      ctx.moveTo(start.x * ctx.canvas.width, start.y * ctx.canvas.height);
      ctx.lineTo(end.x * ctx.canvas.width, end.y * ctx.canvas.height);
      ctx.stroke();
    }
  }
};

const drawLandmarks = (
  ctx: CanvasRenderingContext2D,
  landmarks: any,
  style: { color: string; lineWidth: number }
) => {
  const { color, lineWidth } = style;
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;

  for (const landmark of landmarks) {
    ctx.beginPath();
    ctx.arc(
      landmark.x * ctx.canvas.width,
      landmark.y * ctx.canvas.height,
      lineWidth * 2,
      0,
      2 * Math.PI
    );
    ctx.stroke();
  }
};

// POSE_CONNECTIONS is a constant that defines which landmarks should be connected
const POSE_CONNECTIONS = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], // Arms
  [11, 23], [12, 24], [23, 24], // Torso
  [23, 25], [24, 26], [25, 27], [26, 28], // Legs
];

export default WorkoutTracker; 