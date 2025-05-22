import { useEffect, useRef, useState } from 'react';
import { Camera } from '@mediapipe/camera_utils';
import { Pose } from '@mediapipe/pose';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

interface WorkoutTrackerProps {
  referenceVideo?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  exerciseName: string;
}

const WorkoutTracker = ({ referenceVideo, difficulty, exerciseName }: WorkoutTrackerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const referenceVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const referenceCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const { toast } = useToast();

  // Initialize reference video pose detection
  useEffect(() => {
    if (!referenceVideoRef.current || !referenceCanvasRef.current) return;

    const referencePose = new Pose({
      locateFile: (file) => {
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

      canvasCtx.save();
      canvasCtx.clearRect(0, 0, referenceCanvasRef.current.width, referenceCanvasRef.current.height);
      
      // Draw the video frame first
      canvasCtx.drawImage(results.image, 0, 0, referenceCanvasRef.current.width, referenceCanvasRef.current.height);
      
      // Draw pose landmarks if detected
      if (results.poseLandmarks) {
        drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
          color: '#4CAF50',  // Green color for reference pose
          lineWidth: 2,
        });
        drawLandmarks(canvasCtx, results.poseLandmarks, {
          color: '#2196F3',  // Blue color for reference landmarks
          lineWidth: 1,
        });
      }
      canvasCtx.restore();
    });

    // Process reference video frames
    const processReferenceFrame = async () => {
      if (referenceVideoRef.current && !referenceVideoRef.current.paused) {
        await referencePose.send({ image: referenceVideoRef.current });
        requestAnimationFrame(processReferenceFrame);
      }
    };

    referenceVideoRef.current.addEventListener('play', () => {
      requestAnimationFrame(processReferenceFrame);
    });

    return () => {
      referencePose.close();
    };
  }, []);

  // Initialize user video and pose detection
  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const initializeCamera = async () => {
      try {
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
            if (videoRef.current) {
              videoRef.current.play();
            }
          };
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setCameraError('Could not access camera. Please ensure you have granted camera permissions.');
        toast({
          title: "Camera Error",
          description: "Could not access camera. Please ensure you have granted camera permissions.",
          variant: "destructive",
        });
      }
    };

    if (isTracking) {
      initializeCamera();
    }

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isTracking, toast]);

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current || !isTracking) return;

    const pose = new Pose({
      locateFile: (file) => {
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

      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);
      
      if (results.poseLandmarks) {
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

    if (isTracking) {
      camera.start();
    }

    return () => {
      camera.stop();
      pose.close();
    };
  }, [isTracking]);

  const startTracking = () => {
    setIsTracking(true);
    toast({
      title: "Tracking Started",
      description: "Your workout is being tracked. Try to match the reference pose!",
    });
  };

  const stopTracking = () => {
    setIsTracking(false);
    toast({
      title: "Tracking Stopped",
      description: "Your workout session has ended.",
    });
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
              style={{ display: isTracking ? 'block' : 'none' }}
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
              width={640}
              height={480}
              style={{ display: isTracking ? 'block' : 'none' }}
            />
            {!isTracking && (
              <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Camera feed will appear here</p>
              </div>
            )}
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
                controls
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
          {!isTracking ? (
            <Button onClick={startTracking} className="bg-buddy-purple hover:bg-buddy-purple-dark">
              Start Workout
            </Button>
          ) : (
            <Button onClick={stopTracking} variant="destructive">
              Stop Workout
            </Button>
          )}
        </div>
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