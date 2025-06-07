# FitSync

FitSync is a real-time fitness web application that uses computer vision to provide instant feedback on exercise form by comparing user movements with reference poses. Using MediaPipe for pose detection and TensorFlow.js for similarity scoring, FitSync helps users refine their workout technique through visual and quantitative feedback.

## 🔥 Features

- 🎥 **Real-Time Pose Detection**: Uses MediaPipe to track 12 limb vectors from live webcam input.
- 🧠 **Pose Comparison Algorithm**: Custom scoring using weighted cosine similarity between user and reference poses.
- 📊 **Performance Feedback**: Instant numerical score displayed for each frame to assess form accuracy.
- 👤 **User Authentication**: Secure sign-in/sign-up powered by Supabase.
- 📈 **Progress Tracking**: Stores user scores, best attempts, and timestamps for long-term tracking.
- 🖥️ **Responsive UI**: Built with React, TypeScript, and Tailwind CSS


## 🚀 Tech Stack

### 🖥️ Frontend
- **React.js** – Component-based UI
- **TypeScript** – Type-safe JavaScript
- **Tailwind CSS** – Utility-first styling
- **Vite** – Fast build tool and dev server

### 🧠 Pose Detection & ML
- **MediaPipe (Pose)** – Real-time pose estimation
- **TensorFlow.js** – In-browser ML computations
- **Custom Algorithm** – Weighted cosine similarity for pose matching

### 🔐 Auth & Data
- **Supabase** – Authentication, real-time DB, and storage (PostgreSQL)

### 🌐 Backend
- **Node.js** – JavaScript runtime
- **Express.js** – API routing and scoring logic

### ☁️ Deployment
- **Vercel** – Frontend hosting
- **Render** – Backend deployment with CORS setup


