import React, { useCallback, useState, useEffect, useRef } from 'react';
import { Results } from '@mediapipe/pose';
import { POSE_LANDMARKS } from '@mediapipe/pose';
import { useUser } from '@supabase/auth-helpers-react';
import { Pose } from '@mediapipe/pose';

interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  name: string;
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

const WorkoutTracker: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [userPoseSequence, setUserPoseSequence] = useState<PoseLandmark[][]>([]);
  const [referencePoseSequence, setReferencePoseSequence] = useState<PoseLandmark[][]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string>('');
  const user = useUser();
  const poseRef = useRef<Pose | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const initializePose = async () => {
      try {
        poseRef.current = new Pose({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
          }
        });

        await poseRef.current.initialize();

        poseRef.current.setOptions({
          modelComplexity: 2,
          smoothLandmarks: true,
          enableSegmentation: false,
          smoothSegmentation: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        poseRef.current.onResults(onPoseDetected);

        // Setup camera
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 }
        });
        if (cameraRef.current) {
          cameraRef.current.srcObject = stream;
          streamRef.current = stream;
        }
      } catch (error) {
        console.error('Error initializing pose detection:', error);
      }
    };

    initializePose();

    return () => {
      if (poseRef.current) {
        poseRef.current.close();
        poseRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

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

  const onPoseDetected = useCallback((results: Results) => {
    if (frameCount % FRAME_INTERVAL === 0) {
      const landmarks = extractLandmarks(results);
      if (landmarks && isRecording) {
        setUserPoseSequence(prev => [...prev, Object.values(landmarks).map(([x, y, z]) => ({ x, y, z, name: '' }))]);
      }
    }
    frameCount++;
  }, [isRecording]);

  const submitScore = async () => {
    if (!user || !referencePoseSequence.length || !userPoseSequence.length) {
      alert('Please ensure you have both reference and user pose data');
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/api/score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          reference_poses: referencePoseSequence,
          user_poses: userPoseSequence,
          video_reference: selectedVideo,
          difficulty_level: 'beginner'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Score response:', data);
      alert(`Your score: ${data.score.toFixed(2)}`);
    } catch (error) {
      console.error('Error submitting score:', error);
      alert('Error submitting score. Please try again.');
    }
  };

  return (
    <div>
      <video
        ref={videoRef}
        src={selectedVideo}
        style={{ width: '640px', height: '480px' }}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            videoRef.current.play();
          }
        }}
      />
      <video
        ref={cameraRef}
        style={{ width: '640px', height: '480px' }}
        autoPlay
        playsInline
      />
      <div>
        <button onClick={() => setIsRecording(!isRecording)}>
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
        <button onClick={submitScore} disabled={!userPoseSequence.length}>
          Submit Score
        </button>
      </div>
    </div>
  );
};

export default WorkoutTracker; 